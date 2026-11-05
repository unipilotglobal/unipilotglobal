#!/usr/bin/env node
/* UNIPILOT GLOBAL: makes the pilots readable for Google and AI tools (ChatGPT, Perplexity, ...).
 *
 * What it does (no browser needed, only Node 18+):
 *   1. reads the public pilot list from your database (the same list the Pilots page shows; no private data)
 *   2. writes one ready-made page per pilot:  pilot/<slug>.html   (name, photo, studied in, scholarships, how they help, ...)
 *   3. puts a plain list of all pilots into pilots.html (visible before any JavaScript runs)
 *   4. writes data/pilots-static.json (used by the sitemap) and refreshes sitemap.xml
 * If the database cannot be reached, or returns nothing, it changes NOTHING (so a bad moment never empties your site).
 * Runs by itself every day through .github/workflows/pilots.yml, and by hand:  node tools/build_pilots.js
 */
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..'), SITE = 'https://unipilotglobal.com', OUT = path.join(ROOT, 'pilot');
const cfg = ['config.js', 'accounts.js'].map(f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } }).join('\n');
const pick = k => { const m = new RegExp(k + '\\s*[:=]\\s*[\'"]([^\'"]+)[\'"]').exec(cfg); return m ? m[1] : ''; };
const URL_ = (process.env.SUPABASE_URL || pick('supabaseUrl')).replace(/\/$/, ''), KEY = process.env.SUPABASE_KEY || pick('supabaseKey');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = o => JSON.stringify(o).replace(/</g, '\\u003c');
const arr = v => Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean) : (typeof v === 'string' && v.trim() ? v.split(/[;,|]/).map(x => x.trim()).filter(Boolean) : []);
const cut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '...' : t; };
const list = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

async function load() {
  const base = 'slug,display_name,headline,bio,field,studied_in,universities,scholarships,languages,helps_with,photo_url';
  for (const cols of ['id,education,highlights,based_in,tagline,from_price_cents,has_volunteer_slot,' + base, 'id,education,highlights,based_in,tagline,' + base, base]) {
    try {
      const r = await fetch(URL_ + '/rest/v1/v_pilot_cards?select=' + cols + '&limit=500', { headers: { apikey: KEY, Accept: 'application/json' } });
      if (!r.ok) continue; const j = await r.json(); if (Array.isArray(j)) return j;
    } catch (e) { console.log('Could not reach the database: ' + e.message); return null; }
  }
  return null;
}

function shellParts() {                      // header and footer, copied from the ready-made list page, so the pages look right before JavaScript starts
  try {
    const h = fs.readFileSync(path.join(ROOT, 'opportunities.html'), 'utf8');
    const a = h.indexOf('<div id="hdr">'), b = h.indexOf('<main'), c = h.indexOf('<div id="ftr">'), d = h.indexOf('<noscript');
    return { hdr: h.slice(a + 14, b).replace(/<\/div>\s*$/, ''), ftr: h.slice(c + 14, d).replace(/<\/div>\s*$/, '') };
  } catch (e) { return { hdr: '', ftr: '' }; }
}

