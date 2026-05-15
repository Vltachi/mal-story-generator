// ── MAL Story Generator — background.js ──

const MAL_CLIENT_ID = '12f3ad99d44b07e4ce3f7d7207788b9f';
const MAL_API_BASE  = 'https://api.myanimelist.net/v2';

function generateVerifier() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr   = new Uint8Array(128);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

async function postToken(params) {
  const res = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(params).toString(),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

async function malLogin() {
  const verifier    = generateVerifier();
  const redirectUri = chrome.identity.getRedirectURL('oauth-callback');

  await chrome.storage.local.set({ pkce_verifier: verifier, pkce_redirect: redirectUri });

  const authUrl = new URL('https://myanimelist.net/v1/oauth2/authorize');
  authUrl.searchParams.set('response_type',         'code');
  authUrl.searchParams.set('client_id',             MAL_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri',          redirectUri);
  authUrl.searchParams.set('code_challenge',        verifier);
  authUrl.searchParams.set('code_challenge_method', 'plain');

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          await chrome.storage.local.remove(['pkce_verifier','pkce_redirect']);
          return reject(new Error(chrome.runtime.lastError?.message || 'Login cancelado'));
        }
        let code;
        try { code = new URL(redirectUrl).searchParams.get('code'); }
        catch(e) { return reject(new Error('URL inválida')); }
        if (!code) return reject(new Error('Código não recebido'));

        const stored = await chrome.storage.local.get(['pkce_verifier','pkce_redirect']);
        let res;
        try {
          res = await postToken({
            client_id:     MAL_CLIENT_ID,
            grant_type:    'authorization_code',
            code,
            redirect_uri:  stored.pkce_redirect,
            code_verifier: stored.pkce_verifier,
          });
        } catch(e) { return reject(new Error('Fetch: ' + e.message)); }

        await chrome.storage.local.remove(['pkce_verifier','pkce_redirect']);
        if (!res.ok) return reject(new Error('Token error: ' + res.text));

        const token = JSON.parse(res.text);
        await chrome.storage.local.set({
          mal_access_token:  token.access_token,
          mal_refresh_token: token.refresh_token,
          mal_expires_at:    Date.now() + token.expires_in * 1000,
        });
        resolve(token.access_token);
      }
    );
  });
}

async function getToken() {
  const s = await chrome.storage.local.get(['mal_access_token','mal_refresh_token','mal_expires_at']);
  if (!s.mal_access_token) return null;
  if (Date.now() < s.mal_expires_at - 60000) return s.mal_access_token;
  try {
    const res = await postToken({
      client_id:     MAL_CLIENT_ID,
      grant_type:    'refresh_token',
      refresh_token: s.mal_refresh_token,
    });
    if (!res.ok) {
      await chrome.storage.local.remove(['mal_access_token','mal_refresh_token','mal_expires_at']);
      return null;
    }
    const token = JSON.parse(res.text);
    await chrome.storage.local.set({
      mal_access_token:  token.access_token,
      mal_refresh_token: token.refresh_token,
      mal_expires_at:    Date.now() + token.expires_in * 1000,
    });
    return token.access_token;
  } catch(e) { return null; }
}

async function fetchUserProfile(token) {
  const res = await fetch(`${MAL_API_BASE}/users/@me?fields=name,picture`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.ok ? res.json() : null;
}

async function fetchWork(malId, type, token) {
  const fields = type === 'anime'
    ? 'title,main_picture,num_episodes,my_list_status{status,score,num_episodes_watched}'
    : 'title,main_picture,num_chapters,my_list_status{status,score,num_chapters_read}';
  const res = await fetch(`${MAL_API_BASE}/${type}/${malId}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.ok ? res.json() : null;
}

async function buildStoryData(data, type) {
  const score  = data.my_list_status?.score  || 0;
  const status = data.my_list_status?.status || 'completed';

  // eps assistidos vs total para Watching
  let episodes = '';
  if (type === 'anime') {
    const total    = data.num_episodes || 0;
    const watched  = data.my_list_status?.num_episodes_watched || 0;
    if (status === 'watching' && watched > 0 && total > 0) {
      episodes = `${watched}/${total} eps`;
    } else if (total > 0) {
      episodes = `${total} eps`;
    }
  } else {
    const total   = data.num_chapters || 0;
    const readChs = data.my_list_status?.num_chapters_read || 0;
    if (status === 'watching' && readChs > 0 && total > 0) {
      episodes = `${readChs}/${total} caps`;
    } else if (total > 0) {
      episodes = `${total} caps`;
    }
  }

  // Foto de perfil do usuário logado
  const stored    = await chrome.storage.local.get('malUserProfile');
  const avatarUrl = stored.malUserProfile?.picture || '';

  return {
    title:    data.title,
    coverUrl: data.main_picture?.large || data.main_picture?.medium || '',
    episodes,
    score:    score > 0 ? String(score) : '',
    avatarUrl,
    status,
    type,
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openGenerator') {
    chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
    return;
  }

  if (msg.action === 'login') {
    malLogin()
      .then(token => fetchUserProfile(token))
      .then(profile => {
        chrome.storage.local.set({ malUserProfile: profile });
        sendResponse({ ok: true, profile });
      })
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (msg.action === 'logout') {
    chrome.storage.local.remove(
      ['mal_access_token','mal_refresh_token','mal_expires_at','malUserProfile'],
      () => sendResponse({ ok: true })
    );
    return true;
  }

  if (msg.action === 'fetchWorkData') {
    const urlObj = new URL(msg.url);
    const animeM = urlObj.pathname.match(/\/anime\/(\d+)/);
    const mangaM = urlObj.pathname.match(/\/manga\/(\d+)/);
    const info   = animeM ? { id: animeM[1], type: 'anime' }
                 : mangaM ? { id: mangaM[1], type: 'manga' } : null;
    if (!info) { sendResponse({ ok: false, error: 'no_id' }); return; }

    getToken().then(async token => {
      if (!token) return sendResponse({ ok: false, error: 'not_logged_in' });
      const data = await fetchWork(info.id, info.type, token);
      if (!data) return sendResponse({ ok: false, error: 'no_data' });
      const storyData = await buildStoryData(data, info.type);
      await chrome.storage.local.set({ malStoryData: storyData });
      sendResponse({ ok: true, data: storyData });
    });
    return true;
  }

  if (msg.action === 'workCompleted') {
    getToken().then(async token => {
      if (!token) { chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') }); return; }
      const data = await fetchWork(msg.malId, msg.type, token);
      if (!data) { chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') }); return; }
      const storyData = await buildStoryData(data, msg.type);
      await chrome.storage.local.set({ malStoryData: storyData });
      chrome.tabs.sendMessage(sender.tab.id, { action: 'showBanner' });
    });
    return true;
  }
});
