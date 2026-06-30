const Sidebar = (() => {
  const categories = [
    {
      id: 'kinematics', labelKey: 'nav.kinematics', icon: '⚙️',
      tools: ['rotation-converter', 'quaternion-toolbox', 'rotation-matrix', 'dh-calculator']
    },
    {
      id: 'motion', labelKey: 'nav.motion', icon: '🚗',
      tools: ['differential-drive', 'ackermann', 'mecanum', 'skid-steer']
    },
    {
      id: 'control', labelKey: 'nav.control', icon: '🎛️',
      tools: ['pid-tuner', 'motion-profile', 'trajectory-generator']
    },
    {
      id: 'math', labelKey: 'nav.math', icon: '📐',
      tools: ['matrix-calculator', 'covariance-visualizer', 'unit-converter']
    },
    {
      id: 'sensors', labelKey: 'nav.sensors', icon: '📡',
      tools: ['imu-noise']
    },
    {
      id: 'coordinates', labelKey: 'nav.coordinates', icon: '🌐',
      tools: ['coordinate-frame']
    },
    {
      id: 'vision', labelKey: 'nav.vision', icon: '👁️',
      tools: ['camera-fov']
    }
  ];

  function render() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    let html = '';

    html += `<a href="#/home" class="sidebar-item" data-tool="home" onclick="Router.navigate('home');return false;">
      <span class="item-icon">🏠</span>
      <span class="item-name" data-i18n="nav.home">Home</span>
    </a>`;

    const favs = Storage.getFavorites();
    if (favs.length > 0) {
      html += `<div class="sidebar-section" id="section-favorites">
        <div class="sidebar-section-header" onclick="Sidebar.toggleSection('favorites')">
          <span>⭐</span>
          <span data-i18n="nav.favorites">Favorites</span>
          <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="sidebar-section-items">`;
      favs.forEach(id => {
        const tool = Router.getRoute(id);
        if (tool) html += renderItem(tool);
      });
      html += `</div></div>`;
    }

    categories.forEach(cat => {
      const tools = cat.tools.map(id => Router.getRoute(id)).filter(Boolean);
      if (!tools.length) return;

      html += `<div class="sidebar-section" id="section-${cat.id}">
        <div class="sidebar-section-header" onclick="Sidebar.toggleSection('${cat.id}')">
          <span>${cat.icon}</span>
          <span data-i18n="${cat.labelKey}">${cat.id}</span>
          <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="sidebar-section-items">`;
      tools.forEach(tool => { html += renderItem(tool); });
      html += `</div></div>`;
    });

    nav.innerHTML = html;
    I18n.applyTranslations();
  }

  function renderItem(tool) {
    const isFav = Storage.isFavorite(tool.id);
    return `<a href="#/${tool.id}" class="sidebar-item" data-tool="${tool.id}"
      onclick="Router.navigate('${tool.id}');return false;">
      <span class="item-icon">${tool.icon || '🔧'}</span>
      <span class="item-name">${tool.name}</span>
      <span class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation();Sidebar.toggleFavorite('${tool.id}')" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
        ${isFav ? '★' : '☆'}
      </span>
    </a>`;
  }

  function setActive(id) {
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tool === id);
    });
  }

  function toggleSection(id) {
    const section = document.getElementById(`section-${id}`);
    if (section) section.classList.toggle('collapsed');
  }

  function toggleFavorite(toolId) {
    const added = Storage.toggleFavorite(toolId);
    Toast.show(I18n.t(added ? 'messages.addedFavorite' : 'messages.removedFavorite'), 'info');
    render();
    setActive(Router.getCurrent());
  }

  function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');
    const collapsed = document.body.classList.contains('sidebar-collapsed');
    if (window.innerWidth <= 768) {
      sidebar?.classList.toggle('open', !collapsed);
      overlay?.classList.toggle('visible', !collapsed);
    }
  }

  function init() {
    render();
    document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      if (document.getElementById('sidebar')?.classList.contains('open')) toggleSidebar();
    });
    Router.onChange((id) => { setActive(id); });
    I18n.onChange(() => render());
  }

  return { init, render, setActive, toggleSection, toggleFavorite, toggleSidebar };
})();
