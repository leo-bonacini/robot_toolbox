const Keyboard = (() => {
  const shortcuts = [];

  function register(combo, handler, description = '') {
    shortcuts.push({ combo: combo.toLowerCase(), handler, description });
  }

  function parseCombo(e) {
    const parts = [];
    if (e.metaKey || e.ctrlKey) parts.push('mod');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    const key = e.key.toLowerCase();
    if (key !== 'control' && key !== 'meta' && key !== 'shift' && key !== 'alt') parts.push(key);
    return parts.join('+');
  }

  function init() {
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      const combo = parseCombo(e);
      for (const sc of shortcuts) {
        if (sc.combo === combo) {
          e.preventDefault();
          sc.handler(e);
          return;
        }
      }
    });

    register('mod+k', () => Search.open(), 'Open Search');
    register('mod+/', () => Search.open(), 'Open Search');
    register('escape', () => {
      if (Search.isOpen()) Search.close();
    }, 'Close / Go back');
    register('mod+,', () => Modals.openSettings(), 'Open Settings');
    register('?', () => Modals.openShortcuts(), 'Show Keyboard Shortcuts');
    register('h', () => Router.navigate('home'), 'Go Home');
  }

  function getShortcuts() { return shortcuts; }

  return { init, register, getShortcuts };
})();
