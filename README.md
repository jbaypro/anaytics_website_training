# Maison Tracké — site e-commerce d'entraînement analytics

Boutique **factice** (objets de bureau d'analyste) construite pour s'entraîner au tracking : parcours d'achat complet sans paiement, génération de leads, espace client simulé, CMP tarteaucitron mappée sur Consent Mode v2, dataLayer GA4 e-commerce complet et un **Labo** pour casser le site volontairement.

> Rien n'est vendu, rien n'est envoyé, aucun paiement n'est demandé. **Ne saisissez jamais de vraies données personnelles** dans les formulaires.

## Démarrer

1. **GTM** : remplacer `GTM-XXXXXXX` dans `build.py` (variable `GTM`), puis `python3 build.py` → les 11 pages HTML sont régénérées.
2. **GitHub Pages** : Settings → Pages → Deploy from branch `main` / root. Le site est `noindex` et anonyme.
3. En local : `python3 -m http.server 8000` puis http://localhost:8000.

Aucun build ni dépendance : HTML/CSS/JS statique. `build.py` sert uniquement à partager header/footer entre les pages (ne pas éditer les `.html` à la main, éditer `build.py`).

## Pages

| Page | page_type | Événements poussés |
|---|---|---|
| `index.html` | home | view_item_list, view_promotion, select_promotion, select_item |
| `collection.html` (`?cat=`, `?q=`) | collection / search_results | view_item_list, select_item, filter_apply, sort_apply, view_search_results |
| `product.html?sku=` | product / error_404 | view_item, select_variant, product_image_view, add_to_cart, add_to_wishlist, page_not_found |
| `cart.html` | cart | view_cart, add_to_cart, remove_from_cart, coupon_apply (`TRACKME`), checkout_click |
| `checkout.html` | checkout | begin_checkout, form_start, add_shipping_info, add_payment_info, checkout_progress, place_order_click |
| `confirmation.html?order=` | purchase_confirmation | purchase (dédoublonné par transaction_id) |
| `rdv.html`, `contact.html` | lead_form | form_start, generate_lead (lead_type appointment / contact) |
| `merci.html?type=` | lead_confirmation | — |
| `account.html` | account | form_start, login, sign_up, logout |
| `labo.html` | lab | custom_test_event |
| header / footer | — | search, newsletter_signup |

## Ordre de chargement dans le `<head>` (important)

```
consent-default.js      → gtag('consent','default') tout denied + update immédiat si cookie tarteaucitron
tarteaucitron.min.js    → CMP auto-hébergée
products.js + context.js→ push SANS event : { user, product, context }
tracking.js             → helpers MT.push / MT.pushThen + debugger dataLayer
GTM                     → démarre avec consentement + contexte déjà en place
```

### dataLayer contextuel (sans `event`)

```js
{
  user:    { status, id, type: guest|registered|customer, login_method, since, orders_count },
  product: { id, name, brand, category, price, compare_price, variant_type, variants, in_stock } | null,
  context: { site, environment, lang, country, currency, template_version, page_type, page_name, page_path,
             page_referrer, page_category|search_term|checkout_step|transaction_id|lead_type,
             cart_items, cart_value, consent_state, consent_analytics, consent_ads, timestamp }
}
```
Variables GTM : `user.id`, `product.id`, `context.page_type`… disponibles dès *Initialization – All Pages*.
`context.environment` : `training` (github.io), `dev` (localhost), `preview`, ou forcé depuis le Labo.

### Consentement : tarteaucitron ↔ Consent Mode v2

Six services custom (`assets/cmp.js`), un par signal : `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`, `functionality_storage`, `personalization_storage` (`security_storage` toujours granted). Quel que soit le nombre de services modifiés, **un seul** `gtag('consent','update')` et **un seul** événement `cmp_consent_update` (avec `consent_all` / `consent_none`) sont émis. Les clés de service sont préfixées `cm_` pour ne pas entrer en collision avec les services natifs de tarteaucitron (`analytics` = Google Analytics natif !).

### Helpers (`assets/tracking.js`)

- `MT.push(obj)` : pousse `{ecommerce:null}` avant tout événement e-commerce, applique les pannes du Labo.
- `MT.pushThen(obj, href)` : push + navigation via `eventCallback`/`eventTimeout` (évite les hits perdus à la redirection). Filet de sécurité 1,2 s si GTM n'est pas chargé.
- Bouton **dataLayer** en bas à droite : vue live de `window.dataLayer`, y compris les appels `gtag('consent', …)`.

## Labo (`labo.html`)

Pannes persistantes (localStorage `lab_*`) : retarder les push de 2,5 s · `value` en string · prix en string · rejouer `purchase` à chaque rechargement · supprimer `ecommerce:null` · désactiver la CMP · forcer `context.environment`. Outils : panier de démo, reset panier / purchases / consentement / utilisateur. Onze scénarios d'entraînement rédigés sur la page.

## Bonnes pratiques avant d'ouvrir le site à l'équipe

- Propriété GA4 **dédiée** (rétention 2 mois), conteneur GTM **dédié**, jamais lié à un compte Google Ads / Meta réel.
- Filtre de référent GA4 : l'ID de conteneur est public dans le HTML.
- Déclarer le traitement (finalité « formation interne ») et rappeler : données fictives uniquement.
- Pour un sGTM (scénario 7), utiliser une instance de test.

## Arborescence

```
build.py                 générateur des pages (header/footer/GTM ID)
*.html                   pages générées
assets/site.css          style (base claire éditoriale, hero et confirmation sombres)
assets/products.js       catalogue + visuels SVG générés
assets/context.js        dataLayer contextuel (avant GTM)
assets/consent-default.js Consent Mode défauts + lecture cookie
assets/cmp.js            services tarteaucitron ↔ Consent Mode
assets/tracking.js       helpers dataLayer + debugger + flags Labo
assets/shop.js           panier, pages, événements e-commerce & lead, compte
assets/flow.js           flux data animé (home) · assets/burst.js explosion (confirmation)
tarteaucitron/           CMP auto-hébergée (MIT)
```
