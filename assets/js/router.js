const Router = (() => {
  const routes = {};
  let currentId = null;
  let cleanupFn = null;
  const listeners = [];

  function register(tool) {
    routes[tool.id] = tool;
  }

  function navigate(id, pushState = true) {
    id = id || 'home';
    if (!routes[id]) { id = 'home'; }

    if (cleanupFn) { try { cleanupFn(); } catch {} cleanupFn = null; }

    currentId = id;
    if (pushState) {
      history.pushState({ id }, '', `#/${id}`);
    }

    Storage.addRecent(id);
    Sidebar.setActive(id);

    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = '';
    content.classList.remove('animate-slide');
    void content.offsetWidth;
    content.classList.add('animate-slide');

    const tool = routes[id];
    cleanupFn = tool.init(content) || null;
    document.title = `${tool.name} — Robot Toolbox`;

    listeners.forEach(fn => fn(id, tool));
  }

  function init() {
    window.addEventListener('popstate', e => {
      const id = e.state?.id || parseHash();
      navigate(id, false);
    });

    const id = parseHash() || 'home';
    navigate(id, false);
  }

  function parseHash() {
    const hash = location.hash.replace('#/', '').replace('#', '');
    return hash || 'home';
  }

  function getCurrent() { return currentId; }
  function getRoute(id) { return routes[id]; }
  function getAllRoutes() { return Object.values(routes); }
  function onChange(fn) { listeners.push(fn); }

  return { register, navigate, init, getCurrent, getRoute, getAllRoutes, onChange };
})();
