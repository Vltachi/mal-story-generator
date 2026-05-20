// ── i18n ──
const LANG = {
  en: {
    malUser: 'MAL User', alUser: 'AniList User',
    loginMal: '🔑 Sign in with MyAnimeList',
    loginAl: '🔑 Sign in with AniList',
    checking: 'Checking page…',
    malDetected: 'MyAnimeList detected ✓',
    alDetected: 'AniList detected ✓',
    visitPage: 'Visit an anime/manga page',
    generate: '📸 Generate Story',
    blank: 'Open blank generator',
    logoutMal: 'Sign out of MAL',
    logoutAl: 'Sign out of AniList',
    waiting: '⏳ Please wait…',
    error: 'Error: ',
    donate: '☕ Like it? Support the project',
    updateAvail: '🆕 v{v} available!',
    updateSee: 'See →',
    pixTitle: 'Pix',
    braveTip: '⚠️ Using Brave? If you see a reCAPTCHA error, just click OK and then Allow again.',
  },
  pt: {
    malUser: 'Usuário MAL', alUser: 'Usuário AniList',
    loginMal: '🔑 Entrar com MyAnimeList',
    loginAl: '🔑 Entrar com AniList',
    checking: 'Verificando página…',
    malDetected: 'MyAnimeList detectado ✓',
    alDetected: 'AniList detectado ✓',
    visitPage: 'Acesse um anime/manga',
    generate: '📸 Gerar Story desta página',
    blank: 'Abrir gerador em branco',
    logoutMal: 'Sair do MAL',
    logoutAl: 'Sair do AniList',
    waiting: '⏳ Aguarde…',
    error: 'Erro: ',
    donate: '☕ Gostou? Apoie o projeto',
    updateAvail: '🆕 v{v} disponível!',
    updateSee: 'Ver →',
    pixTitle: 'Pix',
    braveTip: '⚠️ Usando Brave? Se aparecer erro de reCAPTCHA, clique em OK e depois em Permitir novamente.',
  }
};

let currentLang = localStorage.getItem('asg_lang') || 'en';
const t = () => LANG[currentLang];

function applyLang() {
  const btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = currentLang === 'en' ? 'BR' : 'EN';
  const donateText = document.querySelector('.donate-text');
  if (donateText) donateText.textContent = t().donate;
  const pixTitle = document.querySelector('.pix-title');
  if (pixTitle) pixTitle.textContent = t().pixTitle;
}

const content = document.getElementById('content');

