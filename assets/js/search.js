const Search = (() => {
  let allTools = [];
  let focusedIndex = -1;
  let resultsVisible = [];

  function init(tools) {
    allTools = tools;
    const trigger = document.getElementById('search-trigger');
    const overlay = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');

    trigger?.addEventListener('click', open);
    overlay?.addEventListener('click', e => { if (e.target === overlay) close(); });

    input?.addEventListener('input', () => render(input.value));
    input?.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); selectFocused(); }
      else if (e.key === 'Escape') close();
    });

    document.querySelector('.modal-close[data-modal="search-modal"]')?.addEventListener('click', close);
  }

  function open() {
    const overlay = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');
    setTimeout(() => { input?.focus(); }, 50);
    render('');
  }

  function close() {
    const overlay = document.getElementById('search-modal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    focusedIndex = -1;
  }

  function query(q) {
    if (!q.trim()) return allTools.slice(0, 12);
    const lower = q.toLowerCase();
    return allTools.filter(t =>
      t.name.toLowerCase().includes(lower) ||
      t.description?.toLowerCase().includes(lower) ||
      t.category?.toLowerCase().includes(lower) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lower))
    );
  }

  function render(q) {
    const results = document.getElementById('search-results');
    if (!results) return;
    const matches = query(q);
    resultsVisible = matches;
    focusedIndex = -1;

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-empty">${I18n.t('search.noResults', { query: q || '...' })}</div>`;
      return;
    }

    const grouped = {};
    matches.forEach(t => {
      const cat = t.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    });

    let html = '';
    let idx = 0;
    for (const [cat, tools] of Object.entries(grouped)) {
      html += `<div class="search-result-group">`;
      html += `<div class="search-result-group-label">${I18n.t('nav.' + cat) || cat}</div>`;
      for (const tool of tools) {
        html += `<div class="search-result-item" data-tool="${tool.id}" data-idx="${idx}" tabindex="-1">
          <div class="search-result-icon">${tool.icon || '🔧'}</div>
          <div>
            <div class="search-result-name">${tool.name}</div>
            <div class="search-result-desc">${tool.description || ''}</div>
          </div>
        </div>`;
        idx++;
      }
      html += `</div>`;
    }

    results.innerHTML = html;
    results.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        Router.navigate(item.dataset.tool);
        close();
      });
      item.addEventListener('mouseenter', () => {
        focusedIndex = parseInt(item.dataset.idx);
        updateFocus();
      });
    });
  }

  function moveFocus(dir) {
    focusedIndex = Math.max(-1, Math.min(resultsVisible.length - 1, focusedIndex + dir));
    updateFocus();
  }

  function updateFocus() {
    document.querySelectorAll('.search-result-item').forEach((el, i) => {
      el.classList.toggle('focused', i === focusedIndex);
      if (i === focusedIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function selectFocused() {
    if (focusedIndex >= 0 && resultsVisible[focusedIndex]) {
      Router.navigate(resultsVisible[focusedIndex].id);
      close();
    }
  }

  function isOpen() {
    return document.getElementById('search-modal')?.classList.contains('open');
  }

  return { init, open, close, isOpen };
})();
