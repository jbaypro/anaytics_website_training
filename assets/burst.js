// Confirmation : explosion de poudre blanche (reprise du site vitrine)
(function () {
  if (!document.getElementById('paint')) return;
  const Paint = (() => {
    const cv = document.getElementById('paint'), ctx = cv.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let S = 0, DPR = 1, raf = null, layers = null;
    const R = (a, b) => a + Math.random() * (b - a);
    const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    function mk() { const c = document.createElement('canvas'); c.width = c.height = Math.round(S * DPR); const x = c.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); return [c, x]; }
    function puff(x, cx, cy, r, a) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
    function build() {
      const c = S / 2, unit = S / 3.05;
      const L = [mk(), mk(), mk()];                 // 0 core, 1 plumes, 2 tips
      L.forEach(([, x]) => x.globalCompositeOperation = 'lighter');
      const grain = (x, px, py, r, a) => { x.fillStyle = `rgba(255,255,255,${a})`; x.fillRect(px - r / 2, py - r / 2, r, r); };
      // plumes
      const nRays = 18;
      for (let i = 0; i < nRays; i++) {
        const ang = i / nRays * Math.PI * 2 + R(-.16, .16);
        const len = unit * R(.62, 1.08), width = unit * R(.045, .1);
        const subs = Array.from({ length: 3 }, () => ({ da: R(-.06, .06), off: R(-.5, .5) * width, k: R(.6, 1.1), l: R(.75, 1) }));
        for (const sb of subs) {
          const a2 = ang + sb.da, cos = Math.cos(a2), sin = Math.sin(a2), ll = len * sb.l;
          const n = Math.round(ll / unit * 1700);
          // soft body
          for (let j = 0; j < 22; j++) {
            const f = Math.random(), d = ll * f, lat = gauss() * width * .4 * (.3 + f);
            puff(L[1][1], c + cos * d - sin * (lat + sb.off * f), c + sin * d + cos * (lat + sb.off * f), width * (.5 + f * 1.3) * sb.k, .045);
          }
          // grains
          for (let j = 0; j < n; j++) {
            const f = Math.pow(Math.random(), .85), d = ll * f;
            const lat = gauss() * width * (.22 + f * .85) * sb.k + sb.off * f;
            const px = c + cos * d - sin * lat, py = c + sin * d + cos * lat;
            grain(f > .82 ? L[2][1] : L[1][1], px, py, R(.6, 1.7), R(.08, .32) * (1 - f * .5));
          }
          // spray: specks flung past the tip along a thin line
          for (let k = 0, m = Math.round(R(6, 16)); k < m; k++) {
            const d = ll * R(1, 1.38), lat = gauss() * width * .35;
            const x = L[2][1]; x.fillStyle = `rgba(255,255,255,${R(.45, .95)})`;
            x.beginPath(); x.arc(c + cos * d - sin * lat, c + sin * d + cos * lat, R(.6, 2.2), 0, 7); x.fill();
          }
        }
      }
      // core: bright cloud
      const cx = L[0][1];
      puff(cx, c, c, unit * .38, .5); puff(cx, c, c, unit * .2, .55);
      for (let j = 0; j < 9000; j++) { const rr = Math.abs(gauss()) * unit * .17, a = R(0, Math.PI * 2); grain(cx, c + Math.cos(a) * rr, c + Math.sin(a) * rr, R(.6, 1.8), R(.1, .35)); }
      // loose dust
      for (let j = 0; j < 1400; j++) { const rr = unit * Math.pow(Math.random(), .55) * 1.2, a = R(0, Math.PI * 2); grain(L[2][1], c + Math.cos(a) * rr, c + Math.sin(a) * rr, R(.4, 1.1), R(.04, .16)); }
      layers = L.map(([el]) => el);
    }
    function size() { const r = cv.getBoundingClientRect(); DPR = Math.min(2, devicePixelRatio || 1); S = r.width; cv.width = cv.height = Math.round(S * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
    const expo = t => { t = Math.max(0, Math.min(1, t)); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
    function frame(t) {
      const c = S / 2;
      ctx.clearRect(0, 0, S, S);
      [[0, 0, .1], [1, .04, .12], [2, .1, .05]].forEach(([i, delay, from]) => {
        const e = expo((t - delay) / (1 - delay)); if (e <= 0) return;
        const sc = from + (1 - from) * e;
        ctx.save(); ctx.globalAlpha = Math.min(1, e * 1.8); ctx.translate(c, c); ctx.scale(sc, sc); ctx.drawImage(layers[i], -c, -c, S, S); ctx.restore();
      });
    }
    return {
      burst() {
        requestAnimationFrame(() => {
          size(); if (!S) return;
          build();
          if (raf) cancelAnimationFrame(raf);
          if (reduce) { frame(1); return; }
          const t0 = performance.now(), dur = 1400;
          const step = now => { const t = Math.max(0, (now - t0) / dur); frame(t); raf = t < 1 ? requestAnimationFrame(step) : null; };
          raf = requestAnimationFrame(step);
        });
      }
    };
  })();

  Paint.burst();
})();
