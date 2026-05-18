const content = document.getElementById('content');

function renderAccounts(malStatus, alStatus) {
  const malLoggedIn = malStatus?.loggedIn;
  const alLoggedIn  = alStatus?.loggedIn;

  content.innerHTML = `
    ${malLoggedIn ? `
    <div class="user-row">
      <div class="user-avatar">${malStatus.profile?.picture ? `<img src="${malStatus.profile.picture}" />` : (malStatus.profile?.name?.[0]?.toUpperCase() || 'M')}</div>
      <div>
        <div class="user-name">${malStatus.profile?.name || 'Usuário MAL'}</div>
        <div class="user-sub">MyAnimeList ✓</div>
      </div>
    </div>` : `
    <button class="btn" id="btn-mal-login">🔑 Entrar com MyAnimeList</button>`}

    ${alLoggedIn ? `
    <div class="user-row" style="margin-top:8px;">
      <div class="user-avatar" style="background:#02a9ff;">${alStatus.profile?.picture ? `<img src="${alStatus.profile.picture}" />` : (alStatus.profile?.name?.[0]?.toUpperCase() || 'A')}</div>
      <div>
        <div class="user-name">${alStatus.profile?.name || 'Usuário AniList'}</div>
        <div class="user-sub">AniList ✓</div>
      </div>
    </div>` : `
    <button class="btn" id="btn-al-login" style="background:#02a9ff;margin-top:8px;">🔑 Entrar com AniList</button>`}

    <hr class="divider" />

    <div class="status-row">
      <div class="dot ${malLoggedIn || alLoggedIn ? 'green' : 'gray'}"></div>
      <span id="page-st">Verificando página…</span>
    </div>

    <button class="btn" id="btn-gen" ${!malLoggedIn && !alLoggedIn ? 'disabled' : ''}>📸 Gerar Story desta página</button>
    <button class="btn secondary" id="btn-blank">Abrir gerador em branco</button>

    ${malLoggedIn || alLoggedIn ? `
    <hr class="divider" />
    ${malLoggedIn ? `<button class="btn danger" id="btn-mal-logout">Sair do MAL</button>` : ''}
    ${alLoggedIn  ? `<button class="btn danger" id="btn-al-logout" style="margin-top:6px;">Sair do AniList</button>` : ''}
    ` : ''}
  `;

  // Página atual
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = tabs[0]?.url || '';
    const isMal  = /myanimelist\.net\/(anime|manga)\/\d+/.test(url);
    const isAL   = /anilist\.co\/(anime|manga)\/\d+/.test(url);
    const st     = document.getElementById('page-st');
    const btnGen = document.getElementById('btn-gen');
    if (isMal)  { if(st) st.textContent = 'MyAnimeList detectado ✓'; }
    else if (isAL) { if(st) st.textContent = 'AniList detectado ✓'; }
    else { if(st) st.textContent = 'Acesse um anime/manga'; if(btnGen) btnGen.disabled = true; }
  });

  // Listeners
  document.getElementById('btn-mal-login')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-mal-login');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Aguarde…'; }
    chrome.runtime.sendMessage({ action: 'login' }, res => {
      if (res?.ok) location.reload();
      else { if(btn){btn.disabled=false;btn.textContent='🔑 Entrar com MyAnimeList';} alert('Erro: '+(res?.error||'tente novamente')); }
    });
  });

  document.getElementById('btn-al-login')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-al-login');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Aguarde…'; }
    chrome.runtime.sendMessage({ action: 'anilistLogin' }, res => {
      if (res?.ok) location.reload();
      else { if(btn){btn.disabled=false;btn.textContent='🔑 Entrar com AniList';} alert('Erro: '+(res?.error||'tente novamente')); }
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
