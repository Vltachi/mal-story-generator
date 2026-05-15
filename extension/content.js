// ── MAL Story Generator — content.js v2 ──
(function () {
  'use strict';

  // Extrai ID e tipo da URL
  function getPageInfo() {
    const animeMatch = location.pathname.match(/\/anime\/(\d+)/);
    const mangaMatch = location.pathname.match(/\/manga\/(\d+)/);
    if (animeMatch) return { id: animeMatch[1], type: 'anime' };
    if (mangaMatch) return { id: mangaMatch[1], type: 'manga' };
    return null;
  }

  // ── Injeta botão "Gerar Story" ao lado do título ──
  function injectButton() {
    if (document.getElementById('mal-story-btn')) return;
    const info = getPageInfo();
    if (!info) return;

    const titleEl =
      document.querySelector('h1.title-name strong') ||
      document.querySelector('h1[itemprop="name"]') ||
      document.querySelector('h1.title-name');
    if (!titleEl) return;

    const btn = document.createElement('button');
    btn.id = 'mal-story-btn';
    btn.textContent = '📸 Gerar Story';
    btn.title = 'Gerar story para Instagram';

    btn.addEventListener('click', () => {
      btn.textContent = '⏳ Carregando...';
      btn.disabled = true;

      chrome.runtime.sendMessage(
        { action: 'fetchWorkData', url: location.href },
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

  // ── Detecta mudança para Completed ──
  function watchForCompleted() {
    const info = getPageInfo();
    if (!info) return;

    // Ouve mudança no select de status
    // Mapa de status MAL (valor numérico → string)
    const STATUS_MAP = {
      '1': 'watching',
      '2': 'completed',
      '3': 'on_hold',
      '4': 'dropped',
      // 6 = plan_to_watch — ignoramos
    };

    document.addEventListener('change', (e) => {
      const t = e.target;
      const isStatusSelect =
        t.matches('#myinfo_status') ||
        t.matches('select[name="status"]') ||
        t.matches('.list-status-options select') ||
        t.id?.includes('status');

      const mapped = STATUS_MAP[t.value];
      if (isStatusSelect && mapped) {
        setTimeout(() => {
          chrome.runtime.sendMessage({
            action: 'workCompleted',
            malId:  info.id,
            type:   info.type,
          });
        }, 800);
      }
    });

    // Também observa mudanças no DOM para detectar UI dinâmica
    const observer = new MutationObserver(() => {
      // Detecta quando o status muda via AJAX (alguns fluxos do MAL)
      const statusEl = document.querySelector('.status-button.on.completed') ||
                       document.querySelector('[data-status="completed"]') ||
                       document.querySelector('.list-unit .status.completed');
      if (statusEl && !statusEl.dataset.storyDetected) {
        statusEl.dataset.storyDetected = '1';
        chrome.runtime.sendMessage({
          action: 'workCompleted',
          malId: info.id,
          type:  info.type,
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','data-status'] });
  }

  // ── Ouve mensagens do background ──
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'showBanner') showCompletedBanner();
  });

  // ── Banner de obra completada ──
  function showCompletedBanner() {
    if (document.getElementById('mal-story-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'mal-story-banner';
    banner.innerHTML = `
      <span>📸 Status atualizado! Gerar story?</span>
      <button id="mal-story-banner-btn">Gerar Story 📸</button>
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

  // ── Banner de login necessário ──
  function showLoginBanner() {
    if (document.getElementById('mal-story-login-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'mal-story-login-banner';
    banner.className = 'mal-story-login';
    banner.innerHTML = `
      <span>🔒 Faça login para preencher os dados automaticamente.</span>
      <button id="mal-story-login-btn">Entrar com MAL</button>
      <button id="mal-story-login-close">✕</button>
    `;
    document.body.appendChild(banner);
    document.getElementById('mal-story-login-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'login' }, (res) => {
        banner.remove();
        if (res?.ok) {
          // tenta de novo
          document.getElementById('mal-story-btn')?.click();
        }
      });
    });
    document.getElementById('mal-story-login-close').addEventListener('click', () => banner.remove());
    setTimeout(() => banner?.remove(), 10000);
  }

  // ── Init ──
  function init() {
    injectButton();
    watchForCompleted();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
