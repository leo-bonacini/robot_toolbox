const Toast = (() => {
  function show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }
  return { show };
})();

const App = {
  init() {
    Storage.getSettings();
    Theme.init();
    I18n.init();

    Sidebar.init();
    Modals.init();
    Keyboard.init();

    const tools = Router.getAllRoutes();
    Search.init(tools);

    document.getElementById('lang-selector')?.addEventListener('change', e => {
      I18n.setLocale(e.target.value);
    });

    document.querySelector('.home-hero-search input')?.addEventListener('input', function() {
      if (this.value.trim()) {
        Search.open();
        const input = document.getElementById('search-input');
        if (input) { input.value = this.value; input.dispatchEvent(new Event('input')); }
        this.value = '';
      }
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }

    Router.init();
    console.log('%c Robot Toolbox %c v1.0 ', 'background:#5865f2;color:white;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:bold', 'background:#18181e;color:#9b9db5;padding:2px 6px;border-radius:0 4px 4px 0');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
