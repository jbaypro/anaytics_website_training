#!/usr/bin/env python3
"""Génère les pages HTML statiques (header/footer partagés). python3 build.py → écrit *.html à la racine."""
import pathlib

ROOT = pathlib.Path(__file__).parent
GTM = "GTM-XXXXXXX"  # ← remplacer par l'ID du conteneur de l'équipe

HEAD = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
<title>{title} — Maison Tracké</title>
<meta name="description" content="Site e-commerce factice d'entraînement analytics. Rien n'est à vendre, tout est à tracker.">
<!-- 0. Consent Mode v2 : défauts + choix stocké (lu dans le cookie tarteaucitron) -->
<script src="assets/consent-default.js"></script>
<!-- 0b. CMP tarteaucitron (auto-hébergée) : catégories mappées 1:1 sur Consent Mode, voir assets/cmp.js -->
<script src="tarteaucitron/tarteaucitron.min.js"></script>
<!-- 1. dataLayer contextuel SANS event (user / product / context), poussé avant GTM -->
<script src="assets/products.js"></script>
<script src="assets/context.js"></script>
<script src="assets/tracking.js"></script>
<!-- 2. Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}})(window,document,'script','dataLayer','{gtm}');</script>
<!-- End Google Tag Manager -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
</head>
<body data-page="{page}">
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<div class="site">
<div class="bar">Livraison offerte dès 50 € d'achats <b>fictifs</b> · <span class="mono">env: training</span></div>
<header class="top">
  <div class="in">
    <a class="brand" href="index.html"><span class="dot"></span>Maison Tracké</a>
    <button class="burger" type="button" aria-label="Menu" aria-expanded="false">Menu</button>
    <nav aria-label="Pages">
      <ul>
        <li><a href="collection.html" {c_collection}>Boutique</a></li>
        <li><a href="collection.html?cat=Textile">Textile</a></li>
        <li><a href="collection.html?cat=Mugs">Mugs</a></li>
        <li><a href="rdv.html" {c_rdv}>Prendre rendez-vous</a></li>
        <li><a href="contact.html" {c_contact}>Contact</a></li>
        <li><a href="labo.html" {c_labo}>Labo</a></li>
      </ul>
    </nav>
    <div class="right">
      <form class="search" role="search"><input type="search" name="q" placeholder="Chercher un objet inutile" aria-label="Recherche"><button type="submit" aria-label="Rechercher">⌕</button></form>
      <a class="cart-link" id="account-link" href="account.html" {c_account}>Compte</a>
      <a class="cart-link" href="cart.html" {c_cart}>Panier <span class="n">0</span></a>
    </div>
  </div>
</header>
<main>
"""

FOOT = """
</main>
<footer class="foot">
  <div class="in">
    <div>
      <a class="brand" href="index.html"><span class="dot"></span>Maison Tracké</a>
      <p style="font-size:13px;max-width:34ch">Des objets inutiles, des événements impeccables. Site d'entraînement pour équipes analytics — aucune commande n'est réelle.</p>
    </div>
    <div><h4>Boutique</h4><ul>
      <li><a href="collection.html">Tout le catalogue</a></li>
      <li><a href="collection.html?cat=Textile">Textile</a></li>
      <li><a href="collection.html?cat=Mugs">Mugs</a></li>
      <li><a href="collection.html?cat=Papeterie">Papeterie</a></li>
      <li><a href="collection.html?cat=Bureau">Bureau</a></li>
    </ul></div>
    <div><h4>Aide</h4><ul>
      <li><a href="rdv.html">Prendre rendez-vous</a></li>
      <li><a href="contact.html">Nous écrire</a></li>
      <li><a href="labo.html">Labo &amp; scénarios</a></li>
      <li><a href="account.html">Mon compte (fictif)</a></li>
      <li><a href="product.html?sku=INCONNU">Page produit 404</a></li>
    </ul></div>
    <div><h4>Newsletter</h4>
      <p style="font-size:13px;margin:0">Recevez zéro email. Mais déclenchez <code class="mono">newsletter_signup</code>.</p>
      <form class="news"><input type="email" placeholder="vous@exemple.fr" required aria-label="Email"><button class="btn primary" type="submit" style="padding:8px 14px;font-size:13px">OK</button></form>
    </div>
    <div class="copy"><span>© 2026 Maison Tracké · <button type="button" class="cookie-link" onclick="openCookieSettings()">Gérer les cookies</button></span><span>Site statique · GitHub Pages · <span class="mono">GTM {gtm}</span></span></div>
  </div>
