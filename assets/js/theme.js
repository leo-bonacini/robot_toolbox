const Theme = (() => {
  let current = 'system';
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(theme) {
    current = theme;
    const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    updateToggleIcon(isDark);
    updateChartDefaults(isDark);
  }

  function updateToggleIcon(isDark) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  function updateChartDefaults(isDark) {
    if (typeof Chart === 'undefined') return;
    const textColor = isDark ? '#9b9db5' : '#525970';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    Chart.defaults.font.family = getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim();
  }

  function toggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    apply(next);
    Storage.updateSettings({ theme: next });
    current = next;
  }

  function init() {
    const settings = Storage.getSettings();
    apply(settings.theme || 'system');
    mediaQuery.addEventListener('change', () => { if (current === 'system') apply('system'); });
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  function getCurrent() { return current; }

  return { init, apply, toggle, getCurrent };
})();
