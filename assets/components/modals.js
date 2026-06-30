const Modals = (() => {
  function openSettings() {
    const modal = document.getElementById('settings-modal');
    const body = document.getElementById('settings-body');
    if (!modal || !body) return;

    const s = Storage.getSettings();

    body.innerHTML = `
      <div class="setting-row">
        <div><div class="setting-label" data-i18n="settings.theme">${I18n.t('settings.theme')}</div></div>
        <div class="setting-control">
          <select id="set-theme" class="select" style="min-width:120px">
            <option value="system" ${s.theme==='system'?'selected':''}>${I18n.t('settings.themeSystem')}</option>
            <option value="light" ${s.theme==='light'?'selected':''}>${I18n.t('settings.themeLight')}</option>
            <option value="dark" ${s.theme==='dark'?'selected':''}>${I18n.t('settings.themeDark')}</option>
          </select>
        </div>
      </div>
      <div class="setting-row">
        <div><div class="setting-label" data-i18n="settings.language">${I18n.t('settings.language')}</div></div>
        <div class="setting-control">
          <select id="set-lang" class="select" style="min-width:120px">
            <option value="en" ${s.language==='en'?'selected':''}> English</option>
            <option value="pt" ${s.language==='pt'?'selected':''}>Português</option>
            <option value="es" ${s.language==='es'?'selected':''}>Español</option>
          </select>
        </div>
      </div>
      <div class="setting-row">
        <div><div class="setting-label" data-i18n="settings.precision">${I18n.t('settings.precision')}</div>
          <div class="setting-desc">Number of decimal places in results</div></div>
        <div class="setting-control">
          <input type="number" id="set-precision" class="input" min="1" max="12" value="${s.precision}" style="width:80px">
        </div>
      </div>
      <div class="setting-row">
        <div><div class="setting-label" data-i18n="settings.units">${I18n.t('settings.units')}</div></div>
        <div class="setting-control">
          <select id="set-units" class="select" style="min-width:140px">
            <option value="metric" ${s.units==='metric'?'selected':''}>${I18n.t('settings.unitsMetric')}</option>
            <option value="imperial" ${s.units==='imperial'?'selected':''}>${I18n.t('settings.unitsImperial')}</option>
          </select>
        </div>
      </div>
      <div class="setting-row">
        <div><div class="setting-label" data-i18n="settings.animations">${I18n.t('settings.animations')}</div></div>
        <div class="setting-control">
          <label class="toggle">
            <input type="checkbox" id="set-animations" ${s.animations?'checked':''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      <div style="margin-top:20px;display:flex;gap:10px">
        <button class="btn btn-primary" onclick="Modals.saveSettings()">${I18n.t('settings.save')}</button>
        <button class="btn btn-secondary" onclick="Modals.closeAll()">${I18n.t('actions.close')}</button>
      </div>`;

    openModal('settings-modal');
  }

  function saveSettings() {
    const theme = document.getElementById('set-theme')?.value;
    const language = document.getElementById('set-lang')?.value;
    const precision = parseInt(document.getElementById('set-precision')?.value) || 4;
    const units = document.getElementById('set-units')?.value;
    const animations = document.getElementById('set-animations')?.checked;

    Storage.updateSettings({ theme, language, precision, units, animations });
    if (theme) Theme.apply(theme);
    if (language) {
      I18n.setLocale(language);
      const langSel = document.getElementById('lang-selector');
      if (langSel) langSel.value = language;
    }
    closeAll();
    Toast.show(I18n.t('settings.save') + ' ✓', 'success');
  }

  function openShortcuts() {
    const modal = document.getElementById('settings-modal');
    const body = document.getElementById('settings-body');
    const header = modal?.querySelector('.modal-header h2');
    if (!modal || !body) return;
    if (header) header.textContent = 'Keyboard Shortcuts';

    const scs = Keyboard.getShortcuts();
    body.innerHTML = `<div class="table-wrapper">
      <table><thead><tr><th>Shortcut</th><th>Action</th></tr></thead><tbody>
        ${scs.map(sc => `<tr>
          <td><kbd>${sc.combo.replace('mod', '⌘/Ctrl')}</kbd></td>
          <td class="text-secondary">${sc.description}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>
    <div style="margin-top:16px"><button class="btn btn-secondary" onclick="Modals.closeAll()">Close</button></div>`;

    openModal('settings-modal');
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    el.removeAttribute('aria-hidden');
    el.addEventListener('click', e => { if (e.target === el) closeAll(); }, { once: true });
  }

  function closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      el.classList.remove('open');
      el.setAttribute('aria-hidden', 'true');
    });
    const header = document.querySelector('#settings-modal .modal-header h2');
    if (header) header.textContent = I18n.t('settings.title');
  }

  function init() {
    document.getElementById('settings-btn')?.addEventListener('click', openSettings);
    document.getElementById('lang-selector')?.addEventListener('change', e => {
      I18n.setLocale(e.target.value);
      Storage.updateSettings({ language: e.target.value });
    });
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', closeAll);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAll();
    });
  }

  return { init, openSettings, saveSettings, openShortcuts, openModal, closeAll };
})();
