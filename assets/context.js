// dataLayer contextuel — exécuté dans le <head>, AVANT le snippet GTM, SANS clé "event".
// Un seul push, trois objets : user / product / context. Lisibles dès gtm.js via des variables
// "Data Layer Variable" imbriquées : user.id, product.id, context.page_type, context.environment…
(function () {
  window.dataLayer = window.dataLayer || [];
  const qs = new URLSearchParams(location.search);
  const file = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  const read = (store, k, d) => { try { return JSON.parse(store.getItem(k) || 'null') ?? d; } catch (e) { return d; } };

  // ---- context (navigation + environnement)
  const host = location.hostname;
  let environment = /github\.io$/.test(host) ? 'training' : /localhost|127\.0\.0\.1/.test(host) ? 'dev' : /claude\.ai|claudeusercontent/.test(host) ? 'preview' : 'training';
  try { environment = localStorage.getItem('lab_env') || environment; } catch (e) {}
  const types = { index: ['home', 'Accueil'], collection: ['collection', 'Collection'], product: ['product', 'Produit'], cart: ['cart', 'Panier'], checkout: ['checkout', 'Commande'],
    confirmation: ['purchase_confirmation', 'Confirmation de commande'], rdv: ['lead_form', 'Prise de rendez-vous'], contact: ['lead_form', 'Contact'], merci: ['lead_confirmation', 'Merci'], labo: ['lab', 'Labo'], account: ['account', 'Compte'] };
  const [page_type, page_name] = types[file] || ['other', file];
  const cart = read(localStorage, 'mt_cart', []);
  const consent = window.MT_STORED_CONSENT || null;
  const context = {
    site: 'maison-tracke', environment, lang: 'fr', country: 'FR', currency: 'EUR', template_version: '1.1',
    page_type, page_name, page_path: location.pathname, page_file: file + '.html', page_referrer: document.referrer || null,
    cart_items: cart.reduce((s, l) => s + (l.qty || 0), 0),
    cart_value: window.PRODUCT_BY_ID ? +cart.reduce((s, l) => s + ((PRODUCT_BY_ID[l.id] || { price: 0 }).price * (l.qty || 0)), 0).toFixed(2) : 0,
    consent_state: !consent ? 'unknown' : Object.values(consent).every(v => v === 'granted') ? 'all' : Object.values(consent).every(v => v === 'denied') ? 'denied' : 'partial',
    consent_analytics: consent ? consent.analytics_storage || 'denied' : 'denied',
    consent_ads: consent ? consent.ad_storage || 'denied' : 'denied',
    timestamp: new Date().toISOString()
  };
  if (file === 'collection') { const q = qs.get('q'), cat = qs.get('cat'); if (q) { context.page_type = 'search_results'; context.page_name = 'Recherche'; context.search_term = q; } else { context.page_category = cat || 'Tous'; context.page_name = 'Collection – ' + (cat || 'Tous'); } }
  if (file === 'checkout') context.checkout_step = 1;
  if (file === 'confirmation') context.transaction_id = qs.get('order') || null;
  if (file === 'merci') context.lead_type = qs.get('type') || null;

  // ---- product (page produit uniquement ; null ailleurs pour une structure stable)
  let product = null;
  if (file === 'product') {
    const p = window.PRODUCT_BY_ID && PRODUCT_BY_ID[qs.get('sku')];
    if (p) { product = { id: p.id, name: p.name, brand: p.brand, category: p.category, price: p.price, compare_price: p.compare || null, variant_type: p.variants ? p.variants.label : null, variants: p.variants ? p.variants.values : [], in_stock: true }; context.page_name = p.name; }
    else { context.page_type = 'error_404'; context.page_name = 'Produit introuvable'; context.requested_sku = qs.get('sku') || ''; }
  }

  // ---- user (login simulé, voir account.html)
  const u = read(localStorage, 'mt_user', null);
  const user = u
    ? { status: 'logged_in', id: u.id, type: u.orders > 0 ? 'customer' : 'registered', login_method: u.method, since: u.since, orders_count: u.orders || 0 }
    : { status: 'guest', id: null, type: 'guest', login_method: null, since: null, orders_count: 0 };

  window.MT_CONTEXT = { user, product, context };
  window.dataLayer.push({ user, product, context });
})();
