// Catalogue (faux) — une seule source de vérité pour les pages et le dataLayer
window.PRODUCTS = [
  { id:'MT-MUG-001', name:'Mug « dataLayer.push({ café: true }) »', price:14.90, compare:19.90, category:'Mugs', brand:'Maison Tracké',
    bg:'#e8e2d6', fg:'#141414', label:'dataLayer.push({\n  café: true\n})', badge:'Best-seller', variants:{ label:'Contenance', values:['30 cl','45 cl'] },
    desc:'Un mug. Il contient du café. Il ne contient aucun événement, c\'est vous qui les poussez. Lavable au lave-vaisselle, pas en Preview mode.' },
  { id:'MT-STK-002', name:'Pack de stickers « Preview mode »', price:4.90, category:'Papeterie', brand:'Maison Tracké',
    bg:'#d6dde8', fg:'#141414', label:'PREVIEW\nMODE\n● ON', badge:'Nouveau', variants:null,
    desc:'12 stickers pour signaler à vos collègues que vous êtes en train de débugger et qu\'il ne faut pas vous parler.' },
  { id:'MT-TEE-003', name:'T-shirt « 404 Tag Not Found »', price:29.00, category:'Textile', brand:'Maison Tracké',
    bg:'#141414', fg:'#fafafa', label:'404\nTAG NOT\nFOUND', variants:{ label:'Taille', values:['S','M','L','XL'] },
    desc:'Coton bio, coupe droite, sérigraphie monospace. Le seul 404 que vous aurez plaisir à porter.' },
  { id:'MT-NTB-004', name:'Carnet « Plan de marquage »', price:12.00, category:'Papeterie', brand:'Maison Tracké',
    bg:'#e2e8d6', fg:'#141414', label:'PLAN DE\nMARQUAGE\nv.finale.2', variants:{ label:'Format', values:['A5','A4'] },
    desc:'96 pages pointillées pour écrire un plan de marquage que personne ne respectera. Livré avec une page « v.finale.2 » déjà remplie.' },
  { id:'MT-CAP-005', name:'Casquette « Consent: granted »', price:24.00, category:'Textile', brand:'Maison Tracké',
    bg:'#ede0e0', fg:'#141414', label:'consent:\ngranted', variants:{ label:'Couleur', values:['Sable','Noir'] },
    desc:'Casquette brodée. Portée, elle n\'accorde aucun consentement réel — c\'est tout l\'intérêt.' },
  { id:'MT-PAD-006', name:'Tapis de souris « SELECT * FROM café »', price:9.90, category:'Bureau', brand:'Maison Tracké',
    bg:'#0062FF', fg:'#fafafa', label:'SELECT *\nFROM café\nLIMIT 1;', variants:null,
    desc:'Surface microfibre, base antidérapante. Requête optimisée pour les lundis.' },
  { id:'MT-HOD-007', name:'Hoodie « Server-side »', price:59.00, category:'Textile', brand:'Maison Tracké',
    bg:'#2b2b2b', fg:'#fafafa', label:'server\n—side', badge:'Édition limitée', variants:{ label:'Taille', values:['S','M','L'] },
    desc:'Molleton épais, capuche doublée. Tout se passe côté serveur, vous n\'avez rien à voir.' },
  { id:'MT-PST-008', name:'Affiche « L\'entonnoir qui fuit »', price:19.00, category:'Bureau', brand:'Maison Tracké',
    bg:'#f3eee2', fg:'#141414', label:'▼\n▽\n·', variants:{ label:'Format', values:['30×40','50×70'] },
    desc:'Illustration d\'un entonnoir de conversion qui perd 97 % de ses visiteurs. Papier 250 g, cadre non inclus, panier non inclus non plus.' }
];
window.PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

// Visuel produit : un SVG généré (pas d'images → zéro asset externe)
window.productArt = function (p, variant) {
  const lines = p.label.split('\n');
  const fs = lines.length > 2 ? 26 : 32;
  const text = lines.map((l, i) => `<tspan x="50%" dy="${i ? fs * 1.15 : 0}">${l.replace(/</g,'&lt;')}</tspan>`).join('');
  const y = 50 - (lines.length - 1) * fs * 1.15 / 2 / 3.2;
  return `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name.replace(/"/g,'&quot;')}">
    <rect width="320" height="320" fill="${p.bg}"/>
    <circle cx="260" cy="60" r="90" fill="${p.fg}" opacity=".06"/>
    <text x="50%" y="${y}%" dominant-baseline="middle" text-anchor="middle" font-family="JetBrains Mono, Menlo, monospace" font-size="${fs}" font-weight="500" fill="${p.fg}">${text}</text>
    ${variant ? `<text x="50%" y="92%" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="${p.fg}" opacity=".55">${variant}</text>` : ''}
  </svg>`;
};
window.fmt = n => n.toLocaleString('fr-FR', { style:'currency', currency:'EUR' });
