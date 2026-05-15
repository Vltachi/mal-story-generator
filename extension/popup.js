const content = document.getElementById('content');

function renderLoggedIn(profile) {
  const name = profile?.name || 'Usuário MAL';
  const pic  = profile?.picture || '';

  const html = `
    <div class="user-row">
      <div class="user-avatar" id="av-wrap">
        ${pic ? '<img id="av-img" src="" alt="" />' : '<span>' + name[0].toUpperCase() + '</span>'}
      </div>
      <div>
        <div class="user-name">${name}</div>
        <div class="user-sub">Conectado ao MAL ✓</div>
      </div>
    </div>
    <div class="status-row">
      <div class="dot green"></div>
      <span id="page-st">Verificando…</span>
    </div>
    <button class="btn" id="btn-gen">📸 Gerar Story desta página</button>
    <button class="btn secondary" id="btn-blank">Abrir gerador em branco</button>
    <hr class="divider" />
    <button class="btn danger" id="btn-logout">Sair da conta MAL</button>
  `;
  content.innerHTML = html;

  if (pic) {
    document.getElementById('av-img').src = pic;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0] ? tabs[0].url : '';
    const isWork = /myanimelist\.net\/(anime|manga)\/\d+/.test(url);
    const stEl  = document.getElementById('page-st');
    const btnEl = document.getElementById('btn-gen');
    if (stEl) stEl.textContent = isWork ? 'Página MAL detectada ✓' : 'Acesse um anime/manga no MAL';
    if (!isWork && btnEl) btnEl.disabled = true;
  });

  document.getElementById('btn-gen').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const url = tabs[0] ? tabs[0].url : '';
      chrome.runtime.sendMessage({ action: 'fetchWorkData', url: url }, function() {
        chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
        window.close();
      });
    });
  });

  document.getElementById('btn-blank').addEventListener('click', function() {
    chrome.storage.local.remove('malStoryData', function() {
      chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
      window.close();
    });
  });

  document.getElementById('btn-logout').addEventListener('click', function() {
    chrome.storage.local.remove(
      ['mal_access_token','mal_refresh_token','mal_expires_at','malUserProfile'],
      function() { renderLoggedOut(); }
    );
  });
}

function renderLoggedOut() {
  content.innerHTML = `
    <div class="status-row">
      <div class="dot gray"></div>
      <span>Não conectado ao MyAnimeList</span>
    </div>
    <button class="btn" id="btn-login">🔑 Entrar com MyAnimeList</button>
    <button class="btn secondary" id="btn-blank">Abrir gerador em branco</button>
    <p class="hint">Faça login para preencher título,<br>capa, nota e episódios automaticamente.</p>
  `;

  document.getElementById('btn-login').addEventListener('click', function() {
    var btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.textContent = '⏳ Aguarde…';
    chrome.runtime.sendMessage({ action: 'login' }, function(res) {
      if (chrome.runtime.lastError) {
        btn.disabled = false;
        btn.textContent = '🔑 Entrar com MyAnimeList';
        alert('Erro: ' + chrome.runtime.lastError.message);
        return;
      }
      if (res && res.ok) {
        renderLoggedIn(res.profile);
      } else {
        btn.disabled = false;
        btn.textContent = '🔑 Entrar com MyAnimeList';
        alert('Erro no login: ' + (res ? res.error : 'Tente novamente.'));
      }
    });
  });

  document.getElementById('btn-blank').addEventListener('click', function() {
    chrome.storage.local.remove('malStoryData', function() {
      chrome.tabs.create({ url: chrome.runtime.getURL('generator.html') });
      window.close();
    });
  });
}

// Init — lê token direto do storage sem depender do service worker
chrome.storage.local.get(['mal_access_token','mal_expires_at','malUserProfile'], function(res) {
  var token     = res.mal_access_token;
  var expiresAt = res.mal_expires_at || 0;
  var profile   = res.malUserProfile;
  var valid     = token && Date.now() < expiresAt - 60000;
  if (valid) {
    renderLoggedIn(profile);
  } else {
    renderLoggedOut();
  }
});