</footer>
</div>
<script src="assets/cmp.js"></script>
<script src="assets/shop.js"></script>
{extra}
</body>
</html>
"""

PAGES = {}

PAGES["index"] = dict(title="Accueil", page="home", extra='<script src="assets/flow.js"></script>', body="""
<section class="hero-dark">
  <canvas id="flow" aria-hidden="true"></canvas>
  <div class="in">
    <div>
      <span class="eyebrow"><i></i>Boutique factice · dataLayer réel</span>
      <h1>Ceci est une <em>page d'accueil.</em></h1>
      <p>Elle vend des objets que personne n'achètera, pour que vous puissiez tracker un parcours d'achat complet sans qu'un seul euro ne bouge. Tout est faux, sauf les événements.</p>
      <div class="cta">
        <a class="btn light lg" href="collection.html" data-promo="hero_cta" data-promo-name="Hero – voir la boutique" data-creative="hero_primary" data-slot="hero_1">Voir la boutique</a>
        <a class="btn ghost-light lg" href="rdv.html" data-promo="hero_rdv" data-promo-name="Hero – prendre RDV" data-creative="hero_secondary" data-slot="hero_2">Prendre rendez-vous</a>
      </div>
    </div>
    <div class="console" aria-label="Aperçu du dataLayer">
      <div class="head"><b>window.dataLayer</b><span>parcours d'achat</span><span class="pill">● live</span></div>
      <pre><span class="ln"><span class="c">// ce que le site pousse, dans l'ordre</span></span><span class="ln"><span class="k">page_info</span>        <span class="c">{ page_type: </span><span class="s">"home"</span><span class="c"> }</span></span><span class="ln"><span class="k">view_item_list</span>   <span class="c">{ item_list_id: </span><span class="s">"home_featured"</span><span class="c"> }</span></span><span class="ln"><span class="k">select_item</span>      <span class="c">→ product.html</span></span><span class="ln"><span class="k">view_item</span>        <span class="c">{ value: </span><span class="n">14.90</span><span class="c"> }</span></span><span class="ln"><span class="k">add_to_cart</span>      <span class="c">{ quantity: </span><span class="n">1</span><span class="c"> }</span></span><span class="ln"><span class="k">begin_checkout</span>   <span class="c">→ add_shipping_info → add_payment_info</span></span><span class="ln"><span class="k">purchase</span>         <span class="c">{ transaction_id: </span><span class="s">"MT-…"</span><span class="c">, value: </span><span class="n">48.80</span><span class="c"> }</span></span><span class="ln"><span class="b">generate_lead</span>    <span class="c">{ lead_type: </span><span class="s">"appointment"</span><span class="c"> }</span></span><span class="ln"><span class="c">// ouvrez le bouton “dataLayer” en bas à droite pour voir tout passer</span></span></pre>
    </div>
  </div>
</section>

<section class="section">
  <div class="in">
    <div class="section-head"><div><h2>La sélection</h2><p>Quatre produits, un <code class="mono">view_item_list</code>. Cliquez, c'est un <code class="mono">select_item</code>.</p></div><a class="btn" href="collection.html">Tout voir</a></div>
    <div class="grid" id="featured"></div>
  </div>
</section>

<section class="section tight">
  <div class="in">
    <div class="tiles">
      <a class="tile dark" href="collection.html?cat=Textile" data-promo="tile_textile" data-promo-name="Tuile – Textile" data-creative="tile_dark" data-slot="home_tile_1"><span class="tag">Promotion</span><h3>Le textile qui ne dit rien aux gens normaux</h3><p>T-shirts, hoodies, casquettes. Vos collègues comprendront.</p></a>
      <a class="tile blue" href="cart.html" data-promo="tile_shipping" data-promo-name="Tuile – livraison offerte" data-creative="tile_blue" data-slot="home_tile_2"><span class="tag">Offre</span><h3>Livraison offerte dès 50 €</h3><p>Testez le seuil : <code class="mono">shipping</code> passe à 0 dans le purchase.</p></a>
      <a class="tile" href="rdv.html" data-promo="tile_rdv" data-promo-name="Tuile – audit" data-creative="tile_light" data-slot="home_tile_3"><span class="tag">Gen lead</span><h3>Un audit de votre tracking, pour de faux</h3><p>Formulaire de rendez-vous → <code class="mono">generate_lead</code>.</p></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="in" style="text-align:center">
    <p class="joke">« J'ai acheté le mug. Il est arrivé. C'est un vrai mug. » — personne, jamais.</p>
    <div class="cta" style="justify-content:center;margin-top:18px"><a class="btn primary lg" href="collection.html">Commencer un faux achat</a><a class="btn lg" href="contact.html">Poser une vraie question</a></div>
  </div>
