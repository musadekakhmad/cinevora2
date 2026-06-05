// ==================== src/router.js ====================

// 1. Fungsi Navigasi Global
export function navigateTo(path) {
  window.history.pushState({}, '', path);
  window.scrollTo({ top: 0, behavior: 'instant' });
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// 2. Fungsi Pengurai URL
export async function resolveRoute() {
  const appElement = document.getElementById('app');
  if (!appElement) return;

  // Panggil fungsi rute global yang terdaftar di window (milik main.js)
  if (typeof window.route === 'function') {
    await window.route();
    return;
  }

  appElement.innerHTML = '<div style="padding:2rem; text-align:center;">Loading Core Platform...</div>';
}

// 3. Inisialisasi Router (INI YANG DICARI VITE!)
export function initRouter() {
  window.removeEventListener('popstate', resolveRoute); 
  window.addEventListener('popstate', resolveRoute);

  document.removeEventListener('click', handleGlobalLinks);
  document.addEventListener('click', handleGlobalLinks);

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    resolveRoute();
  } else {
    window.addEventListener('DOMContentLoaded', resolveRoute);
  }
}

// Handler klik link internal [data-link]
function handleGlobalLinks(e) {
  const target = e.target.closest('a[data-link], a[href^="/"]');
  if (target) {
    const href = target.getAttribute('href');
    if (href === '/' || href === '') {
      if (typeof window.currentQuery !== 'undefined') window.currentQuery = null;
      if (typeof window.currentCategory !== 'undefined') window.currentCategory = 'trending';
      if (typeof window.currentGenreId !== 'undefined') window.currentGenreId = null;
    }
    e.preventDefault();
    navigateTo(href);
  }
}

// Pasang ke objek window agar aman diakses
window.navigateTo = navigateTo;
window.resolveRoute = resolveRoute;