// Google Consent Mode v2 — état par défaut, AVANT tarteaucitron et AVANT GTM.
// Puis, si le visiteur a déjà choisi (cookie tarteaucitron), mise à jour immédiate : GTM démarre avec le bon état.
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 800
});
var tarteaucitronForceLanguage = 'fr';

// Catégories tarteaucitron (clé de service) → signaux Consent Mode. Même table dans cmp.js.
window.MT_CONSENT_MAP = {
  cm_analytics:         ['analytics_storage'],
  cm_adstorage:         ['ad_storage'],
  cm_aduserdata:        ['ad_user_data'],
  cm_adpersonalization: ['ad_personalization'],
  cm_functionality:     ['functionality_storage'],
  cm_personalization:   ['personalization_storage']
};
// Lecture synchrone du cookie "tarteaucitron=!analytics=true!ads=false…"
// MT_STORED_CONSENT : null si aucun choix stocké, sinon {signal: granted|denied} (lu par context.js)
window.MT_STORED_CONSENT = (function () {
  var raw = decodeURIComponent((document.cookie.match(/(?:^|; )tarteaucitron=([^;]*)/) || [])[1] || '');
  var state = {}, any = false;
  Object.keys(MT_CONSENT_MAP).forEach(function (key) {
    var m = raw.match(new RegExp('(?:^|!)' + key + '=(true|false)'));
    MT_CONSENT_MAP[key].forEach(function (sig) { state[sig] = m ? (m[1] === 'true' ? 'granted' : 'denied') : 'denied'; });
    if (m) any = true;
  });
  if (!any) return null;
  gtag('consent', 'update', state);
  return state;
})();
