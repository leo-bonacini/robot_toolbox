const Storage = (() => {
  const PREFIX = 'robot-toolbox:';

  function set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  }

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw != null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  }

  function getToolState(toolId) { return get(`tool:${toolId}`, {}); }
  function setToolState(toolId, state) { set(`tool:${toolId}`, state); }

  function getFavorites() { return get('favorites', []); }
  function toggleFavorite(toolId) {
    const favs = getFavorites();
    const idx = favs.indexOf(toolId);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.unshift(toolId);
    set('favorites', favs);
    return idx < 0;
  }
  function isFavorite(toolId) { return getFavorites().includes(toolId); }

  function getRecent() { return get('recent', []); }
  function addRecent(toolId) {
    const recent = getRecent().filter(id => id !== toolId);
    recent.unshift(toolId);
    set('recent', recent.slice(0, 10));
  }

  function getSettings() {
    return get('settings', { theme: 'system', language: 'en', precision: 4, units: 'metric', animations: true });
  }
  function updateSettings(partial) { set('settings', { ...getSettings(), ...partial }); }

  return { set, get, remove, getToolState, setToolState, getFavorites, toggleFavorite, isFavorite, getRecent, addRecent, getSettings, updateSettings };
})();
