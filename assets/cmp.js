// tarteaucitron (auto-hébergé) : une catégorie par signal Consent Mode v2.
// « Tout accepter » → les 6 services sont autorisés → un seul gtag('consent','update') avec TOUT en granted,
// + un seul événement dataLayer `cmp_consent_update`. « Tout refuser » → tout en denied.
(function () {
  if (window.MT && MT.lab.no_cmp) return;           // Labo : simuler un site sans CMP
  tarteaucitron.init({
    privacyUrl: '', bodyPosition: 'bottom', hashtag: '#tarteaucitron', cookieName: 'tarteaucitron',
    orientation: 'middle', groupServices: false, showDetailsOnClick: true, serviceDefaultState: 'wait',
    showAlertSmall: false, cookieslist: false, closePopup: false, showIcon: false, adblocker: false,
    DenyAllCta: true, AcceptAllCta: true, highPrivacy: true, alwaysNeedConsent: false, handleBrowserDNTRequest: false,
    removeCredit: false, moreInfoLink: true, useExternalCss: false, useExternalJs: false, mandatory: true, mandatoryCta: false,
    googleConsentMode: false,   // on gère Consent Mode nous-mêmes (évite le 2e "consent default" tardif de tarteaucitron)
    bingConsentMode: false, softConsentMode: false, partnersList: false
  });

  // ---- état courant & mise à jour consolidée (un seul push même si 6 services changent d'un coup)
  const state = {}; Object.values(MT_CONSENT_MAP).flat().forEach(sig => state[sig] = (window.MT_STORED_CONSENT || {})[sig] || 'denied');
  let last = window.MT_STORED_CONSENT ? JSON.stringify(state) : null, timer = null, source = 'banner'; // null → le 1er choix explicite est toujours émis, même « tout refuser »
  function set(key, granted) {
    MT_CONSENT_MAP[key].forEach(sig => state[sig] = granted ? 'granted' : 'denied');
    clearTimeout(timer);
    timer = setTimeout(() => {
      const now = JSON.stringify(state); if (now === last) return; last = now;
      gtag('consent', 'update', Object.assign({}, state));
      const vals = Object.values(state);
      window.dataLayer.push(Object.assign({ event: 'cmp_consent_update', cmp: 'tarteaucitron', consent_source: source, consent_all: vals.every(v => v === 'granted'), consent_none: vals.every(v => v === 'denied') }, state));
      window.MT_STORED_CONSENT = Object.assign({}, state);
    }, 0);
  }

  // ---- un service tarteaucitron par signal (6)
  const services = [
    ['cm_analytics', 'analytic', 'Mesure d’audience (analytics_storage)', 'GA4, Piano. Cookies _ga, _gid, _ga_*.', ['_ga', '_gid', '_ga_*']],
    ['cm_adstorage', 'ads', 'Cookies publicitaires (ad_storage)', 'Google Ads, Meta, TikTok. Cookies _gcl_au, _fbp, _ttp.', ['_gcl_au', '_fbp', '_ttp']],
    ['cm_aduserdata', 'ads', 'Données utilisateur publicitaires (ad_user_data)', 'Envoi de données utilisateur à Google à des fins publicitaires.', []],
    ['cm_adpersonalization', 'ads', 'Publicité personnalisée (ad_personalization)', 'Remarketing et audiences.', []],
    ['cm_functionality', 'other', 'Fonctionnel (functionality_storage)', 'Préférences de langue, panier.', []],
    ['cm_personalization', 'other', 'Personnalisation du contenu (personalization_storage)', 'Recommandations, A/B tests.', []]
  ];
  services.forEach(([key, type, name, desc, cookies]) => {
    tarteaucitron.services[key] = {
      key, type, name, uri: 'https://support.google.com/tagmanager/answer/10718549', needConsent: true, cookies,
      readmoreLink: 'labo.html', description: desc,
      js: function () { set(key, true); },
      fallback: function () {              // appelé aussi en "wait" : ne réagir qu'à un refus stocké
        const c = decodeURIComponent((document.cookie.match(/(?:^|; )tarteaucitron=([^;]*)/) || [])[1] || '');
        if (new RegExp('(^|!)' + key + '=false').test(c)) set(key, false);
      }
    };
    document.addEventListener(key + '_disallowed', () => set(key, false));
    (tarteaucitron.job = tarteaucitron.job || []).push(key);
  });

  window.openCookieSettings = function () { source = 'footer_link'; tarteaucitron.userInterface.openPanel(); };
  // verrouille la page tant qu'aucun choix n'est fait (comme un vrai mur de consentement)
  (function lock() {
    const apply = () => { const root = document.getElementById('tarteaucitronRoot'); const open = !!(root && root.classList.contains('tarteaucitronBeforeVisible')); ['main', 'footer', 'header'].forEach(s => { const el = document.querySelector(s); if (el) open ? el.setAttribute('inert', '') : el.removeAttribute('inert'); }); return root; };
    const watch = () => { const root = apply(); if (!root) return setTimeout(watch, 100); new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['class'] }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
  })();
})();
