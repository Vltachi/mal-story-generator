// ── Anime Story Generator — background.js v3 ──
// Suporte a MyAnimeList + AniList

// ════════════════════════════════
// MAL
// ════════════════════════════════
const MAL_CLIENT_ID = '12f3ad99d44b07e4ce3f7d7207788b9f';
const MAL_API_BASE  = 'https://api.myanimelist.net/v2';

// ════════════════════════════════
// ANILIST
// ════════════════════════════════
const AL_CLIENT_ID  = '41521';
const AL_AUTH_SERVER = 'https://mal-story-auth-server-production.up.railway.app';
const AL_REDIRECT_URI = chrome.identity.getRedirectURL('oauth-callback');
const AL_API          = 'https://graphql.anilist.co';

// ════════════════════════════════
// MAL — helpers
// ════════════════════════════════
function generateVerifier() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr   = new Uint8Array(128);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

async function malPostToken(params) {
  const res = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(params).toString(),
  });
  const text = await res.text();
  return { ok: res.ok, text };
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
    chrome.identity.launchWebAuthFlow({ url: authUrl.toString(), interactive: true }, async (redirectUrl) => {
      if (chrome.runtime.lastError || !redirectUrl) {
        await chrome.storage.local.remove(['pkce_verifier','pkce_redirect']);
        return reject(new Error(chrome.runtime.lastError?.message || 'Login cancelado'));
      }
      const code   = new URL(redirectUrl).searchParams.get('code');
      const stored = await chrome.storage.local.get(['pkce_verifier','pkce_redirect']);
      const res    = await malPostToken({
        client_id: MAL_CLIENT_ID, grant_type: 'authorization_code',
        code, redirect_uri: stored.pkce_redirect, code_verifier: stored.pkce_verifier,
      });
      await chrome.storage.local.remove(['pkce_verifier','pkce_redirect']);
      if (!res.ok) return reject(new Error('Token error: ' + res.text));
      const token = JSON.parse(res.text);
      await chrome.storage.local.set({
        mal_access_token: token.access_token, mal_refresh_token: token.refresh_token,
        mal_expires_at: Date.now() + token.expires_in * 1000,
      });
      resolve(token.access_token);
    });
  });
}

async function getMalToken() {
  const s = await chrome.storage.local.get(['mal_access_token','mal_refresh_token','mal_expires_at']);
  if (!s.mal_access_token) return null;
  if (Date.now() < s.mal_expires_at - 60000) return s.mal_access_token;
  const res = await malPostToken({ client_id: MAL_CLIENT_ID, grant_type: 'refresh_token', refresh_token: s.mal_refresh_token });
  if (!res.ok) { await chrome.storage.local.remove(['mal_access_token','mal_refresh_token','mal_expires_at']); return null; }
  const token = JSON.parse(res.text);
  await chrome.storage.local.set({ mal_access_token: token.access_token, mal_refresh_token: token.refresh_token, mal_expires_at: Date.now() + token.expires_in * 1000 });
  return token.access_token;
}

async function fetchMalUserProfile(token) {
  const res = await fetch(`${MAL_API_BASE}/users/@me?fields=name,picture`, { headers: { Authorization: `Bearer ${token}` } });
  return res.ok ? res.json() : null;
}

