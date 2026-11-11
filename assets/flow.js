// Home : flux data animé (fond du hero) — nœuds = chaîne de collecte d'un e-commerce
(function () {
  const cv = document.getElementById('flow'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, raf = null, nodes = [], edges = [], pk = [], showLabels = true;
  const L = { site:'Boutique', app:'App', crm:'CRM', ads:'Médias', cmp:'CMP', gtm:'GTM', sgtm:'sGTM', bq:'BigQuery', ga4:'GA4', gads:'Google Ads', meta:'Meta', dash:'Dashboards', dec:'Décisions' };
  const layout = [['site',.05,.22],['app',.10,.42],['cmp',.05,.62],['ads',.11,.82],['gtm',.24,.32],['sgtm',.26,.68],['bq',.50,.92],
                  ['ga4',.52,.26],['gads',.74,.44],['meta',.74,.70],['dash',.92,.24],['dec',.95,.60]];
  const E = [['site','gtm'],['app','gtm'],['cmp','gtm'],['ads','sgtm'],['gtm','sgtm'],['gtm','ga4'],['sgtm','ga4'],['sgtm','gads'],['sgtm','meta'],['ga4','bq'],['sgtm','bq'],['ga4','dash'],['bq','dash'],['gads','dec'],['dash','dec'],['meta','dec']];
  function size() {
    const DPR = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    showLabels = W >= 760;
    const by = {};
    nodes = layout.map(([id, x, y]) => (by[id] = { id, x: x * W, y: y * H }));
    edges = E.map(([a, b]) => [by[a], by[b]]);
  }
  function point(a, b, t) { const mx = (a.x + b.x) / 2, u = 1 - t; return [u*u*u*a.x + 3*u*u*t*mx + 3*u*t*t*mx + t*t*t*b.x, u*u*u*a.y + 3*u*u*t*a.y + 3*u*t*t*b.y + t*t*t*b.y]; }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (const [a, b] of edges) { const mx = (a.x + b.x) / 2; ctx.strokeStyle = 'rgba(161,161,170,.16)'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y); ctx.stroke(); }
    if (!reduce && Math.random() < .12) pk.push({ e: edges[Math.floor(Math.random() * edges.length)], t: 0, s: .005 + Math.random() * .006 });
    for (let i = pk.length - 1; i >= 0; i--) {
      const p = pk[i]; p.t += p.s; if (p.t >= 1) { pk.splice(i, 1); continue; }
      const [x, y] = point(p.e[0], p.e[1], p.t), g = ctx.createRadialGradient(x, y, 0, x, y, 6);
      g.addColorStop(0, 'rgba(96,165,250,.9)'); g.addColorStop(1, 'rgba(96,165,250,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
    }
    ctx.font = '11px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
    for (const n of nodes) {
      ctx.fillStyle = '#0a0a0a'; ctx.strokeStyle = 'rgba(161,161,170,.4)'; ctx.beginPath(); ctx.arc(n.x, n.y, 4.5, 0, 7); ctx.fill(); ctx.stroke();
      if (showLabels) { ctx.fillStyle = 'rgba(161,161,170,.55)'; ctx.fillText(L[n.id], n.x, n.y + 20); }
    }
  }
  function loop() { draw(); raf = (!reduce && !document.hidden) ? requestAnimationFrame(loop) : null; }
  addEventListener('resize', () => { size(); if (!raf) loop(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) loop(); });
  requestAnimationFrame(() => { size(); loop(); });

  // Cascade d'arrivée + frappe du faux dataLayer (une fois par session)
  let seen = false; try { seen = sessionStorage.getItem('intro_seen') === '1'; sessionStorage.setItem('intro_seen', '1'); } catch (e) {}
  const lines = [...document.querySelectorAll('.console .ln')];
  if (seen || reduce) { lines.forEach(l => l.classList.add('on')); return; }
  document.body.classList.add('intro');
  let t = 900;
  lines.forEach(l => { setTimeout(() => l.classList.add('on'), t); t += 160; });
})();
