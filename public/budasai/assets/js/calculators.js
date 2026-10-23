// BUDASAI Calculators — vanilla, chart drawn with SVG
(function () {
  function curInfo() {
    if (window.BUDASAI_API && window.BUDASAI_API.getCurrency) return window.BUDASAI_API.getCurrency();
    return { symbol: '₹', locale: 'en-IN', code: 'INR' };
  }
  const fmt = (n, d = 0) => {
    const c = curInfo();
    return c.symbol + Number(n).toLocaleString(c.locale, { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  const pct = (n, d = 2) => Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
  const yrs = (n) => n.toFixed(1) + ' yrs';

  function bindRange(id, valId) {
    const el = document.getElementById(id);
    const v  = document.getElementById(valId);
    if (!el || !v) return;
    const update = () => { v.textContent = el.value; };
    el.addEventListener('input', update); update();
  }

  function drawAreaChart(el, series, labels) {
    if (!el) return;
    const w = el.clientWidth || 600, h = el.clientHeight || 240;
    const pad = { l: 40, r: 12, t: 16, b: 24 };
    const max = Math.max(...series.flat()), min = 0;
    const xs = (i, n) => pad.l + (w - pad.l - pad.r) * (i / (n - 1));
    const ys = (v) => h - pad.b - (h - pad.t - pad.b) * ((v - min) / (max - min || 1));
    const colors = ['var(--electric)', 'var(--emerald)'];
    let paths = '';
    series.forEach((s, idx) => {
      const d = s.map((v, i) => `${i === 0 ? 'M' : 'L'}${xs(i, s.length).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
      const area = d + ` L${xs(s.length-1, s.length)},${h - pad.b} L${xs(0, s.length)},${h - pad.b} Z`;
      paths += `<path d="${area}" fill="${colors[idx]}" opacity=".14"/>`;
      paths += `<path d="${d}" stroke="${colors[idx]}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    // grid
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ((h - pad.t - pad.b) * i / 4);
      grid += `<line x1="${pad.l}" y1="${y}" x2="${w-pad.r}" y2="${y}" stroke="var(--border)" stroke-dasharray="3 4"/>`;
      const val = max - (max - min) * i / 4;
      grid += `<text x="${pad.l - 6}" y="${y+3}" font-size="10" fill="var(--text-soft)" text-anchor="end">${val >= 1e7 ? (val/1e7).toFixed(1)+'Cr' : val >= 1e5 ? (val/1e5).toFixed(1)+'L' : val >= 1000 ? (val/1000).toFixed(0)+'K' : val.toFixed(0)}</text>`;
    }
    let labelMarks = '';
    if (labels) {
      const step = Math.max(1, Math.floor(labels.length / 6));
      labels.forEach((l, i) => {
        if (i % step === 0 || i === labels.length-1) {
          labelMarks += `<text x="${xs(i, labels.length)}" y="${h - 6}" font-size="10" fill="var(--text-soft)" text-anchor="middle">${l}</text>`;
        }
      });
    }
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${grid}${paths}${labelMarks}</svg>`;
  }

  // --- Compound Interest ---
  function calcCompound() {
    const P = +document.getElementById('ci-p').value;
    const M = +document.getElementById('ci-m').value;
    const r = +document.getElementById('ci-r').value / 100;
    const t = +document.getElementById('ci-t').value;
    const monthlyRate = r / 12;
    const months = t * 12;
    let balance = P;
    const invested = [P];
    const totals = [P];
    for (let i = 1; i <= months; i++) {
      balance = balance * (1 + monthlyRate) + M;
      if (i % 12 === 0) {
        invested.push(P + M * i);
        totals.push(balance);
      }
    }
    const fv = balance;
    const contrib = P + M * months;
    const gains = fv - contrib;
    document.getElementById('ci-fv').textContent = fmt(fv);
    document.getElementById('ci-tc').textContent = fmt(contrib);
    document.getElementById('ci-tg').textContent = fmt(gains);
    const labels = Array.from({length: invested.length}, (_, i) => 'Y' + i);
    drawAreaChart(document.getElementById('ci-chart'), [invested, totals], labels);
  }

  // --- SIP ---
  function calcSip() {
    const M = +document.getElementById('sip-m').value;
    const r = +document.getElementById('sip-r').value / 100;
    const t = +document.getElementById('sip-t').value;
    const monthly = r / 12;
    const n = t * 12;
    const fv = M * (Math.pow(1 + monthly, n) - 1) / monthly * (1 + monthly);
    const invested = M * n;
    document.getElementById('sip-corpus').textContent = fmt(fv);
    document.getElementById('sip-invested').textContent = fmt(invested);
    document.getElementById('sip-wealth').textContent = fmt(fv - invested);
    const investedSeries = [], totalSeries = [];
    let bal = 0;
    for (let i = 1; i <= n; i++) {
      bal = bal * (1 + monthly) + M;
      if (i % 12 === 0) { investedSeries.push(M * i); totalSeries.push(bal); }
    }
    drawAreaChart(document.getElementById('sip-chart'), [investedSeries, totalSeries], investedSeries.map((_,i)=>'Y'+(i+1)));
  }

  // --- Retirement ---
  function calcRetire() {
    const ca = +document.getElementById('ret-ca').value;
    const ra = +document.getElementById('ret-ra').value;
    const M = +document.getElementById('ret-m').value;
    const r = +document.getElementById('ret-r').value / 100;
    const t = Math.max(0, ra - ca);
    const monthly = r / 12;
    const n = t * 12;
    const corpus = monthly === 0 ? M * n : M * (Math.pow(1 + monthly, n) - 1) / monthly * (1 + monthly);
    document.getElementById('ret-corpus').textContent = fmt(corpus);
    document.getElementById('ret-years').textContent = t + ' years to retirement';
    const series = []; let bal = 0;
    for (let i = 1; i <= n; i++) { bal = bal * (1 + monthly) + M; if (i % 12 === 0) series.push(bal); }
    drawAreaChart(document.getElementById('ret-chart'), [series], series.map((_,i)=>'Y'+(i+1)));
  }

  // --- Goal Planner ---
  function calcGoal() {
    const G = +document.getElementById('goal-g').value;
    const t = +document.getElementById('goal-t').value;
    const r = +document.getElementById('goal-r').value / 100;
    const monthly = r / 12;
    const n = t * 12;
    const M = monthly === 0 ? G / n : G / (((Math.pow(1 + monthly, n) - 1) / monthly) * (1 + monthly));
    document.getElementById('goal-m').textContent = fmt(M);
    document.getElementById('goal-tot').textContent = fmt(M * n);
    const series = []; let bal = 0;
    for (let i = 1; i <= n; i++) { bal = bal * (1 + monthly) + M; if (i % 12 === 0) series.push(bal); }
    drawAreaChart(document.getElementById('goal-chart'), [series], series.map((_,i)=>'Y'+(i+1)));
  }

  // --- CAGR ---
  function calcCagr() {
    const i = +document.getElementById('cagr-i').value;
    const f = +document.getElementById('cagr-f').value;
    const t = +document.getElementById('cagr-t').value;
    const c = (Math.pow(f / i, 1 / t) - 1) * 100;
    document.getElementById('cagr-r').textContent = pct(c);
    const series = []; for (let y = 0; y <= t; y++) series.push(i * Math.pow(1 + c/100, y));
    drawAreaChart(document.getElementById('cagr-chart'), [series], series.map((_,k)=>'Y'+k));
  }

  // --- SWP ---
  function calcSwp() {
    const C = +document.getElementById('swp-c').value;
    const W = +document.getElementById('swp-w').value;
    const r = +document.getElementById('swp-r').value / 100;
    const monthly = r / 12;
    let bal = C, months = 0;
    const series = [bal];
    while (bal > 0 && months < 12 * 80) {
      bal = bal * (1 + monthly) - W;
      months++;
      if (months % 12 === 0) series.push(Math.max(0, bal));
      if (bal <= 0) break;
    }
    const years = months / 12;
    document.getElementById('swp-years').textContent = yrs(years);
    document.getElementById('swp-total').textContent = fmt(W * months);
    drawAreaChart(document.getElementById('swp-chart'), [series], series.map((_,k)=>'Y'+k));
  }

  function init() {
    const map = [
      ['ci', calcCompound, ['ci-p','ci-m','ci-r','ci-t']],
      ['sip', calcSip, ['sip-m','sip-r','sip-t']],
      ['ret', calcRetire, ['ret-ca','ret-ra','ret-m','ret-r']],
      ['goal', calcGoal, ['goal-g','goal-t','goal-r']],
      ['cagr', calcCagr, ['cagr-i','cagr-f','cagr-t']],
      ['swp', calcSwp, ['swp-c','swp-w','swp-r']],
    ];
    map.forEach(([prefix, fn, ids]) => {
      if (!document.getElementById(ids[0])) return;
      ids.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => { bindRange(id, id + '-val'); fn(); });
        bindRange(id, id + '-val');
      });
      // initial draw after a short delay so chart wrapper has width
      setTimeout(fn, 60);
      window.addEventListener('resize', () => setTimeout(fn, 80));
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
