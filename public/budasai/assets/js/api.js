// BUDASAI shared API client — connects every page to the admin-configured backend.
(function () {
  const STORAGE_KEY = 'budasai-api-config';
  const CURRENCIES = {
    INR: { symbol: '₹', locale: 'en-IN', code: 'INR' },
    USD: { symbol: '$', locale: 'en-US', code: 'USD' },
    AED: { symbol: 'AED ', locale: 'en-AE', code: 'AED' },
  };

  function getConfig() {
    const c = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    c.endpoints = c.endpoints || {};
    c.currency = c.currency || 'INR';
    return c;
  }
  function saveConfig(c) { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); }

  function ep(key) {
    const c = getConfig();
    return c.endpoints[key] || {};
  }

  function fullUrl(key, extra) {
    const c = getConfig();
    const e = ep(key);
    if (!c.base || !e.path) return null;
    let path = e.path;
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(k => { path = path.replace('{' + k + '}', encodeURIComponent(extra[k])); });
    }
    return c.base.replace(/\/$/, '') + path;
  }

  function isVisible(key) {
    const e = ep(key);
    // default: visible unless explicitly hidden
    return e.visible !== false;
  }

  async function fetchData(key, opts) {
    const url = fullUrl(key, opts && opts.params);
    if (!url) {
      // Fallback to bundled dummy data so the site is fully usable without a backend.
      const dummy = (window.BUDASAI_DUMMY || {})[key];
      return dummy != null ? dummy : null;
    }
    const c = getConfig();
    const headers = { 'Accept': 'application/json' };
    if (c.auth) headers['Authorization'] = c.auth;
    const init = { method: (opts && opts.method) || ep(key).method || 'GET', headers };
    if (opts && opts.body) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    try {
      const r = await fetch(url, init);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (err) {
      console.warn('[BUDASAI api]', key, err.message);
      const dummy = (window.BUDASAI_DUMMY || {})[key];
      return dummy != null ? dummy : null;
    }
  }

  function getCurrency() {
    return CURRENCIES[getConfig().currency] || CURRENCIES.INR;
  }
  function setCurrency(code) {
    const c = getConfig(); c.currency = code; saveConfig(c);
    window.dispatchEvent(new CustomEvent('budasai:currency'));
  }
  function fmtMoney(n, decimals) {
    const cur = getCurrency();
    return cur.symbol + Number(n).toLocaleString(cur.locale, {
      minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0
    });
  }

  // Auto-hide any element with data-section="<key>" when admin marks invisible.
  function applyVisibility() {
    document.querySelectorAll('[data-section]').forEach(el => {
      const keys = el.getAttribute('data-section').split(',').map(s => s.trim());
      const hide = keys.some(k => !isVisible(k));
      el.style.display = hide ? 'none' : '';
    });
  }

  window.BUDASAI_API = {
    getConfig, saveConfig, ep, fullUrl, fetchData, isVisible,
    getCurrency, setCurrency, fmtMoney, applyVisibility, CURRENCIES, STORAGE_KEY,
  };

  document.addEventListener('DOMContentLoaded', applyVisibility);
  window.addEventListener('budasai:config-updated', applyVisibility);
  window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY) applyVisibility(); });
})();