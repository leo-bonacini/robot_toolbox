const I18n = (() => {
  let locale = 'en';
  const listeners = [];

  function t(key, params) {
    const parts = key.split('.');
    let val = window.LOCALES[locale];
    for (const p of parts) {
      if (val == null) break;
      val = val[p];
    }
    if (val == null) {
      val = window.LOCALES.en;
      for (const p of parts) {
        if (val == null) break;
        val = val[p];
      }
    }
    if (typeof val !== 'string') return key;
    if (params) return val.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '');
    return val;
  }

  function setLocale(newLocale) {
    if (!window.LOCALES[newLocale]) return;
    locale = newLocale;
    Storage.set('locale', locale);
    applyTranslations();
    listeners.forEach(fn => fn(locale));
  }

  function getLocale() { return locale; }

  function init() {
    const saved = Storage.get('locale');
    const browserLang = navigator.language?.split('-')[0];
    const candidates = [saved, browserLang];
    for (const c of candidates) {
      if (c && window.LOCALES[c]) { locale = c; break; }
    }
    applyTranslations();
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    const langSel = document.getElementById('lang-selector');
    if (langSel) langSel.value = locale;
  }

  function onChange(fn) { listeners.push(fn); }

  return { t, setLocale, getLocale, init, onChange, applyTranslations };
})();
