// BUDASAI — Shared site logic
(function () {
  const API_BASE = '/api'; // FastAPI-ready placeholder

  // Theme toggle
  const stored = localStorage.getItem('budasai-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('budasai-theme', t);
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.innerHTML = t === 'dark' ? sunSvg() : moonSvg();
    });
  }
  function moonSvg() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'; }
  function sunSvg()  { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'; }

  // Component loader: <div data-component="header"></div>
  async function loadComponents() {
    const slots = document.querySelectorAll('[data-component]');
    await Promise.all([...slots].map(async slot => {
      const name = slot.dataset.component;
      try {
        const res = await fetch(`/budasai/components/${name}.html`);
        slot.innerHTML = await res.text();
      } catch (e) { console.warn('Component load failed', name, e); }
    }));
    // Activate nav link (clean URLs)
    const current = location.pathname.replace(/\/+$/, '') || '/budasai';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/\/+$/, '') || '/budasai';
      if (href === current) a.classList.add('active');
    });
    // Mobile menu
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
    // Theme buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        setTheme(cur === 'dark' ? 'light' : 'dark');
      });
    });
    setTheme(document.documentElement.getAttribute('data-theme'));
    // Year
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  // Scroll reveal
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // Animated counters
  function initCounters() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = parseFloat(el.dataset.count);
        const dec = parseInt(el.dataset.decimals || '0');
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const dur = 1400;
        const t0 = performance.now();
        function step(now) {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const v = end * eased;
          el.textContent = prefix + v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
  }

  // Sparklines (SVG) - draws into elements with class .spark and data-points
  function initSparks() {
    document.querySelectorAll('.spark').forEach(el => {
      const ptsAttr = el.dataset.points;
      const points = ptsAttr ? ptsAttr.split(',').map(Number) : randomSeries(20);
      drawSpark(el, points, el.dataset.color || 'var(--emerald)');
    });
  }
  function randomSeries(n) {
    const out = []; let v = 50;
    for (let i = 0; i < n; i++) { v += (Math.random() - 0.45) * 6; out.push(v); }
    return out;
  }
  function drawSpark(el, data, color) {
    const w = el.clientWidth || 200, h = el.clientHeight || 36;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i*step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(' ');
    const last = data[data.length-1], first = data[0];
    const up = last >= first;
    const stroke = up ? 'var(--emerald)' : '#ef4444';
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" width="100%" height="100%">
      <defs><linearGradient id="g${Math.random().toString(36).slice(2)}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${stroke}" stop-opacity=".35"/><stop offset="100%" stop-color="${stroke}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${d} L${w},${h} L0,${h} Z" fill="${stroke}" opacity=".12"/>
      <path d="${d}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  // Tool card mouse tracking
  function initMouseGlow() {
    document.querySelectorAll('.tool-card, .feature').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // Floating data points
  function initFloaters() {
    document.querySelectorAll('.floaters').forEach(box => {
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('span');
        s.style.left = Math.random() * 100 + '%';
        s.style.top  = (60 + Math.random() * 40) + '%';
        s.style.animationDelay = (Math.random() * 12) + 's';
        s.style.animationDuration = (8 + Math.random() * 8) + 's';
        box.appendChild(s);
      }
    });
  }

  // Newsletter submission (placeholder for FastAPI POST /api/newsletter)
  function initNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        const status = form.querySelector('[data-status]');
        if (status) status.textContent = 'Subscribing…';
        try {
          // await fetch(API_BASE + '/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
          await new Promise(r => setTimeout(r, 600));
          if (status) status.innerHTML = '<span style="color:var(--emerald)">✓ You are on the list. Welcome to BUDASAI.</span>';
          form.reset();
        } catch (err) {
          if (status) status.innerHTML = '<span style="color:#ef4444">Something went wrong. Try again.</span>';
        }
      });
    });
  }

  // Contact form
  function initContact() {
    const form = document.querySelector('[data-contact]');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector('[data-status]');
      if (status) status.textContent = 'Sending…';
      await new Promise(r => setTimeout(r, 700));
      if (status) status.innerHTML = '<span style="color:var(--emerald)">✓ Message received. We will reply within 24h.</span>';
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadComponents();
    initFloaters();
    initSparks();
    initReveal();
    initCounters();
    initMouseGlow();
    initNewsletter();
    initContact();
  });

  // Expose for calculators page
  window.BUDASAI = { API_BASE };
})();
