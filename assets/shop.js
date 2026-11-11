// Logique boutique : panier localStorage, rendu des pages, événements GA4 e-commerce & lead.
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const qs = new URLSearchParams(location.search);
  const page = document.body.dataset.page;

  // ---------- Panier
  const Cart = {
    key: 'mt_cart',
    get() { try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch (e) { return []; } },
    set(c) { localStorage.setItem(this.key, JSON.stringify(c)); badge(); },
    add(id, variant, qty) {
      const c = this.get(); const l = c.find(x => x.id === id && x.variant === variant);
      if (l) l.qty += qty; else c.push({ id, variant, qty });
      this.set(c);
    },
    remove(id, variant) { this.set(this.get().filter(x => !(x.id === id && x.variant === variant))); },
    setQty(id, variant, qty) { const c = this.get(); const l = c.find(x => x.id === id && x.variant === variant); if (l) l.qty = qty; this.set(c.filter(x => x.qty > 0)); },
    clear() { this.set([]); },
    items() { return this.get().map(l => MT.toItem(PRODUCT_BY_ID[l.id], l.variant, l.qty)); },
    total() { return MT.value(this.items()); },
    count() { return this.get().reduce((s, l) => s + l.qty, 0); }
  };
  window.Cart = Cart;

  // ---------- Utilisateur (login simulé)
  const User = {
    key: 'mt_user',
    get() { try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch (e) { return null; } },
    set(u) { localStorage.setItem(this.key, JSON.stringify(u)); },
    clear() { localStorage.removeItem(this.key); },
    // identifiant stable par email, non réversible et SANS hash standard (pas de SHA-256 d'email dans le dataLayer)
    shortId(email) { let h = 5381; for (const c of email.trim().toLowerCase()) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return 'U' + h.toString(36).toUpperCase().padStart(7, '0'); }
  };
  window.User = User;
  (function header() { const u = User.get(), a = $('#account-link'); if (!a) return; a.textContent = u ? 'Bonjour ' + (u.name || u.email.split('@')[0]) : 'Compte'; })();
  function badge() { $$('.cart-link .n').forEach(n => { n.textContent = Cart.count(); n.style.display = Cart.count() ? '' : 'none'; }); }
  badge();

  function toast(msg) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200);
  }
  const card = (p, i, list) => `<a class="card" href="product.html?sku=${p.id}" data-id="${p.id}" data-index="${i}" data-list="${list}">
      <div class="art">${productArt(p)}${p.badge ? `<span class="badge">${p.badge}</span>` : ''}</div>
      <div class="meta"><h3>${p.name}</h3><span class="price">${fmt(p.price)}</span></div>
      <span class="cat">${p.category}</span></a>`;
  function bindSelect(container, listId, listName) {
    container.addEventListener('click', e => {
      const a = e.target.closest('.card'); if (!a) return;
      const p = PRODUCT_BY_ID[a.dataset.id];
      MT.push({ event: 'select_item', ecommerce: { item_list_id: listId, item_list_name: listName, items: [MT.toItem(p, null, 1, { index: +a.dataset.index, item_list_id: listId, item_list_name: listName })] } });
    });
  }

  // ---------- Header : recherche, burger, newsletter, cookies
  const sf = $('.search'); if (sf) sf.addEventListener('submit', e => { e.preventDefault(); const q = sf.querySelector('input').value.trim(); if (!q) return; MT.push({ event: 'search', search_term: q }); location.href = 'collection.html?q=' + encodeURIComponent(q); });
  const burger = $('.burger'); if (burger) burger.addEventListener('click', () => { const nav = $('.top nav'); const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
  const nl = $('.news'); if (nl) nl.addEventListener('submit', e => { e.preventDefault(); const em = nl.querySelector('input').value; if (!em) return; MT.push({ event: 'newsletter_signup', method: 'footer', form_id: 'newsletter_footer' }); nl.innerHTML = '<p class="muted" style="margin:0">Inscrit. Vous ne recevrez rien, mais l\'événement, lui, est parti.</p>'; });

  // ---------- HOME
  if (page === 'home') {
    const feat = PRODUCTS.slice(0, 4);
    const g = $('#featured'); g.innerHTML = feat.map((p, i) => card(p, i, 'featured')).join('');
    MT.push({ event: 'view_item_list', ecommerce: { item_list_id: 'home_featured', item_list_name: 'Accueil – sélection', items: feat.map((p, i) => MT.toItem(p, null, 1, { index: i, item_list_id: 'home_featured', item_list_name: 'Accueil – sélection' })) } });
    bindSelect(g, 'home_featured', 'Accueil – sélection');
    // promotions : view_promotion à l'apparition, select_promotion au clic
    const promos = $$('[data-promo]'); const seen = new Set();
    const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting || seen.has(en.target)) return; seen.add(en.target);
      const t = en.target; MT.push({ event: 'view_promotion', ecommerce: { promotion_id: t.dataset.promo, promotion_name: t.dataset.promoName, creative_name: t.dataset.creative, creative_slot: t.dataset.slot } }); }), { threshold: .5 });
    promos.forEach(p => { io.observe(p); p.addEventListener('click', () => MT.push({ event: 'select_promotion', ecommerce: { promotion_id: p.dataset.promo, promotion_name: p.dataset.promoName, creative_name: p.dataset.creative, creative_slot: p.dataset.slot } })); });
  }

  // ---------- COLLECTION
  if (page === 'collection') {
    const q = qs.get('q'); let cat = qs.get('cat') || 'Tous';
    const listId = q ? 'search_results' : 'collection_' + cat.toLowerCase(), listName = q ? 'Recherche : ' + q : 'Collection – ' + cat;
    let items = PRODUCTS.filter(p => (cat === 'Tous' || p.category === cat) && (!q || (p.name + p.category + p.desc).toLowerCase().includes(q.toLowerCase())));
    const sort = $('#sort'); const apply = () => { if (sort.value === 'asc') items.sort((a, b) => a.price - b.price); if (sort.value === 'desc') items.sort((a, b) => b.price - a.price); };
    apply();
    $('#coll-title').textContent = q ? `« ${q} »` : cat === 'Tous' ? 'Tout le catalogue' : cat;
    $('#coll-count').textContent = items.length + (items.length > 1 ? ' produits' : ' produit') + (q ? ' trouvé' + (items.length > 1 ? 's' : '') + ' (par hasard)' : ' – tous faux');
    const g = $('#grid'); g.innerHTML = items.length ? items.map((p, i) => card(p, i, listId)).join('') : '<div class="empty" style="grid-column:1/-1"><p class="joke">Rien. Même l\'entonnoir n\'a rien trouvé.</p><a class="btn" href="collection.html">Voir tout</a></div>';
    if (q) MT.push({ event: 'view_search_results', search_term: q, results_count: items.length });
    MT.push({ event: 'view_item_list', ecommerce: { item_list_id: listId, item_list_name: listName, items: items.map((p, i) => MT.toItem(p, null, 1, { index: i, item_list_id: listId, item_list_name: listName })) } });
    bindSelect(g, listId, listName);
    $$('.filters button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.cat === cat)); b.addEventListener('click', () => { MT.push({ event: 'filter_apply', filter_type: 'category', filter_value: b.dataset.cat }); location.href = 'collection.html?cat=' + encodeURIComponent(b.dataset.cat); }); });
    sort.addEventListener('change', () => { MT.push({ event: 'sort_apply', sort_value: sort.value }); apply(); g.innerHTML = items.map((p, i) => card(p, i, listId)).join(''); });
  }

  // ---------- PRODUIT
  if (page === 'product') {
    const p = PRODUCT_BY_ID[qs.get('sku')];
    if (!p) { MT.push({ event: 'page_not_found', requested_sku: qs.get('sku') || '' }); $('#pdp').innerHTML = '<div class="notfound" style="grid-column:1/-1"><h1>Ceci est une page produit introuvable.</h1><p class="joke">Le SKU n\'existe pas. L\'événement <code class="mono">page_not_found</code>, lui, existe.</p><a class="btn primary" href="collection.html">Retour au catalogue</a></div>'; return; }
    let variant = p.variants ? p.variants.values[0] : null, qty = 1;
    document.title = p.name + ' — Maison Tracké';
    $('#p-cat').textContent = p.category; $('#p-name').textContent = p.name; $('#p-desc').textContent = p.desc;
    $('#p-price').innerHTML = fmt(p.price) + (p.compare ? `<s>${fmt(p.compare)}</s>` : '');
    const art = $('#p-art'); const drawArt = () => art.innerHTML = productArt(p, variant); drawArt();
    $('#thumbs').innerHTML = [1, 2, 3].map((n, i) => `<button type="button" aria-pressed="${i === 0}" aria-label="Vue ${n}">${productArt(p)}</button>`).join('');
    $('#thumbs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#thumbs button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); MT.push({ event: 'product_image_view', item_id: p.id, image_index: [...b.parentNode.children].indexOf(b) + 1 }); });
    const opt = $('#p-variants');
    if (p.variants) { opt.innerHTML = `<label>${p.variants.label}</label><div class="swatches">${p.variants.values.map((v, i) => `<button type="button" aria-pressed="${i === 0}" data-v="${v}">${v}</button>`).join('')}</div>`;
      opt.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; $$('[data-v]', opt).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); variant = b.dataset.v; drawArt(); MT.push({ event: 'select_variant', item_id: p.id, item_variant: variant, variant_type: p.variants.label }); });
    } else opt.remove();
    const qi = $('#qty'); $('#q-minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qi.value = qty; }); $('#q-plus').addEventListener('click', () => { qty = Math.min(9, qty + 1); qi.value = qty; }); qi.addEventListener('change', () => { qty = Math.min(9, Math.max(1, +qi.value || 1)); qi.value = qty; });
    MT.push({ event: 'view_item', ecommerce: { currency: 'EUR', value: p.price, items: [MT.toItem(p, variant, 1)] } });
    const addEvt = () => ({ event: 'add_to_cart', ecommerce: { currency: 'EUR', value: +(p.price * qty).toFixed(2), items: [MT.toItem(p, variant, qty)] } });
    $('#add').addEventListener('click', () => { Cart.add(p.id, variant, qty); MT.push(addEvt()); toast(`Ajouté (pour de faux) : ${p.name}`); });
    $('#buy-now').addEventListener('click', () => { Cart.add(p.id, variant, qty); MT.pushThen(Object.assign(addEvt(), { add_to_cart_type: 'buy_now' }), 'cart.html'); });
    $('#wish').addEventListener('click', e => { e.currentTarget.classList.toggle('on'); const on = e.currentTarget.classList.contains('on'); e.currentTarget.textContent = on ? '♥ Dans la wishlist (fictive)' : '♡ Ajouter à la wishlist'; if (on) MT.push({ event: 'add_to_wishlist', ecommerce: { currency: 'EUR', value: p.price, items: [MT.toItem(p, variant, 1)] } }); });
    // produits associés
    const rel = PRODUCTS.filter(x => x.id !== p.id && x.category === p.category).concat(PRODUCTS.filter(x => x.id !== p.id && x.category !== p.category)).slice(0, 4);
    const rg = $('#related'); rg.innerHTML = rel.map((x, i) => card(x, i, 'related')).join('');
    MT.push({ event: 'view_item_list', ecommerce: { item_list_id: 'pdp_related', item_list_name: 'Produits associés', items: rel.map((x, i) => MT.toItem(x, null, 1, { index: i, item_list_id: 'pdp_related', item_list_name: 'Produits associés' })) } });
    bindSelect(rg, 'pdp_related', 'Produits associés');
  }

  // ---------- PANIER
  if (page === 'cart') {
    const render = () => {
      const c = Cart.get(); const box = $('#lines');
      if (!c.length) { box.innerHTML = '<div class="empty"><p class="joke">Votre panier est vide. Comme un dataLayer avant le chargement.</p><a class="btn primary" href="collection.html">Remplir le panier</a></div>'; $('#summary').style.display = 'none'; return; }
      $('#summary').style.display = '';
      box.innerHTML = `<div class="lines">${c.map(l => { const p = PRODUCT_BY_ID[l.id]; return `<div class="line" data-id="${l.id}" data-v="${l.variant || ''}">
        <div class="art">${productArt(p, l.variant)}</div>
        <div><h3>${p.name}</h3>${l.variant ? `<div class="v">${p.variants.label} : ${l.variant}</div>` : ''}<div class="v">${fmt(p.price)} / unité</div><button type="button" class="rm">Retirer</button></div>
        <div class="qty"><button type="button" class="m">−</button><input value="${l.qty}" readonly><button type="button" class="pl">+</button></div>
        <div class="tot">${fmt(p.price * l.qty)}</div></div>`; }).join('')}</div>`;
      const sub = Cart.total(), ship = sub >= 50 ? 0 : 4.90;
      $('#s-sub').textContent = fmt(sub); $('#s-ship').textContent = ship ? fmt(ship) : 'Offerte'; $('#s-total').textContent = fmt(sub + ship);
    };
    render();
    $('#lines').addEventListener('click', e => {
      const line = e.target.closest('.line'); if (!line) return; const p = PRODUCT_BY_ID[line.dataset.id], v = line.dataset.v || null; const cur = Cart.get().find(x => x.id === p.id && x.variant === v);
      if (e.target.closest('.rm')) { Cart.remove(p.id, v); MT.push({ event: 'remove_from_cart', ecommerce: { currency: 'EUR', value: +(p.price * cur.qty).toFixed(2), items: [MT.toItem(p, v, cur.qty)] } }); }
      else if (e.target.closest('.pl')) { Cart.setQty(p.id, v, cur.qty + 1); MT.push({ event: 'add_to_cart', ecommerce: { currency: 'EUR', value: p.price, items: [MT.toItem(p, v, 1)] } }); }
      else if (e.target.closest('.m')) { Cart.setQty(p.id, v, cur.qty - 1); MT.push({ event: 'remove_from_cart', ecommerce: { currency: 'EUR', value: p.price, items: [MT.toItem(p, v, 1)] } }); }
      else return;
      render();
    });
    MT.push({ event: 'view_cart', ecommerce: { currency: 'EUR', value: Cart.total(), items: Cart.items() } });
    $('#coupon').addEventListener('submit', e => { e.preventDefault(); const code = $('#coupon input').value.trim().toUpperCase(); if (!code) return; const ok = code === 'TRACKME'; MT.push({ event: 'coupon_apply', coupon: code, coupon_valid: ok }); toast(ok ? 'Code TRACKME appliqué : -10 % (fictifs)' : 'Code inconnu. Essayez TRACKME.'); if (ok) sessionStorage.setItem('mt_coupon', code); });
    $('#to-checkout').addEventListener('click', e => { e.preventDefault(); MT.pushThen({ event: 'checkout_click', cart_value: Cart.total() }, 'checkout.html'); });
  }

  // ---------- CHECKOUT (3 étapes, sans paiement)
  if (page === 'checkout') {
    if (!Cart.count()) { location.replace('cart.html'); return; }
    const coupon = sessionStorage.getItem('mt_coupon') || undefined;
    const sub = Cart.total(), disc = coupon ? +(sub * .1).toFixed(2) : 0;
    let ship = 4.90, shipTier = 'standard', pay = 'card';
    const base = () => ({ currency: 'EUR', value: +(sub - disc).toFixed(2), coupon, items: Cart.items() });
    const recap = () => { $('#r-sub').textContent = fmt(sub); $('#r-disc').textContent = disc ? '−' + fmt(disc) : '—'; $('#r-ship').textContent = ship ? fmt(ship) : 'Offerte'; $('#r-total').textContent = fmt(sub - disc + ship); };
    $('#r-items').innerHTML = Cart.get().map(l => { const p = PRODUCT_BY_ID[l.id]; return `<div class="row"><span>${l.qty} × ${p.name}${l.variant ? ' · ' + l.variant : ''}</span><span>${fmt(p.price * l.qty)}</span></div>`; }).join('');
    if (sub >= 50) { ship = 0; $('#ship-std .p').textContent = 'Offerte'; }
    recap();
    MT.push({ event: 'begin_checkout', ecommerce: base() });
    const show = n => { $$('.panel[data-step]').forEach(p => p.style.display = +p.dataset.step === n ? '' : 'none'); $$('.steps span').forEach((s, i) => { s.classList.toggle('on', i + 1 === n); s.classList.toggle('done', i + 1 < n); }); window.scrollTo({ top: 0 }); };
    show(1);
    let started = false; $('#f1').addEventListener('focusin', () => { if (started) return; started = true; MT.push({ event: 'form_start', form_id: 'checkout_contact', form_name: 'Checkout – coordonnées' }); });
    $('#f1').addEventListener('submit', e => { e.preventDefault(); const f = new FormData(e.target); shipTier = f.get('ship'); if (shipTier === 'express') ship = 9.90; else if (sub >= 50) ship = 0; else ship = 4.90; recap(); MT.push({ event: 'add_shipping_info', ecommerce: Object.assign(base(), { shipping_tier: shipTier }) }); MT.push({ event: 'checkout_progress', checkout_step: 2, checkout_option: shipTier }); show(2); });
    $('#f2').addEventListener('submit', e => { e.preventDefault(); pay = new FormData(e.target).get('pay'); MT.push({ event: 'add_payment_info', ecommerce: Object.assign(base(), { payment_type: pay }) }); MT.push({ event: 'checkout_progress', checkout_step: 3, checkout_option: pay }); show(3); });
    $$('.back').forEach(b => b.addEventListener('click', () => show(+b.dataset.to)));
    $('#f3').addEventListener('submit', e => { e.preventDefault();
      const id = 'MT-' + Date.now().toString(36).toUpperCase();
      const order = { id, ts: Date.now(), items: Cart.items(), lines: Cart.get(), value: +(sub - disc + ship).toFixed(2), sub, tax: +((sub - disc) / 6).toFixed(2), shipping: ship, shipping_tier: shipTier, payment_type: pay, coupon: coupon || null, email: new FormData($('#f1')).get('email') };
      try { sessionStorage.setItem('mt_order_' + id, JSON.stringify(order)); sessionStorage.removeItem('mt_coupon'); } catch (e) {}
      MT.pushThen({ event: 'place_order_click', transaction_id: id, value: order.value }, 'confirmation.html?order=' + id);
    });
  }

  // ---------- CONFIRMATION (purchase)
  if (page === 'confirmation') {
    const id = qs.get('order'); let order = null; try { order = JSON.parse(sessionStorage.getItem('mt_order_' + id) || 'null'); } catch (e) {}
    if (!order) { $('#confirm-box').innerHTML = '<h1>Ceci est une page de confirmation.</h1><p class="joke">Mais sans commande. Comme un purchase sans transaction_id.</p><a class="btn light" href="collection.html">Aller commander</a>'; $('#recap').remove(); return; }
    $('#order-id').textContent = order.id; $('#order-mail').textContent = order.email || '—';
    $('#recap-rows').innerHTML = order.lines.map(l => { const p = PRODUCT_BY_ID[l.id]; return `<tr><td>${l.qty} × ${p.name}${l.variant ? ' · ' + l.variant : ''}</td><td>${fmt(p.price * l.qty)}</td></tr>`; }).join('') + `<tr><td>Livraison (${order.shipping_tier})</td><td>${order.shipping ? fmt(order.shipping) : 'Offerte'}</td></tr>${order.coupon ? `<tr><td>Code ${order.coupon}</td><td>−${fmt(order.sub * .1)}</td></tr>` : ''}<tr><td>Total payé (pour de faux)</td><td>${fmt(order.value)}</td></tr>`;
    // Dédoublonnage : un purchase par transaction_id (désactivable dans le Labo)
    let done = []; try { done = JSON.parse(localStorage.getItem('mt_purchased') || '[]'); } catch (e) {}
    if (!done.includes(order.id) || MT.lab.dup_purchase) {
      MT.push({ event: 'purchase', ecommerce: { transaction_id: order.id, value: order.value, tax: order.tax, shipping: order.shipping, currency: 'EUR', coupon: order.coupon || undefined, payment_type: order.payment_type, shipping_tier: order.shipping_tier, items: order.items } });
      done.push(order.id); try { localStorage.setItem('mt_purchased', JSON.stringify(done)); } catch (e) {}
      $('#dedup-note').textContent = 'purchase poussé pour ' + order.id + '. Rechargez la page : il ne repartira pas (sauf si le Labo dit le contraire).';
    } else $('#dedup-note').textContent = 'Page rechargée : purchase NON repoussé (déjà envoyé pour ' + order.id + ').';
    Cart.clear();
    const cu = User.get(); if (cu && !done.includes(order.id + '_u')) { cu.orders = (cu.orders || 0) + 1; User.set(cu); }
  }

  // ---------- LEAD : RDV & CONTACT (generate_lead au submit, navigation sécurisée vers merci.html)
  if (page === 'rdv' || page === 'contact') {
    const f = $('form.lead-form'); const formId = f.dataset.formId; let started = false;
    f.addEventListener('focusin', () => { if (started) return; started = true; MT.push({ event: 'form_start', form_id: formId, form_name: f.dataset.formName }); });
    f.addEventListener('submit', e => { e.preventDefault();
      const d = new FormData(f); const leadType = page === 'rdv' ? 'appointment' : 'contact';
      const topic = d.get('topic') || d.get('subject') || ''; const leadId = 'L-' + Date.now().toString(36).toUpperCase();
      try { sessionStorage.setItem('mt_lead', JSON.stringify({ id: leadId, type: leadType, topic, slot: d.get('slot'), date: d.get('date'), name: d.get('name') })); } catch (e) {}
      MT.pushThen({ event: 'generate_lead', lead_type: leadType, lead_id: leadId, form_id: formId, form_name: f.dataset.formName, lead_topic: topic, company_size: d.get('size') || undefined, currency: 'EUR', value: leadType === 'appointment' ? 150 : 40 }, 'merci.html?type=' + leadType);
    });
    const dt = $('input[type="date"]'); if (dt) { const t = new Date(); t.setDate(t.getDate() + 1); dt.min = t.toISOString().slice(0, 10); dt.value = dt.min; }
  }
  if (page === 'merci') {
    let lead = null; try { lead = JSON.parse(sessionStorage.getItem('mt_lead') || 'null'); } catch (e) {}
    const type = qs.get('type') || (lead && lead.type) || 'contact';
    $('#merci-title').textContent = type === 'appointment' ? 'Ceci est une page de confirmation de rendez-vous.' : 'Ceci est une page de remerciement.';
    $('#merci-text').textContent = type === 'appointment' ? `Rendez-vous ${lead && lead.date ? 'le ' + new Date(lead.date).toLocaleDateString('fr-FR') + (lead.slot ? ' à ' + lead.slot : '') : 'noté'}. Personne ne viendra, mais la conversion est bien là.` : 'Votre message a été envoyé dans le vide intersidéral. L\'événement generate_lead, lui, est arrivé à bon port.';
    if (lead) $('#lead-id').textContent = lead.id;
  }

  // ---------- COMPTE : login / sign_up / logout
  if (page === 'account') {
    const u = User.get(); const form = $('#login-form'); let tab = 'login';
    const render = () => { const u = User.get(); $('#logged').style.display = u ? '' : 'none'; form.style.display = u ? 'none' : '';
      if (u) { $('#u-name').textContent = u.name || u.email; $('#u-id').textContent = u.id; $('#u-type').textContent = u.orders > 0 ? 'customer' : 'registered'; $('#u-method').textContent = u.method; $('#u-orders').textContent = u.orders || 0; } };
    render();
    $$('.steps [data-tab]').forEach(t => t.addEventListener('click', () => { tab = t.dataset.tab; $$('.steps [data-tab]').forEach(x => x.classList.toggle('on', x === t)); $('#f-name').style.display = tab === 'signup' ? '' : 'none'; $('#auth-submit').textContent = tab === 'signup' ? 'Créer mon faux compte' : 'Se connecter'; }));
    let started = false; form.addEventListener('focusin', () => { if (started) return; started = true; MT.push({ event: 'form_start', form_id: 'account_auth', form_name: 'Compte – authentification' }); });
    form.addEventListener('submit', e => { e.preventDefault();
      const d = new FormData(form); const email = d.get('email'), method = d.get('method');
      const prev = User.get(); const nu = { id: User.shortId(email), email, name: d.get('name') || (prev && prev.name) || null, method, since: (prev && prev.since) || new Date().toISOString().slice(0, 10), orders: (prev && prev.orders) || 0 };
      User.set(nu);
      MT.push({ event: tab === 'signup' ? 'sign_up' : 'login', method, user_id: nu.id, user_status: 'logged_in' });
      toast(tab === 'signup' ? 'Compte créé (pour de faux)' : 'Connecté (pour de faux)');
      const next = qs.get('next'); if (next) { setTimeout(() => location.href = next, 600); return; }
      render(); const a = $('#account-link'); if (a) a.textContent = 'Bonjour ' + (nu.name || email.split('@')[0]);
    });
    $('#logout').addEventListener('click', () => { const u = User.get(); User.clear(); MT.push({ event: 'logout', user_id: u ? u.id : undefined, user_status: 'guest' }); toast('Déconnecté'); render(); const a = $('#account-link'); if (a) a.textContent = 'Compte'; });
  }

  // ---------- LABO
  if (page === 'labo') {
    $$('[data-lab]').forEach(cb => { cb.checked = MT.lab[cb.dataset.lab]; cb.addEventListener('change', () => { localStorage.setItem('lab_' + cb.dataset.lab, cb.checked ? '1' : '0'); toast('Réglage enregistré — valable sur toutes les pages'); }); });
    const envSel = $('#lab-env'); envSel.value = localStorage.getItem('lab_env') || ''; envSel.addEventListener('change', () => { if (envSel.value) localStorage.setItem('lab_env', envSel.value); else localStorage.removeItem('lab_env'); toast('context.environment = ' + (envSel.value || 'auto')); });
    $('#reset-user').addEventListener('click', () => { User.clear(); toast('Utilisateur déconnecté'); });
    $('#reset-cart').addEventListener('click', () => { Cart.clear(); toast('Panier vidé'); });
    $('#reset-purchases').addEventListener('click', () => { localStorage.removeItem('mt_purchased'); toast('Historique purchase effacé'); });
    $('#reset-consent').addEventListener('click', () => { document.cookie = 'tarteaucitron=; Max-Age=0; path=/'; toast('Consentement effacé — rechargez'); });
    $('#reset-all').addEventListener('click', () => { ['mt_cart', 'mt_purchased', 'mt_user', 'lab_env'].concat(Object.keys(localStorage).filter(k => k.startsWith('lab_'))).forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); document.cookie = 'tarteaucitron=; Max-Age=0; path=/'; toast('Tout remis à zéro'); setTimeout(() => location.reload(), 600); });
    $('#fill-cart').addEventListener('click', () => { Cart.clear(); Cart.add('MT-MUG-001', '30 cl', 2); Cart.add('MT-TEE-003', 'M', 1); Cart.add('MT-PAD-006', null, 1); toast('Panier de démo rempli (3 lignes)'); });
    $('#fire-custom').addEventListener('click', () => { MT.push({ event: 'custom_test_event', test_id: Math.random().toString(36).slice(2, 8), fired_at: new Date().toISOString() }); toast('custom_test_event poussé'); });
  }
})();
