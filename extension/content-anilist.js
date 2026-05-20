// ── Anime Story Generator — content-anilist.js ──
(function () {
  'use strict';

  function getPageInfo() {
    const animeMatch = location.pathname.match(/\/anime\/(\d+)/);
    const mangaMatch = location.pathname.match(/\/manga\/(\d+)/);
    if (animeMatch) return { id: parseInt(animeMatch[1]), type: 'anime' };
    if (mangaMatch) return { id: parseInt(mangaMatch[1]), type: 'manga' };
    return null;
  }

  function injectButton() {
    if (document.getElementById('al-story-btn')) return;
    const info = getPageInfo();
    if (!info) return;

    const titleEl =
      document.querySelector('.header .title') ||
      document.querySelector('h1') ||
      document.querySelector('.content-header h1');
    if (!titleEl) return;

    const btn = document.createElement('button');
    btn.id = 'al-story-btn';
    btn.textContent = '📸 Gerar Story';
    btn.title = 'Gerar story para Instagram';

    btn.addEventListener('click', () => {
      const currentInfo = getPageInfo();
      if (!currentInfo) return;
      btn.textContent = '⏳ Carregando...';
      btn.disabled = true;
      chrome.runtime.sendMessage(
        { action: 'fetchAniListWorkData', mediaId: currentInfo.id, type: currentInfo.type },
        (res) => {
          btn.textContent = '📸 Gerar Story';
          btn.disabled = false;
          if (res?.ok) {
            chrome.runtime.sendMessage({ action: 'openGenerator' });
          } else if (res?.error === 'not_logged_in') {
            showLoginBanner();
          } else {
            chrome.runtime.sendMessage({ action: 'openGenerator' });
          }
        }
      );
    });

    titleEl.parentNode.insertBefore(btn, titleEl.nextSibling);
  }

  function watchForStatusChange() {
    const info = getPageInfo();
    if (!info) return;

    document.addEventListener('click', (e) => {
      const el = e.target.closest('li[data-value], .el-select-dropdown__item, [class*="statusOption"]');
      if (!el) return;
      const val = (el.dataset.value || el.textContent.trim()).toUpperCase();
      const validStatuses = ['COMPLETED','CURRENT','PAUSED','DROPPED'];
      if (validStatuses.includes(val)) {
        setTimeout(() => {
          chrome.runtime.sendMessage(
            { action: 'fetchAniListWorkData', mediaId: info.id, type: info.type },
            (res) => { if (res?.ok) showCompletedBanner(); }
          );
        }, 1200);
      }
    });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'showBanner') showCompletedBanner();
  });

  function showCompletedBanner() {
    if (document.getElementById('mal-story-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'mal-story-banner';
    banner.innerHTML = `
      <span>📸 Status atualizado! Gerar story?</span>
      <button id="mal-story-banner-btn">Gerar Story</button>
      <button id="mal-story-banner-close">✕</button>
    `;
    document.body.appendChild(banner);
    document.getElementById('mal-story-banner-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openGenerator' });
      banner.remove();
    });
    document.getElementById('mal-story-banner-close').addEventListener('click', () => banner.remove());
    setTimeout(() => banner?.remove(), 12000);
  }

  function showLoginBanner() {
    if (document.getElementById('mal-story-login-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'mal-story-login-banner';
    banner.innerHTML = `
      <span>🔒 Entre com AniList para preencher automaticamente.</span>
      <button id="mal-story-login-btn">Entrar com AniList</button>
      <button id="mal-story-login-close">✕</button>
    `;
    document.body.appendChild(banner);
    document.getElementById('mal-story-login-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'anilistLogin' }, (res) => {
        banner.remove();
        if (res?.ok) document.getElementById('al-story-btn')?.click();
      });
    });
    document.getElementById('mal-story-login-close').addEventListener('click', () => banner.remove());
    setTimeout(() => banner?.remove(), 10000);
  }

  // Observa mudanças de rota na SPA
  let lastPath = location.pathname;
  new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      document.getElementById('al-story-btn')?.remove();
      setTimeout(init, 800);
    }
  }).observe(document.body, { childList: true, subtree: true });

  function init() {
    injectButton();
    watchForStatusChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 800));
  } else {
    setTimeout(init, 800);
  }
})();
