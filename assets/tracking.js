// Couche de tracking : helpers dataLayer GA4, flags du Labo, debugger dataLayer flottant.
// Toutes les pages l'embarquent. Les événements sont poussés via MT.push(), jamais directement.
(function () {
  window.dataLayer = window.dataLayer || [];
  const LAB_KEYS = ['delay', 'break_value', 'dup_purchase', 'no_cmp', 'no_ecommerce_reset', 'string_price'];
  const lab = {};
  LAB_KEYS.forEach(k => { try { lab[k] = localStorage.getItem('lab_' + k) === '1'; } catch (e) { lab[k] = false; } });

  function toItem(p, variant, quantity, extra) {
    const it = {
      item_id: p.id,
      item_name: p.name,
      item_brand: p.brand,
      item_category: p.category,
      price: lab.string_price ? p.price.toFixed(2) : p.price,
      quantity: quantity || 1
    };
    if (variant) it.item_variant = variant;
    if (p.compare) it.discount = +(p.compare - p.price).toFixed(2);
    return Object.assign(it, extra || {});
  }
  function value(items) { return +items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2); }

  function push(obj) {
    if (obj.ecommerce && !lab.no_ecommerce_reset) window.dataLayer.push({ ecommerce: null });
    if (lab.break_value && obj.ecommerce && obj.ecommerce.value != null) obj.ecommerce.value = obj.ecommerce.value + ' €';
    const go = () => window.dataLayer.push(obj);
    if (lab.delay) setTimeout(go, 2500); else go();
  }
  // Push + navigation sûre (eventCallback / eventTimeout) : évite de perdre le hit lors d'une redirection
  function pushThen(obj, href) {
    let done = false;
    const nav = () => { if (done) return; done = true; location.href = href; };
    obj.eventCallback = nav; obj.eventTimeout = 1500;
    push(obj);
    setTimeout(nav, 1200); // filet de sécurité si GTM n'est pas chargé (ID placeholder, bloqueur…)
  }

  window.MT = { lab, toItem, value, push, pushThen };

  // ---- Debugger dataLayer (lecture seule, poll 400 ms : fonctionne même après que GTM a remplacé dataLayer.push)
  function debuggerUI() {
    const btn = document.createElement('button'); btn.id = 'dl-btn'; btn.type = 'button';
    btn.innerHTML = '<span class="mono">dataLayer</span><span class="n">0</span>';
    const panel = document.createElement('div'); panel.id = 'dl-panel';
    panel.innerHTML = '<div class="h"><b>window.dataLayer</b><span id="dl-count"></span><button type="button" id="dl-clear">effacer la vue</button></div><div id="dl-list"></div>';
    document.body.append(btn, panel);
    const list = panel.querySelector('#dl-list'), count = panel.querySelector('#dl-count');
    let seen = 0, hidden = 0;
    btn.addEventListener('click', () => panel.classList.toggle('open'));
    panel.querySelector('#dl-clear').addEventListener('click', () => { list.innerHTML = ''; hidden = seen; });
    const render = (entry, i) => {
      let ev, body;
      const isArgs = Object.prototype.toString.call(entry) === '[object Arguments]';
      if (entry && typeof entry === 'object' && !Array.isArray(entry) && !isArgs) {
        ev = entry.event || (entry.ecommerce === null ? 'ecommerce: null' : '(sans event)'); body = entry;
      } else if (isArgs && entry[0] === 'consent') { ev = 'gtag consent ' + entry[1]; body = entry[2]; }
      else { ev = '(gtag)'; body = Array.from(entry || []); }
      let js = ''; try { js = JSON.stringify(body, null, 1); } catch (e) { js = String(body); }
      const d = document.createElement('details');
      d.innerHTML = `<summary><span class="t">#${i}</span><span class="ev">${ev}</span>${body && body.ecommerce ? '<span class="ec">ecommerce</span>' : ''}</summary><pre></pre>`;
      d.querySelector('pre').textContent = js;
      d.querySelector('.t').style.marginLeft = '0'; d.querySelector('.t').style.order = '-1';
      list.prepend(d);
    };
    setInterval(() => {
      const dl = window.dataLayer || [];
      while (seen < dl.length) { if (seen >= hidden) render(dl[seen], seen); seen++; }
      btn.querySelector('.n').textContent = dl.length; count.textContent = dl.length + ' entrées';
    }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', debuggerUI); else debuggerUI();
})();