</section>
""")

PAGES["collection"] = dict(title="Boutique", page="collection", body="""
<section class="section">
  <div class="in">
    <span class="eyebrow">Ceci est une page de liste</span>
    <div class="section-head"><div><h2 id="coll-title">Tout le catalogue</h2><p id="coll-count"></p></div></div>
    <ul class="filters">
      <li><button type="button" data-cat="Tous">Tous</button></li>
      <li><button type="button" data-cat="Textile">Textile</button></li>
      <li><button type="button" data-cat="Mugs">Mugs</button></li>
      <li><button type="button" data-cat="Papeterie">Papeterie</button></li>
      <li><button type="button" data-cat="Bureau">Bureau</button></li>
    </ul>
    <div class="toolbar"><span>Les filtres poussent <code class="mono">filter_apply</code>, le tri <code class="mono">sort_apply</code></span><select id="sort" aria-label="Trier"><option value="default">Tri : mis en avant</option><option value="asc">Prix croissant</option><option value="desc">Prix décroissant</option></select></div>
    <div class="grid" id="grid"></div>
  </div>
</section>
""")

PAGES["product"] = dict(title="Produit", page="product", body="""
<section class="section">
  <div class="in">
    <div class="pdp" id="pdp">
      <div class="gallery"><div class="art" id="p-art"></div><div class="thumbs" id="thumbs"></div></div>
      <div class="info">
        <span class="eyebrow">Ceci est une page produit</span>
        <div class="cat" id="p-cat" style="margin-top:14px"></div>
        <h1 id="p-name"></h1>
        <div class="price" id="p-price"></div>
        <p class="desc" id="p-desc"></p>
        <div class="opt" id="p-variants"></div>
        <div class="opt"><label>Quantité</label><div class="qty"><button type="button" id="q-minus" aria-label="Moins">−</button><input id="qty" value="1" inputmode="numeric" aria-label="Quantité"><button type="button" id="q-plus" aria-label="Plus">+</button></div></div>
        <div class="buy"><button type="button" class="btn primary lg" id="add">Ajouter au panier</button><button type="button" class="btn accent lg" id="buy-now">Acheter maintenant (pour de faux)</button></div>
        <button type="button" class="wish" id="wish">♡ Ajouter à la wishlist</button>
        <div class="specs">
          <details><summary>Livraison &amp; retours</summary><p>Livraison standard 4,90 € (offerte dès 50 €), express 9,90 €. Retours acceptés sous 30 jours, mais comme rien n'est envoyé, rien ne revient.</p></details>
          <details><summary>Composition</summary><p>100 % HTML, 0 % stock. Événements poussés : <code class="mono">view_item</code>, <code class="mono">select_variant</code>, <code class="mono">add_to_cart</code>, <code class="mono">add_to_wishlist</code>.</p></details>
          <details><summary>Pourquoi ce prix ?</summary><p>Parce qu'il fallait un <code class="mono">value</code> dans le dataLayer.</p></details>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section tight">
  <div class="in"><div class="section-head"><div><h2 style="font-size:32px">Vous aimerez aussi (statistiquement)</h2></div></div><div class="grid" id="related"></div></div>
</section>
""")

PAGES["cart"] = dict(title="Panier", page="cart", body="""
<section class="section">
  <div class="in">
    <span class="eyebrow">Ceci est un panier</span>
    <div class="section-head"><div><h2>Votre panier</h2><p>Tout est stocké en localStorage. Retirer un produit pousse <code class="mono">remove_from_cart</code>.</p></div></div>
    <div class="cart">
      <div id="lines"></div>
      <aside class="summary" id="summary">
        <h3>Récapitulatif</h3>
        <div class="row"><span>Sous-total</span><span id="s-sub"></span></div>
        <div class="row"><span>Livraison standard</span><span id="s-ship"></span></div>
        <form class="coupon" id="coupon"><input placeholder="Code promo (essayez TRACKME)" aria-label="Code promo"><button class="btn" type="submit">Appliquer</button></form>
        <div class="row total"><span>Total</span><span id="s-total"></span></div>
        <a class="btn primary block lg" id="to-checkout" href="checkout.html">Passer la commande</a>
        <p class="hint" style="margin:12px 0 0">Aucun paiement ne sera demandé. Promis.</p>
      </aside>
    </div>
  </div>