async function fetchMalWork(malId, type, token) {
  const fields = type === 'anime'
    ? 'title,main_picture,num_episodes,my_list_status{status,score,num_episodes_watched}'
    : 'title,main_picture,num_chapters,my_list_status{status,score,num_chapters_read}';
  const res = await fetch(`${MAL_API_BASE}/${type}/${malId}?fields=${fields}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.ok ? res.json() : null;
}

async function buildMalStoryData(data, type) {
  const score  = data.my_list_status?.score  || 0;
  const status = data.my_list_status?.status || 'completed';
  const isCompleted = status === 'completed';
  const isActive    = status === 'watching' || status === 'reading';
  const isHold      = status === 'on_hold';
  const isDropped   = status === 'dropped';
  let episodes = '';
  if (type === 'anime') {
    const total  = data.num_episodes || 0;
    const seen   = data.my_list_status?.num_episodes_watched || 0;
    if (isCompleted)                            episodes = total > 0 ? `${total} ep.` : '';
    else if (isActive && seen > 0)              episodes = total > 0 ? `ep. ${seen}/${total}` : `ep. ${seen}/?`;
    else if ((isHold || isDropped) && seen > 0) episodes = total > 0 ? `ep. ${seen}/${total}` : `ep. ${seen}/?`;
    else if (total > 0)                         episodes = `${total} ep.`;
  } else {
    const total  = data.num_chapters || 0;
    const read   = data.my_list_status?.num_chapters_read || 0;
    if (isCompleted)                            episodes = total > 0 ? `${total} ch.` : '';
    else if (isActive && read > 0)              episodes = total > 0 ? `ch. ${read}/${total}` : `ch. ${read}/?`;
    else if ((isHold || isDropped) && read > 0) episodes = total > 0 ? `ch. ${read}/${total}` : `ch. ${read}/?`;
    else if (total > 0)                         episodes = `${total} ch.`;
  }
  const stored    = await chrome.storage.local.get('malUserProfile');
  const avatarUrl = stored.malUserProfile?.picture || '';
  return { title: data.title, coverUrl: data.main_picture?.large || data.main_picture?.medium || '', episodes, score: score > 0 ? String(score) : '', avatarUrl, status, type, source: 'mal', scoreMax: 10 };
}

// ════════════════════════════════
// ANILIST — helpers
// ════════════════════════════════
async function anilistLogin() {
  // AniList authorization_code flow
  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${AL_CLIENT_ID}&redirect_uri=${encodeURIComponent(AL_REDIRECT_URI)}&response_type=code`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, async (redirectUrl) => {
      if (chrome.runtime.lastError || !redirectUrl) {
        return reject(new Error(chrome.runtime.lastError?.message || 'Login cancelado'));
      }

      // Tenta pegar code da query string
      let code;
      try {
        const url = new URL(redirectUrl);
        code = url.searchParams.get('code');
        // Fallback: tenta no hash
        if (!code && url.hash) {
          const hashParams = new URLSearchParams(url.hash.slice(1));
          code = hashParams.get('code');
          // Fallback2: token direto no hash (implicit)
          const accessToken = hashParams.get('access_token');
          if (!code && accessToken) {
            const expiresIn = parseInt(hashParams.get('expires_in') || '3600');
            await chrome.storage.local.set({
              al_access_token: accessToken,
              al_expires_at:   Date.now() + expiresIn * 1000,
            });
            return resolve(accessToken);
          }
        }
      } catch(e) {
        return reject(new Error('URL inválida: ' + redirectUrl));
      }

      if (!code) return reject(new Error('Código não recebido. URL: ' + redirectUrl));

      // Troca code por token via servidor intermediário (secret nunca exposto)
      const res = await fetch(`${AL_AUTH_SERVER}/anilist/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: AL_REDIRECT_URI,
        }),
      });

      const text = await res.text();
      console.log('[AL] token status:', res.status, text.slice(0, 200));

      if (!res.ok) return reject(new Error('Token error: ' + text));

      const token = JSON.parse(text);
      await chrome.storage.local.set({
        al_access_token:  token.access_token,
        al_refresh_token: token.refresh_token || '',
        al_expires_at:    Date.now() + (token.expires_in || 3600) * 1000,
      });
      resolve(token.access_token);
    });
  });
}

async function getAniListToken() {
  const s = await chrome.storage.local.get(['al_access_token','al_expires_at']);
  if (!s.al_access_token) return null;
  if (Date.now() < s.al_expires_at - 60000) return s.al_access_token;
  // Implicit flow não tem refresh — precisa logar de novo
  await chrome.storage.local.remove(['al_access_token','al_expires_at']);
  return null;
}

async function anilistQuery(query, variables, token) {
  const res = await fetch(AL_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify({ query, variables }),
  });
  return res.ok ? res.json() : null;
}

async function fetchAniListUserProfile(token) {
  const q = `query { Viewer { name avatar { large } } }`;
  const data = await anilistQuery(q, {}, token);
  if (!data?.data?.Viewer) return null;
  const v = data.data.Viewer;
  return { name: v.name, picture: v.avatar?.large || '' };
}

async function fetchAniListWork(mediaId, type, token) {
  const mediaType = type === 'anime' ? 'ANIME' : 'MANGA';
  const q = `
    query ($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        title { userPreferred }
        coverImage { extraLarge large }
        episodes
        chapters
        mediaListEntry {
          status
          score(format: POINT_100)
          progress
        }
      }
    }
  `;
  const data = await anilistQuery(q, { id: mediaId, type: mediaType }, token);
  return data?.data?.Media || null;
}

async function buildAniListStoryData(data, type) {
  const entry   = data.mediaListEntry;
  const score   = entry?.score || 0;
  const status  = (entry?.status || 'COMPLETED').toLowerCase();
  const progress = entry?.progress || 0;

  // Mapeia status AniList → padrão interno
  const statusMap = { completed: 'completed', current: 'watching', paused: 'on_hold', dropped: 'dropped', planning: 'plan_to_watch' };
  const mappedStatus = statusMap[status] || 'completed';

  let episodes = '';
  if (type === 'anime') {
    const total = data.episodes || 0;
    episodes = (mappedStatus === 'watching' && progress > 0 && total > 0) ? `${progress}/${total} eps` : total > 0 ? `${total} ep.` : '';
  } else {
    const total = data.chapters || 0;
    episodes = (mappedStatus === 'watching' && progress > 0 && total > 0) ? `${progress}/${total} caps` : total > 0 ? `${total} ch.` : '';
  }

  const stored    = await chrome.storage.local.get('alUserProfile');
  const avatarUrl = stored.alUserProfile?.picture || '';

  // Score AniList é 0-100 → converte para exibição
  const displayScore = score > 0 ? (score / 10).toFixed(1).replace('.0','') : '';

  return {
    title:    data.title?.userPreferred || '',
    coverUrl: data.coverImage?.extraLarge || data.coverImage?.large || '',
    episodes,
    score:    displayScore,
    avatarUrl,
    status:   mappedStatus,
    type,
    source:   'anilist',
    scoreMax: 10,
  };
}

// ════════════════════════════════
// MENSAGENS
// ════════════════════════════════
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === 'openGenerator') {
    chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
    return;
  }

  // ── MAL login ──
  if (msg.action === 'login') {
    malLogin()
      .then(token => fetchMalUserProfile(token))
      .then(profile => {
        chrome.storage.local.set({ malUserProfile: profile });
        sendResponse({ ok: true, profile, source: 'mal' });
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

  // ── AniList login ──
  if (msg.action === 'anilistLogin') {
    anilistLogin()
      .then(token => fetchAniListUserProfile(token))
      .then(profile => {
        chrome.storage.local.set({ alUserProfile: profile });
        sendResponse({ ok: true, profile, source: 'anilist' });
      })
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (msg.action === 'anilistLogout') {
    chrome.storage.local.remove(['al_access_token','al_expires_at','alUserProfile'], () => sendResponse({ ok: true }));
    return true;
  }

  // ── Status geral (ambas plataformas) ──
  if (msg.action === 'getStatus') {
    chrome.storage.local.get([
      'mal_access_token','mal_expires_at','malUserProfile',
      'al_access_token','al_expires_at','alUserProfile'
    ], res => {
      const malValid = res.mal_access_token && Date.now() < (res.mal_expires_at - 60000);
      const alValid  = res.al_access_token  && Date.now() < (res.al_expires_at  - 60000);
      sendResponse({
        mal: malValid ? { loggedIn: true, profile: res.malUserProfile } : { loggedIn: false },
        al:  alValid  ? { loggedIn: true, profile: res.alUserProfile  } : { loggedIn: false },
      });
    });
    return true;
  }

  // ── MAL fetch work ──
  if (msg.action === 'fetchWorkData') {
    const urlObj = new URL(msg.url);
    const animeM = urlObj.pathname.match(/\/anime\/(\d+)/);
    const mangaM = urlObj.pathname.match(/\/manga\/(\d+)/);
    const info   = animeM ? { id: animeM[1], type: 'anime' } : mangaM ? { id: mangaM[1], type: 'manga' } : null;
    if (!info) { sendResponse({ ok: false, error: 'no_id' }); return; }
    getMalToken().then(async token => {
      if (!token) return sendResponse({ ok: false, error: 'not_logged_in' });
      const data = await fetchMalWork(info.id, info.type, token);
      if (!data) return sendResponse({ ok: false, error: 'no_data' });
      const storyData = await buildMalStoryData(data, info.type);
      await chrome.storage.local.set({ malStoryData: storyData });
      sendResponse({ ok: true, data: storyData });
    });
    return true;
  }

  // ── AniList fetch work ──
  if (msg.action === 'fetchAniListWorkData') {
    getAniListToken().then(async token => {
      if (!token) return sendResponse({ ok: false, error: 'not_logged_in' });
      const data = await fetchAniListWork(msg.mediaId, msg.type, token);
      if (!data) return sendResponse({ ok: false, error: 'no_data' });
      const storyData = await buildAniListStoryData(data, msg.type);
      await chrome.storage.local.set({ malStoryData: storyData });
      sendResponse({ ok: true, data: storyData });
    });
    return true;
  }

  if (msg.action === 'workCompleted') {
    getMalToken().then(async token => {
      if (!token) { chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') }); return; }
      const data = await fetchMalWork(msg.malId, msg.type, token);
      if (!data) { chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') }); return; }
      const storyData = await buildMalStoryData(data, msg.type);
      await chrome.storage.local.set({ malStoryData: storyData });
      chrome.tabs.sendMessage(sender.tab.id, { action: 'showBanner' });
    });
    return true;
  }

});