function pageFor(p, all, tpl, sh) {
  const url = SITE + '/pilot/' + p.slug + '.html', role = p.role, studied = p.studied, ttl = p.name + (role ? ', ' + role : ', UniPilot pilot') + ' | UNIPILOT GLOBAL';
  const dsc = cut(p.about || (p.name + ' is a UniPilot pilot' + (studied.length ? ' who studied in ' + list(studied) : '') + (p.tags.length ? ' with ' + list(p.tags.slice(0, 3)) : '') + '.'), 158);
  const facts = [['Field', p.field], ['Studied in', list(studied)], ['Universities', list(p.unis)], ['Scholarships', list(p.tags)], ['Languages', list(p.langs)], ['Based in', p.loc], ['Sessions', (p.from ? 'from ' + '\u20ac' + (p.from % 1 ? p.from.toFixed(2) : p.from) : '') + (p.from && p.free ? ', ' : '') + (p.free ? 'a free session is available' : '')]].filter(f => f[1]);
  const person = { '@type': 'Person', '@id': url + '#person', name: p.name, url, description: cut(p.about, 300) || undefined, jobTitle: role || undefined, image: p.photo || undefined, knowsLanguage: p.langs.length ? p.langs : undefined,
    knowsAbout: Array.from(new Set([p.field].concat(p.helps, p.tags).filter(Boolean))), alumniOf: p.unis.length ? p.unis.map(u => ({ '@type': 'CollegeOrUniversity', name: u })) : undefined, worksFor: { '@id': SITE + '/#org' } };
  const others = all.filter(o => o.slug !== p.slug && (o.field === p.field || o.studied.some(s => studied.includes(s)))).slice(0, 6);
  const body = '<section class="sec"><div class="w" style="max-width:860px"><p class="mute" style="margin:0 0 14px"><a href="pilots.html">&larr; All pilots</a></p>'
    + '<div style="display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" width="140" height="140" style="width:140px;height:140px;border-radius:50%;object-fit:cover;object-position:center 22%">' : '')
    + '<div style="flex:1;min-width:240px"><span class="eyebrow">UniPilot pilot</span><h1 style="margin:4px 0 6px">' + esc(p.name) + '</h1>' + (role ? '<p style="font-size:1.1rem;margin:0 0 6px"><b>' + esc(role) + '</b></p>' : '') + (p.tagline && p.tagline !== role ? '<p class="mute" style="margin:0">' + esc(p.tagline) + '</p>' : '') + '</div></div>'
    + (facts.length ? '<dl style="margin:26px 0;display:grid;grid-template-columns:max-content 1fr;gap:8px 20px">' + facts.map(f => '<dt><b>' + esc(f[0]) + '</b></dt><dd style="margin:0">' + esc(f[1]) + '</dd>').join('') + '</dl>' : '')
    + (p.about ? '<h2>About ' + esc(p.name.split(' ')[0]) + '</h2><p style="white-space:pre-line">' + esc(p.about) + '</p>' : '')
    + (p.helps.length ? '<h2>How ' + esc(p.name.split(' ')[0]) + ' can help you</h2><ul>' + p.helps.map(h => '<li>' + esc(h) + '</li>').join('') + '</ul>' : '')
    + (p.edu.length ? '<h2>Education</h2><ul>' + p.edu.map(h => '<li>' + esc(h) + '</li>').join('') + '</ul>' : '')
    + (p.exp.length ? '<h2>Highlights</h2><ul>' + p.exp.map(h => '<li>' + esc(h) + '</li>').join('') + '</ul>' : '')
    + '<div class="box c" style="margin-top:30px"><h3>Book a session with ' + esc(p.name.split(' ')[0]) + '</h3><p class="mute">Pick a time that suits you and tell your pilot your goal before the call.</p><p style="margin:0"><a class="btn" href="pilots.html?pilot=' + encodeURIComponent(p.slug) + '">View profile and book</a></p></div>'
    + (others.length ? '<h2 style="margin-top:34px">Other pilots you may like</h2><ul>' + others.map(o => '<li><a href="pilot/' + encodeURIComponent(o.slug) + '.html">' + esc(o.name) + '</a>' + (o.role ? ' - ' + esc(cut(o.role, 80)) : '') + '</li>').join('') + '</ul>' : '')
    + '</div></section>';
  let h = tpl.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(ttl) + '</title>').replace('<meta charset="utf-8">', '<meta charset="utf-8"><base href="/">');
  const setMeta = (re, val) => { h = h.replace(re, m => m.replace(/content="[^"]*"/, 'content="' + esc(val) + '"')); };
  setMeta(/<meta name="description"[^>]*>/, dsc); setMeta(/<meta property="og:title"[^>]*>/, ttl); setMeta(/<meta property="og:description"[^>]*>/, dsc); setMeta(/<meta property="og:url"[^>]*>/, url);
  h = h.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">');
  if (p.photo) h = h.replace(/<meta property="og:image"[^>]*>/, '<meta property="og:image" content="' + esc(p.photo) + '">');
  h = h.replace('</head>', '<script type="application/ld+json">' + ld({ '@context': 'https://schema.org', '@graph': [{ '@type': 'ProfilePage', '@id': url + '#page', url, name: ttl, description: dsc, inLanguage: 'en', dateModified: new Date().toISOString().slice(0, 10), isPartOf: { '@id': SITE + '/#site' }, mainEntity: { '@id': url + '#person' } }, person,
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Pilots', item: SITE + '/pilots.html' }, { '@type': 'ListItem', position: 3, name: p.name, item: url }] }] }) + '</script></head>');
  const m0 = h.indexOf('<main'), m1 = h.indexOf('</main>') + 7;
  h = h.slice(0, m0) + '<main id="main" tabindex="-1">' + body + '</main>' + h.slice(m1);
  h = h.replace(/<div class="fdbg"[\s\S]*?(<div id="ftr">)/, '$1');          // the filter drawer and booking windows belong to the list page only
  h = h.replace('<div id="hdr"></div>', '<div id="hdr">' + sh.hdr + '</div>').replace('<div id="ftr"></div>', '<div id="ftr">' + sh.ftr + '</div>');
  h = h.replace(/assets\/pg-pilots\.js/, 'assets/pg-pilot.js');
  return h;
}

(async () => {
  const rows = await load();
  if (!rows || !rows.length) { console.log('No pilots received: nothing changed.'); return; }
  const all = rows.map(r => {
    const slug = String(r.slug || r.id || '').trim().toLowerCase(); if (!/^[a-z0-9-]{2,60}$/.test(slug) || !String(r.display_name || '').trim()) return null;
    const ph = String(r.photo_url || '').trim();
    return { slug, name: String(r.display_name).trim(), role: String(r.headline || '').trim(), tagline: String(r.tagline || '').trim(), about: String(r.bio || '').trim(), field: String(r.field || '').trim(), studied: arr(r.studied_in), unis: arr(r.universities), tags: arr(r.scholarships),
      langs: arr(r.languages), helps: arr(r.helps_with), edu: arr(r.education), exp: arr(r.highlights), loc: String(r.based_in || '').trim(), from: +r.from_price_cents > 0 ? Math.round(+r.from_price_cents) / 100 : 0, free: r.has_volunteer_slot === true, photo: /^https:\/\//i.test(ph) ? ph : '' };
  }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  const sh = shellParts(), tpl = fs.readFileSync(path.join(ROOT, 'pilots.html'), 'utf8').replace(/<!--PSTART-->[\s\S]*?<!--PEND-->/, '').replace(/<script type="application\/ld\+json" id="pilots-ld">[\s\S]*?<\/script>/, '');
  fs.mkdirSync(OUT, { recursive: true }); const keep = new Set();
  all.forEach(p => { fs.writeFileSync(path.join(OUT, p.slug + '.html'), pageFor(p, all, tpl, sh)); keep.add(p.slug + '.html'); });
  fs.readdirSync(OUT).forEach(f => { if (/\.html$/.test(f) && !keep.has(f)) fs.unlinkSync(path.join(OUT, f)); });      // a pilot who left is removed
  // the plain list inside pilots.html
  const cards = all.map(p => '<article class="mc"><div class="mph">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">' : '') + '</div><div class="mb"><h3><a href="pilot/' + p.slug + '.html">' + esc(p.name) + '</a></h3>' + (p.role ? '<p class="mr">' + esc(p.role) + '</p>' : '')
    + '<p class="mt2">' + esc([p.studied.length ? 'Studied in ' + list(p.studied) : '', p.tags.length ? list(p.tags.slice(0, 3)) : ''].filter(Boolean).join(' - ')) + '</p><div class="mact"><a class="btn sm out" href="pilot/' + p.slug + '.html">View profile</a></div></div></article>').join('');
  const pl = fs.readFileSync(path.join(ROOT, 'pilots.html'), 'utf8').replace(/<!--PSTART-->[\s\S]*?<!--PEND-->/, '').replace(/<script type="application\/ld\+json" id="pilots-ld">[\s\S]*?<\/script>/, '');
  const itemLd = '<script type="application/ld+json" id="pilots-ld">' + ld({ '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': SITE + '/pilots.html#page', url: SITE + '/pilots.html', name: 'UniPilot pilots', isPartOf: { '@id': SITE + '/#site' },
    mainEntity: { '@type': 'ItemList', numberOfItems: all.length, itemListElement: all.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + '/pilot/' + p.slug + '.html', name: p.name })) } }) + '</script>';
  let out = pl.replace(/(<div class="mg" id="mg"[^>]*>)(<\/div>)/, '$1<!--PSTART-->' + cards.replace(/\$/g, '$$$$') + '<!--PEND-->$2').replace('</head>', itemLd + '</head>');
  if (out.indexOf('<!--PSTART-->') < 0) { console.log('Could not find the pilot list place in pilots.html: list not updated.'); } else fs.writeFileSync(path.join(ROOT, 'pilots.html'), out);
  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'data', 'pilots-static.json'), JSON.stringify(all.map(p => p.slug)));
  console.log('Pilot pages written: ' + all.length);
  const xl = ['content.xlsx'].map(f => path.join(ROOT, f)).find(f => fs.existsSync(f));
  if (xl) spawnSync('python3', [path.join(ROOT, 'tools', 'make_sitemap.py'), xl, path.join(ROOT, 'sitemap.xml')], { stdio: 'inherit' });
})();
