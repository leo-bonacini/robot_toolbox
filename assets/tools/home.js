Router.register({
  id: 'home',
  name: 'Home',
  icon: '🏠',
  category: 'utilities',
  description: 'Dashboard and quick access to all tools',
  tags: ['home', 'dashboard'],

  init(container) {
    const allTools = Router.getAllRoutes().filter(t => t.id !== 'home');
    const recent = Storage.getRecent().filter(id => id !== 'home').map(id => Router.getRoute(id)).filter(Boolean).slice(0, 6);
    const favs = Storage.getFavorites().map(id => Router.getRoute(id)).filter(Boolean);

    const featuredIds = ['rotation-converter', 'pid-tuner', 'dh-calculator', 'unit-converter', 'trajectory-generator', 'matrix-calculator'];
    const featured = featuredIds.map(id => Router.getRoute(id)).filter(Boolean);

    container.innerHTML = `
      <div class="home-hero">
        <div class="home-hero-title">🤖 ${I18n.t('app.name')}</div>
        <div class="home-hero-subtitle">${I18n.t('app.tagline')}</div>
        <div class="home-hero-search">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="search" placeholder="${I18n.t('search.placeholder')}" autocomplete="off" oninput="if(this.value){Search.open();var i=document.getElementById('search-input');if(i){i.value=this.value;i.dispatchEvent(new Event('input'))}this.value=''}">
        </div>
      </div>

      <div class="home-quick-actions" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px">
        ${['rotation-converter','pid-tuner','unit-converter','matrix-calculator','camera-fov','dh-calculator'].map(id => {
          const t = Router.getRoute(id);
          if (!t) return '';
          return `<a href="#/${t.id}" class="btn btn-secondary" onclick="Router.navigate('${t.id}');return false;">${t.icon || '🔧'} ${t.name}</a>`;
        }).join('')}
      </div>

      ${recent.length ? `
      <div class="tools-section">
        <div class="tools-section-header">
          <span class="tools-section-title">🕐 Recent</span>
        </div>
        <div class="grid-auto">${recent.map(t => toolCard(t)).join('')}</div>
      </div>` : ''}

      ${favs.length ? `
      <div class="tools-section">
        <div class="tools-section-header">
          <span class="tools-section-title">⭐ Favorites</span>
        </div>
        <div class="grid-auto">${favs.map(t => toolCard(t)).join('')}</div>
      </div>` : ''}

      <div class="tools-section">
        <div class="tools-section-header">
          <span class="tools-section-title">⭐ Featured Tools</span>
        </div>
        <div class="grid-auto">${featured.map(t => toolCard(t)).join('')}</div>
      </div>

      <div class="tools-section">
        <div class="tools-section-header">
          <span class="tools-section-title">🔧 All Tools (${allTools.length})</span>
        </div>
        <div class="grid-auto">${allTools.map(t => toolCard(t)).join('')}</div>
      </div>

      <div class="card" style="margin-top:8px">
        <div class="card-body">
          <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">Keyboard Shortcuts</div>
              <div style="font-size:12px;color:var(--text-tertiary)">Use keyboard shortcuts to navigate quickly</div>
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--text-secondary)">
              <span><kbd>⌘K</kbd> Search</span>
              <span><kbd>H</kbd> Home</span>
              <span><kbd>⌘,</kbd> Settings</span>
              <span><kbd>?</kbd> All shortcuts</span>
              <span><kbd>Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </div>`;

    container.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        Router.navigate(el.dataset.nav);
      });
    });
  }
});

function toolCard(tool) {
  return `<div class="tool-card" data-nav="${tool.id}" onclick="Router.navigate('${tool.id}')">
    <div class="tool-card-icon">${tool.icon || '🔧'}</div>
    <div class="tool-card-content">
      <div class="tool-card-name">${tool.name}</div>
      <div class="tool-card-desc">${tool.description || ''}</div>
    </div>
  </div>`;
}