</section>
""")

PAGES["checkout"] = dict(title="Commande", page="checkout", body="""
<section class="section">
  <div class="in">
    <span class="eyebrow">Ceci est un tunnel de commande</span>
    <div class="section-head"><div><h2>Commander</h2><p><span class="fake">Aucun paiement réel</span> &nbsp;Trois étapes, trois événements : <code class="mono">add_shipping_info</code>, <code class="mono">add_payment_info</code>, puis <code class="mono">purchase</code> sur la confirmation.</p></div></div>
    <div class="steps"><span>1. Coordonnées</span><span>2. Paiement</span><span>3. Validation</span></div>
    <div class="checkout">
      <div>
        <form class="panel" data-step="1" id="f1">
          <h3>Coordonnées &amp; livraison</h3>
          <div class="two"><div class="f"><label>Prénom</label><input name="first" required autocomplete="off" placeholder="Ada"></div><div class="f"><label>Nom</label><input name="last" required autocomplete="off" placeholder="Lovelace"></div></div>
          <div class="f"><label>Email</label><input type="email" name="email" required placeholder="ada@exemple.fr"></div>
          <div class="f"><label>Adresse (fictive)</label><input name="address" required placeholder="1 rue du dataLayer, 75000 Paris"></div>
          <div class="f"><label>Mode de livraison</label><div class="choice">
            <label id="ship-std"><input type="radio" name="ship" value="standard" checked>Standard · 3-5 jours<span class="p">4,90 €</span></label>
            <label><input type="radio" name="ship" value="express">Express · demain (dans un monde idéal)<span class="p">9,90 €</span></label>
            <label><input type="radio" name="ship" value="pickup">Retrait en boutique (qui n'existe pas)<span class="p">Offert</span></label>
          </div></div>
          <button class="btn primary lg block" type="submit">Continuer vers le paiement</button>
        </form>
        <form class="panel" data-step="2" id="f2" style="display:none">
          <h3>Paiement <span class="fake" style="margin-left:8px">simulé</span></h3>
          <div class="f"><label>Moyen de paiement</label><div class="choice">
            <label><input type="radio" name="pay" value="card" checked>Carte bancaire (fausse)</label>
            <label><input type="radio" name="pay" value="paypal">PayPal (encore plus faux)</label>
            <label><input type="radio" name="pay" value="transfer">Virement (en monnaie de singe)</label>
          </div></div>
          <div class="f"><label>Numéro de carte</label><input name="card" value="4242 4242 4242 4242" readonly><span class="hint">Numéro de test figé : rien n'est saisi, rien n'est envoyé.</span></div>
          <div class="cta"><button class="btn back" type="button" data-to="1">Retour</button><button class="btn primary lg" type="submit" style="flex:1">Vérifier la commande</button></div>
        </form>
        <form class="panel" data-step="3" id="f3" style="display:none">
          <h3>Tout est faux, tout est prêt.</h3>
          <p>En cliquant ci-dessous, vous ne payez rien, vous ne recevez rien, et un <code class="mono">purchase</code> part sur la page suivante avec un <code class="mono">transaction_id</code> unique.</p>
          <div class="cta"><button class="btn back" type="button" data-to="2">Retour</button><button class="btn accent lg" type="submit" style="flex:1">Acheter, acheter (pour de faux)</button></div>
        </form>
      </div>
      <aside class="summary">
        <h3>Votre commande</h3>
        <div id="r-items"></div>
        <div class="row" style="border-top:1px solid var(--line);margin-top:8px;padding-top:12px"><span>Sous-total</span><span id="r-sub"></span></div>
        <div class="row"><span>Remise</span><span id="r-disc"></span></div>
        <div class="row"><span>Livraison</span><span id="r-ship"></span></div>
        <div class="row total"><span>Total</span><span id="r-total"></span></div>
      </aside>
    </div>
  </div>
</section>
""")

PAGES["confirmation"] = dict(title="Commande validée", page="confirmation", extra='<script src="assets/burst.js"></script>', body="""
<section class="section">
  <div class="in">
    <div class="confirm" id="confirm-box">
      <canvas id="paint" aria-hidden="true"></canvas>
      <span class="eyebrow" style="color:#a1a1aa">Ceci est une page de confirmation</span>
      <h1 style="margin-top:16px">Commande validée.<br>Pour de faux.</h1>
      <p>Merci ! Rien ne sera expédié à <b id="order-mail" style="color:#fff"></b>. En revanche, l'événement <code class="mono">purchase</code> vient de partir.</p>
      <div class="order">transaction_id : <b id="order-id"></b></div>
      <p class="hint" id="dedup-note" style="color:#71717a"></p>
      <div class="cta" style="justify-content:center"><a class="btn light" href="collection.html">Recommencer un faux achat</a><a class="btn ghost-light" href="labo.html">Aller au Labo</a></div>
    </div>
    <div class="recap" id="recap"><h3 style="margin-bottom:12px">Récapitulatif (identique à l'objet <code>ecommerce</code> du purchase)</h3><table><tbody id="recap-rows"></tbody></table></div>
  </div>
</section>
""")

PAGES["rdv"] = dict(title="Prendre rendez-vous", page="rdv", body="""
<section class="section">
  <div class="in">
    <div class="lead">
      <div class="pitch">
        <span class="eyebrow">Ceci est une page de génération de leads</span>
        <h1 style="margin-top:14px">Prenez rendez-vous pour un audit qui n'aura pas lieu.</h1>
        <p>30 minutes avec un consultant imaginaire. Le formulaire pousse <code class="mono">form_start</code> au premier focus et <code class="mono">generate_lead</code> à l'envoi, puis redirige vers une page de confirmation.</p>
        <ul><li>Valeur de lead : 150 € (fictifs, mais utiles pour tester <code class="mono">value</code>)</li><li>Redirection sécurisée par <code class="mono">eventCallback</code> + <code class="mono">eventTimeout</code></li><li>Champ date = demain minimum</li></ul>
      </div>
      <form class="panel lead-form" data-form-id="rdv_audit" data-form-name="Prise de RDV – audit">
        <h3>Vos informations (ne les mettez pas vraies)</h3>
        <div class="two"><div class="f"><label>Nom</label><input name="name" required placeholder="Grace Hopper"></div><div class="f"><label>Email pro</label><input type="email" name="email" required placeholder="grace@exemple.fr"></div></div>
        <div class="two"><div class="f"><label>Entreprise</label><input name="company" placeholder="Compagnie Générale du Pixel"></div><div class="f"><label>Taille</label><select name="size"><option value="1-10">1-10</option><option value="11-50">11-50</option><option value="51-250" selected>51-250</option><option value="250+">250+</option></select></div></div>
        <div class="f"><label>Sujet</label><select name="topic"><option value="audit_tracking">Audit tracking</option><option value="consent_mode">Consent Mode</option><option value="server_side">Server-side GTM</option><option value="ga4_migration">GA4</option><option value="autre">Autre / je ne sais pas</option></select></div>
        <div class="two"><div class="f"><label>Date</label><input type="date" name="date" required></div><div class="f"><label>Créneau</label><div class="slots"><label><input type="radio" name="slot" value="09:30" checked>09:30</label><label><input type="radio" name="slot" value="11:00">11:00</label><label><input type="radio" name="slot" value="14:30">14:30</label><label><input type="radio" name="slot" value="16:00">16:00</label><label><input type="radio" name="slot" value="17:30">17:30</label></div></div></div>
        <div class="f"><label>Un mot sur votre contexte</label><textarea name="message" placeholder="Nous avons 3 conteneurs GTM et personne ne sait pourquoi."></textarea></div>
        <button class="btn primary lg block" type="submit">Réserver ce créneau (fictif)</button>
      </form>
    </div>
  </div>
</section>
""")

PAGES["contact"] = dict(title="Contact", page="contact", body="""
<section class="section">
  <div class="in">
    <div class="lead">
      <div class="pitch">
        <span class="eyebrow">Ceci est une page contact</span>
        <h1 style="margin-top:14px">Une question ? Nous ne répondrons pas.</h1>
        <p>Mais le formulaire, lui, répond : <code class="mono">form_start</code>, puis <code class="mono">generate_lead</code> avec <code class="mono">lead_type: "contact"</code> et le sujet choisi.</p>
        <ul><li>Valeur de lead : 40 €</li><li>Même mécanique de redirection que le RDV</li><li>Comparez les deux formulaires dans GTM avec un seul trigger</li></ul>
      </div>
      <form class="panel lead-form" data-form-id="contact_question" data-form-name="Contact – question">
        <h3>Votre message</h3>
        <div class="two"><div class="f"><label>Nom</label><input name="name" required placeholder="Alan Turing"></div><div class="f"><label>Email</label><input type="email" name="email" required placeholder="alan@exemple.fr"></div></div>
        <div class="f"><label>Sujet</label><select name="subject"><option value="commande">Ma (fausse) commande</option><option value="produit">Question produit</option><option value="partenariat">Partenariat</option><option value="tracking_bug">J'ai vu un bug dans votre dataLayer</option></select></div>
        <div class="f"><label>Message</label><textarea name="message" required placeholder="Bonjour, mon mug n'est jamais arrivé. Normal ?"></textarea></div>
        <label class="toggle" style="border:0;padding:0 0 14px"><input type="checkbox" name="optin" value="1"> J'accepte de ne rien recevoir.</label>
        <button class="btn primary lg block" type="submit">Envoyer dans le vide</button>
      </form>
    </div>
  </div>
</section>
""")

PAGES["merci"] = dict(title="Merci", page="merci", body="""
<section class="section">
  <div class="in merci">
    <div class="big">✓</div>
    <h1 id="merci-title" style="font-size:clamp(32px,4.5vw,56px)">Ceci est une page de remerciement.</h1>
    <p id="merci-text" style="margin:16px auto 8px"></p>
    <p class="mono muted">lead_id : <span id="lead-id">—</span></p>
    <div class="cta" style="justify-content:center;margin-top:20px"><a class="btn primary" href="index.html">Retour à l'accueil</a><a class="btn" href="labo.html">Voir les scénarios du Labo</a></div>
  </div>
</section>
""")

PAGES["account"] = dict(title="Mon compte", page="account", body="""
<section class="section">
  <div class="in">
    <div class="lead">
      <div class="pitch">
        <span class="eyebrow">Ceci est un espace client</span>
        <h1 style="margin-top:14px">Connectez-vous à un compte qui n'existe pas.</h1>
        <p>N'importe quel email et mot de passe fonctionnent. La connexion pousse <code class="mono">login</code>, la création <code class="mono">sign_up</code>, la déconnexion <code class="mono">logout</code> — et l'objet <code class="mono">user</code> du dataLayer contextuel change sur toutes les pages suivantes.</p>
        <ul><li><code class="mono">user.id</code> stable par email (hash court)</li><li>Aucun email ni hash d'email dans le dataLayer : seul <code class="mono">user.id</code> circule</li><li><code class="mono">user.type</code> : guest → registered → customer après un achat</li></ul>
      </div>
      <div>
        <div class="panel" id="logged" style="display:none">
          <h3>Bonjour, <span id="u-name"></span></h3>
          <div class="recap" style="margin:0 0 18px"><table><tbody>
            <tr><td>user.id</td><td class="mono" id="u-id"></td></tr>
            <tr><td>user.type</td><td class="mono" id="u-type"></td></tr>
            <tr><td>Méthode</td><td class="mono" id="u-method"></td></tr>
            <tr><td>Commandes (fictives)</td><td class="mono" id="u-orders"></td></tr>
          </tbody></table></div>
          <div class="cta"><a class="btn primary" href="collection.html">Continuer mes faux achats</a><button class="btn" type="button" id="logout">Se déconnecter</button></div>
        </div>
        <form class="panel" id="login-form" style="display:none">
          <div class="steps" style="margin-bottom:20px"><span class="on" data-tab="login">Se connecter</span><span data-tab="signup">Créer un compte</span></div>
          <div class="f" id="f-name" style="display:none"><label>Prénom</label><input name="name" placeholder="Ada"></div>
          <div class="f"><label>Email</label><input type="email" name="email" required placeholder="ada@exemple.fr"></div>
          <div class="f"><label>Mot de passe (non vérifié, non stocké)</label><input type="password" name="password" required placeholder="••••••••"></div>
          <div class="f"><label>Méthode</label><div class="choice">
            <label><input type="radio" name="method" value="email" checked>Email</label>
            <label><input type="radio" name="method" value="google">Google (simulé)</label>
            <label><input type="radio" name="method" value="magic_link">Lien magique (simulé)</label>
          </div></div>
          <button class="btn primary lg block" type="submit" id="auth-submit">Se connecter</button>
        </form>
      </div>
    </div>
  </div>
</section>
""")

PAGES["labo"] = dict(title="Labo", page="labo", body="""
<section class="section">
  <div class="in">
    <span class="eyebrow">Ceci est le labo</span>
    <div class="section-head"><div><h2>Casser le site, proprement</h2><p>Réglages persistants (localStorage) qui modifient le comportement du dataLayer sur toutes les pages. Idéal pour s'entraîner à auditer, débugger et sécuriser un conteneur.</p></div></div>
    <div class="lab-grid">
      <div class="lab">
        <h3>Pannes volontaires</h3>
        <p>Activez, naviguez, observez dans GTM Preview / GA4 DebugView.</p>
        <label class="toggle"><input type="checkbox" data-lab="delay"><span>Retarder tous les push de 2,5 s<small>Vos triggers tirent-ils avant que les données arrivent ? (race conditions)</small></span></label>
        <label class="toggle"><input type="checkbox" data-lab="break_value"><span>Casser <code>value</code> (string « 48.8 € »)<small>GA4 ignore la valeur → revenu à 0. À détecter en audit.</small></span></label>
        <label class="toggle"><input type="checkbox" data-lab="string_price"><span>Prix des items en string<small>"14.90" au lieu de 14.9 — fonctionne… parfois.</small></span></label>
        <label class="toggle"><input type="checkbox" data-lab="dup_purchase"><span>Rejouer <code>purchase</code> à chaque rechargement<small>Pour tester une dédup côté GTM (cookie / variable de transaction_id).</small></span></label>
        <label class="toggle"><input type="checkbox" data-lab="no_ecommerce_reset"><span>Ne plus pousser <code>ecommerce: null</code><small>Les items de l'événement précédent fuient dans le suivant.</small></span></label>
        <label class="toggle"><input type="checkbox" data-lab="no_cmp"><span>Désactiver tarteaucitron<small>Simule un site sans CMP : Consent Mode reste sur les défauts (tout denied).</small></span></label>
      </div>
      <div class="lab">
        <h3>Outils</h3>
        <p>Raccourcis pour rejouer des scénarios sans re-cliquer partout.</p>
        <div class="cta" style="margin-bottom:18px"><button class="btn" type="button" id="fill-cart">Remplir un panier de démo</button><button class="btn" type="button" id="fire-custom">Pousser custom_test_event</button></div>
        <div class="f" style="margin-bottom:18px"><label>Forcer <code>context.environment</code></label><select id="lab-env"><option value="">auto (hôte)</option><option value="dev">dev</option><option value="preprod">preprod</option><option value="training">training</option><option value="prod">prod</option></select></div>
        <div class="cta" style="margin-bottom:18px"><button class="btn" type="button" id="reset-user">Déconnecter l'utilisateur</button><button class="btn" type="button" id="reset-cart">Vider le panier</button><button class="btn" type="button" id="reset-purchases">Oublier les purchases envoyés</button><button class="btn" type="button" id="reset-consent">Effacer le consentement</button></div>
        <button class="btn primary" type="button" id="reset-all">Tout remettre à zéro</button>
        <h3 style="margin-top:28px">Cheat-sheet dataLayer</h3>
        <p class="mono" style="line-height:1.9">(push sans event : user / product / context) · login · logout · sign_up · checkout_progress · view_promotion · select_promotion · view_item_list · select_item · search · view_search_results · filter_apply · sort_apply · view_item · select_variant · product_image_view · add_to_wishlist · add_to_cart · remove_from_cart · view_cart · coupon_apply · checkout_click · begin_checkout · form_start · add_shipping_info · add_payment_info · place_order_click · purchase · generate_lead · newsletter_signup · cmp_consent_update · page_not_found · custom_test_event</p>
      </div>
    </div>

    <div class="lab" style="margin-top:20px">
      <h3>Scénarios d'entraînement</h3>
      <p>Chaque scénario = une compétence. Faites-les dans l'ordre ou piochez.</p>
      <div class="scenario"><b>1. Plan de marquage GA4 e-commerce de A à Z</b>Créer les triggers <code>Custom Event</code> et un tag GA4 « événement e-commerce » qui lit <code>ecommerce</code> depuis le dataLayer. Vérifier dans DebugView que <code>purchase</code> remonte revenu, taxe, livraison, coupon et items.</div>
      <div class="scenario"><b>2. Consent Mode v2 : avant / après</b>La bannière tarteaucitron expose six catégories mappées 1:1 sur <code>analytics_storage</code>, <code>ad_storage</code>, <code>ad_user_data</code>, <code>ad_personalization</code>, <code>personalization_storage</code>, <code>functionality_storage</code> (<code>security_storage</code> toujours granted). Tout refuser, naviguer, personnaliser, puis tout accepter : comparer <code>gcs</code>/<code>gcd</code> dans les hits, les cookies posés, et utiliser <code>cmp_consent_update</code> (clés <code>consent_all</code>, <code>consent_none</code>) comme trigger de déclenchement différé.</div>
      <div class="scenario"><b>3. Dédoublonnage du purchase</b>Activer « Rejouer purchase », recharger la confirmation 3 fois, puis bloquer les doublons dans GTM (variable cookie <code>transaction_id</code> ou template de dédup).</div>
      <div class="scenario"><b>4. Audit d'un dataLayer cassé</b>Un·e collègue active 2 ou 3 pannes sans le dire. L'autre doit les identifier avec Preview + DebugView + Network, puis documenter.</div>
      <div class="scenario"><b>5. Lead vs e-commerce dans un même conteneur</b>Un seul trigger <code>generate_lead</code>, deux formulaires, une conversion Google Ads par <code>lead_type</code>. Bonus : conversion « RDV » avec valeur dynamique.</div>
      <div class="scenario"><b>6. Redirection après submit</b>Désactiver <code>eventCallback</code> dans <code>tracking.js</code> et observer les hits perdus sur formulaires. Remettre, puis comparer avec <code>transport_type: beacon</code>.</div>
      <div class="scenario"><b>7. Server-side</b>Pointer le conteneur web vers un sGTM (Addingwell, GCP…), activer un client GA4, rejouer le parcours, comparer les requêtes <code>/g/collect</code> first-party.</div>
      <div class="scenario"><b>8. Promotions &amp; listes</b>Construire un rapport d'exploration « Promotion » et « Item list ». Vérifier que <code>select_item</code> conserve bien <code>item_list_id</code> jusqu'au <code>purchase</code> (attribution de liste).</div>
      <div class="scenario"><b>9. Race condition</b>Activer « Retarder les push », créer un tag qui lit <code>page_type</code> sur <code>gtm.js</code> et observer la valeur undefined. Corriger avec un trigger <code>page_info</code>.</div>
      <div class="scenario"><b>10. dataLayer contextuel &amp; utilisateur connecté</b>Créer les variables imbriquées <code>context.page_type</code>, <code>user.status</code>, <code>user.id</code>, <code>product.id</code> et vérifier qu'elles sont déjà remplies sur <code>Initialization – All Pages</code>. Se connecter sur la page Compte, envoyer <code>user_id</code> à GA4, comparer un parcours invité vs connecté. Bonus : envoyer <code>user.id</code> en <code>user_id</code> GA4 et activer le reporting cross-device.</div>
      <div class="scenario"><b>11. Piano / Meta / TikTok</b>Dupliquer le plan e-commerce vers un autre outil à partir du même dataLayer, sans toucher au site.</div>
    </div>
  </div>
</section>
""")

def build():
    for name, p in PAGES.items():
        cur = {k: "" for k in ("c_collection", "c_rdv", "c_contact", "c_labo", "c_cart", "c_account")}
        key = {"collection": "c_collection", "rdv": "c_rdv", "contact": "c_contact", "labo": "c_labo", "cart": "c_cart", "account": "c_account"}.get(name)
        if key: cur[key] = 'aria-current="page"'
        html = HEAD.format(title=p["title"], page=p["page"], gtm=GTM, **cur) + p["body"] + FOOT.format(gtm=GTM, extra=p.get("extra", ""))
        (ROOT / f"{name}.html").write_text(html, encoding="utf-8")
        print("✓", f"{name}.html")

if __name__ == "__main__":
    build()