function renderAccounts(malStatus, alStatus) {
  const malLoggedIn = malStatus?.loggedIn;
  const alLoggedIn  = alStatus?.loggedIn;

  content.innerHTML = `
    ${malLoggedIn ? `
    <div class="user-row">
      <div class="user-avatar">${malStatus.profile?.picture ? `<img src="${malStatus.profile.picture}" />` : (malStatus.profile?.name?.[0]?.toUpperCase() || 'M')}</div>
      <div>
        <div class="user-name">${malStatus.profile?.name || t().malUser}</div>
        <div class="user-sub">MyAnimeList ✓</div>
      </div>
    </div>` : `
    <button class="btn" id="btn-mal-login">${t().loginMal}</button>
    <p style="font-size:10px;color:rgba(255,255,255,0.25);margin-top:-4px;margin-bottom:8px;line-height:1.5;">${t().braveTip}</p>`}

    ${alLoggedIn ? `
    <div class="user-row" style="margin-top:8px;">
      <div class="user-avatar" style="background:#02a9ff;">${alStatus.profile?.picture ? `<img src="${alStatus.profile.picture}" />` : (alStatus.profile?.name?.[0]?.toUpperCase() || 'A')}</div>
      <div>
        <div class="user-name">${alStatus.profile?.name || t().alUser}</div>
        <div class="user-sub">AniList ✓</div>
      </div>
    </div>` : `
    <button class="btn" id="btn-al-login" style="background:#02a9ff;margin-top:8px;">${t().loginAl}</button>`}

    <hr class="divider" />

    <div class="status-row">
      <div class="dot ${malLoggedIn || alLoggedIn ? 'green' : 'gray'}"></div>
      <span id="page-st">${t().checking}</span>
    </div>

    <button class="btn" id="btn-gen" ${!malLoggedIn && !alLoggedIn ? 'disabled' : ''}>${t().generate}</button>
    <button class="btn secondary" id="btn-blank">${t().blank}</button>

    ${malLoggedIn || alLoggedIn ? `
    <hr class="divider" />
    ${malLoggedIn ? `<button class="btn danger" id="btn-mal-logout">${t().logoutMal}</button>` : ''}
    ${alLoggedIn  ? `<button class="btn danger" id="btn-al-logout" style="margin-top:6px;">${t().logoutAl}</button>` : ''}
    ` : ''}
  `;

  // Página atual
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = tabs[0]?.url || '';
    const isMal  = /myanimelist\.net\/(anime|manga)\/\d+/.test(url);
    const isAL   = /anilist\.co\/(anime|manga)\/\d+/.test(url);
    const st     = document.getElementById('page-st');
    const btnGen = document.getElementById('btn-gen');
    if (isMal)  { if(st) st.textContent = t().malDetected; }
    else if (isAL) { if(st) st.textContent = t().alDetected; }
    else { if(st) st.textContent = t().visitPage; if(btnGen) btnGen.disabled = true; }
  });

  // Listeners
  document.getElementById('btn-mal-login')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-mal-login');
    if (btn) { btn.disabled = true; btn.textContent = t().waiting; }

    chrome.runtime.sendMessage({ action: 'login' }, res => {
      document.getElementById('brave-tip')?.remove();
      if (res?.ok) location.reload();
      else { if(btn){btn.disabled=false;btn.textContent=t().loginMal;} alert(t().error+(res?.error||'try again')); }
    });
  });

  document.getElementById('btn-al-login')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-al-login');
    if (btn) { btn.disabled = true; btn.textContent = t().waiting; }
    chrome.runtime.sendMessage({ action: 'anilistLogin' }, res => {
      if (res?.ok) location.reload();
      else { if(btn){btn.disabled=false;btn.textContent=t().loginAl;} alert(t().error+(res?.error||'try again')); }
    });
  });

  document.getElementById('btn-gen')?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const url = tabs[0]?.url || '';
      const isMal = /myanimelist\.net\/(anime|manga)\/\d+/.test(url);
      const isAL  = /anilist\.co\/(anime|manga)\/\d+/.test(url);
      if (isMal) {
        chrome.runtime.sendMessage({ action: 'fetchWorkData', url }, () => {
          chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
          window.close();
        });
      } else if (isAL) {
        const m = url.match(/\/(anime|manga)\/(\d+)/);
        if (m) {
          chrome.runtime.sendMessage({ action: 'fetchAniListWorkData', mediaId: parseInt(m[2]), type: m[1] }, () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
            window.close();
          });
        }
      } else {
        chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
        window.close();
      }
    });
  });

  document.getElementById('btn-blank')?.addEventListener('click', () => {
    chrome.storage.local.remove('malStoryData', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
      window.close();
    });
  });

  document.getElementById('btn-mal-logout')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'logout' }, () => location.reload());
  });

  document.getElementById('btn-al-logout')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'anilistLogout' }, () => location.reload());
  });
}

// Init
chrome.runtime.sendMessage({ action: 'getStatus' }, res => {
  renderAccounts(res?.mal, res?.al);
  applyLang();
});

// Toggle idioma
document.getElementById('btn-lang').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'pt' : 'en';
  localStorage.setItem('asg_lang', currentLang);
  chrome.runtime.sendMessage({ action: 'getStatus' }, res => {
    renderAccounts(res?.mal, res?.al);
    applyLang();
  });
});

// Checar update disponível
chrome.storage.local.get('updateAvailable', data => {
  if (data.updateAvailable) {
    const bar = document.createElement('div');
    bar.style.cssText = 'background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.3);border-radius:8px;padding:8px 12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;';
    bar.innerHTML = `
      <span style="font-size:11px;color:rgba(255,255,255,0.7);">${t().updateAvail.replace('{v}', data.updateAvailable)}</span>
      <a href="https://github.com/Vltachi/mal-story-generator/releases/latest" target="_blank" style="font-size:11px;font-weight:700;color:#facc15;text-decoration:none;white-space:nowrap;">${t().updateSee}</a>
    `;
    document.body.insertBefore(bar, document.getElementById('content'));
  }
});

// Donate
document.getElementById('btn-pix').addEventListener('click', () => {
  document.getElementById('pix-modal').classList.add('open');
});
document.getElementById('pix-close').addEventListener('click', () => {
  document.getElementById('pix-modal').classList.remove('open');
});
document.getElementById('pix-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});
document.getElementById('btn-kofi').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://ko-fi.com/vitachi' });
});
