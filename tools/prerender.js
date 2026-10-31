#!/usr/bin/env node
/* UNIPILOT GLOBAL: builds one ready-made HTML page for every opportunity in content.xlsx.

   Why: your site builds its pages with JavaScript. Search engines and AI tools that do not run JavaScript would see an empty
   page. This tool opens every opportunity page in a real browser, saves what the visitor sees as plain HTML in /o/<id>.html,
   and adds FAQ + step-by-step markup (schema.org) built from the same visible text.

   Run it in the website folder:
       npm install playwright     (once)
       npx playwright install chromium     (once)
       node tools/prerender.js content.xlsx
   It writes: o/<id>.html for every opportunity, data/static-ids.js, and a new sitemap.xml (through tools/make_sitemap.py).
*/
const fs = require('fs'), path = require('path'), http = require('http'), { spawnSync } = require('child_process');
const { chromium } = require('playwright');
const ROOT = process.cwd(), SITE = 'https://unipilotglobal.com', XLSX = path.resolve(process.argv[2] || 'content.xlsx'), OUT = path.join(ROOT, 'o');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xlsx': 'application/octet-stream', '.svg': 'image/svg+xml' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ldJson = o => JSON.stringify(o).replace(/</g, '\\u003c');

function serve() {                                       // tiny local web server: your site folder, but /content.xlsx is the file you gave
  const srv = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html';
    const f = u === '/content.xlsx' ? XLSX : path.join(ROOT, u);
    if (!f.startsWith(ROOT) && f !== XLSX) { res.writeHead(403); return res.end(); }
    fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); return res.end('not found'); } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(b); });
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

(async () => {
  if (!fs.existsSync(XLSX)) { console.error('Cannot find ' + XLSX); process.exit(1); }
  const srv = await serve(), base = 'http://127.0.0.1:' + srv.address().port, br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route(/^https?:\/\/[^/]*(supabase\.co|youtube|ytimg|formsubmit|web3forms|cloudflare|google)/, r => r.abort());
  const template = fs.readFileSync(path.join(ROOT, 'opportunity.html'), 'utf8');

  // pass 1: the list of opportunities, exactly as the website itself reads them
  fs.writeFileSync(path.join(ROOT, 'data', 'static-ids.js'), 'window.UP_STATIC=[];\n');
  const p0 = await ctx.newPage(); await p0.goto(base + '/scholarships.html');
  await p0.waitForFunction(() => window.UP && UP.D && UP.D.opps && UP.D.opps.length > 0, null, { timeout: 30000 }); await p0.waitForTimeout(2500);
  const all = await p0.evaluate(() => UP.D.opps.map(o => ({ id: o.id, name: o.name, sponsor: o.sponsor || '', type: o.type, region: o.region || 'Other', award: o.award || '', deadline: o.deadline || '', closed: !!o.closed })));
  const shell = await p0.evaluate(() => ({ hdr: document.querySelector('#hdr').innerHTML, ftr: document.querySelector('#ftr').innerHTML }));
  await p0.close();
  const ids = all.map(o => o.id).filter(id => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id));
  console.log('Opportunities found: ' + all.length + ' (ready-made pages: ' + ids.length + ')');
  // pass 2 needs the list, so every "more like this" link points to a ready-made page
  fs.writeFileSync(path.join(ROOT, 'data', 'static-ids.js'), '// List of opportunities that have their own ready-made page in /o/ (written by tools/prerender.js).\nwindow.UP_STATIC=' + JSON.stringify(ids) + ';\n');
  const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;   // ONLY=id1,id2 rebuilds just those pages
  if (!ONLY) fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

  let done = 0, bad = []; const todo = process.env.SKIPPAGES ? [] : (ONLY || ids);
  let ctxNow = ctx;
  async function one(id) {
    const pg = await ctxNow.newPage();
    try {
      await pg.goto(base + '/opportunity.html?id=' + encodeURIComponent(id));
      await pg.waitForFunction(i => window.UP && UP.D && UP.D.opps && UP.D.opps.length > 0 && document.querySelector('#root h1') && document.querySelector('#hdr a') && document.querySelector('#ftr a'), id, { timeout: 20000 });
      await pg.waitForTimeout(700);
      const d = await pg.evaluate(id => {
        const o = UP.D.opps.find(x => x.id === id), t = s => (s || '').replace(/\s+/g, ' ').trim(), g = s => document.querySelector(s);
        return {
          o: { id: o.id, name: o.name, sponsor: o.sponsor, type: o.type, award: o.award, link: o.link || '', verified: o.verified || '', desc: o.desc || '', region: o.region },
          title: document.title, desc: (g('meta[name=description]') || {}).content || '', hdr: g('#hdr').innerHTML, root: g('#root').innerHTML, ftr: g('#ftr').innerHTML,
          faq: Array.from(document.querySelectorAll('[data-faq] [data-q]')).map(q => [t(q.textContent), t(q.nextElementSibling.textContent)]),
          steps: Array.from(document.querySelectorAll('[data-howto] [data-s]')).map(s => [t(s.querySelector('[data-sn]').textContent).replace(/\.$/, ''), t(s.querySelector('[data-st]').textContent)])
        };
      }, id);
      if (!d.faq.length || d.steps.length < 4 || !d.root.includes('<h1')) throw new Error('page not fully drawn');
      const url = SITE + '/o/' + encodeURIComponent(id) + '.html', o = d.o, dm = /^\d{4}-\d{2}-\d{2}/.test(o.verified) ? o.verified.slice(0, 10) : '';
      const graph = [
        Object.assign({ '@type': 'WebPage', '@id': url + '#page', url, name: d.title, description: d.desc, inLanguage: 'en', isPartOf: { '@id': SITE + '/#site' }, publisher: { '@id': SITE + '/#org' } }, dm ? { dateModified: dm } : {}, o.type === 'Scholarship' ? { about: { '@type': 'Grant', name: o.name, description: o.award || undefined, funder: { '@type': 'Organization', name: o.sponsor } } } : {}),
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Scholarships and internships', item: SITE + '/scholarships.html' }, { '@type': 'ListItem', position: 3, name: o.name, item: url }] },
        { '@type': 'FAQPage', mainEntity: d.faq.map(x => ({ '@type': 'Question', name: x[0], acceptedAnswer: { '@type': 'Answer', text: x[1] } })) },
        { '@type': 'HowTo', name: 'How to apply for ' + o.name, step: d.steps.map((x, i) => Object.assign({ '@type': 'HowToStep', position: i + 1, name: x[0], text: x[1] }, i === d.steps.length - 1 && /^https?:\/\//.test(o.link) ? { url: o.link } : {})) }
      ];
      let h = template;
      h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8"><base href="/"><meta name="up-opp" content="' + esc(id) + '">');
      h = h.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(d.title) + '</title>');
      const setMeta = (re, val) => { if (re.test(h)) h = h.replace(re, m => m.replace(/content="[^"]*"/, 'content="' + esc(val) + '"')); };
      setMeta(/<meta name="description"[^>]*>/, d.desc); setMeta(/<meta property="og:title"[^>]*>/, d.title); setMeta(/<meta property="og:description"[^>]*>/, d.desc); setMeta(/<meta property="og:url"[^>]*>/, url); setMeta(/<meta name="twitter:title"[^>]*>/, d.title); setMeta(/<meta name="twitter:description"[^>]*>/, d.desc);
      h = h.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">');
      h = h.replace('</head>', '<script type="application/ld+json">' + ldJson({ '@context': 'https://schema.org', '@graph': graph }) + '</script></head>');
      h = h.replace('<a class="skip" href="#main">', '<a class="skip" href="/o/' + esc(id) + '.html#main">');
      h = h.replace('<div id="hdr"></div>', '<div id="hdr">' + d.hdr + '</div>').replace(/<div class="w sec" id="root"([^>]*)><\/div>/, '<div class="w sec" id="root"$1>' + d.root + '</div>').replace('<div id="ftr"></div>', '<div id="ftr">' + d.ftr + '</div>');
      fs.writeFileSync(path.join(OUT, id + '.html'), h);
    } catch (e) { bad.push(id + ': ' + e.message.split('\n')[0]); }
    await pg.close(); done++; if (done % 50 === 0) console.log(done + ' / ' + ids.length);
  }
  // the browser is restarted every 40 pages, because a long run can make it run out of memory
  let brNow = br; const BATCH = 40;
  for (let i = 0; i < todo.length; i += BATCH) {
    if (i > 0) { await brNow.close(); brNow = await chromium.launch(); ctxNow = await brNow.newContext({ viewport: { width: 1280, height: 900 } }); await ctxNow.route(/^https?:\/\/[^/]*(supabase\.co|youtube|ytimg|formsubmit|web3forms|cloudflare|google)/, r => r.abort()); }
    const q = todo.slice(i, i + BATCH); await Promise.all(Array.from({ length: 3 }, async () => { while (q.length) await one(q.shift()); }));
  }
  await brNow.close(); srv.close();
  if (bad.length) { console.log('PROBLEMS (' + bad.length + '):\n' + bad.join('\n')); const okIds = ids.filter(i => fs.existsSync(path.join(OUT, i + '.html'))); fs.writeFileSync(path.join(ROOT, 'data', 'static-ids.js'), '// List of opportunities that have their own ready-made page in /o/ (written by tools/prerender.js).\nwindow.UP_STATIC=' + JSON.stringify(okIds) + ';\n'); }
  // the plain list of everything (opportunities.html): the page that lets any crawler walk from one link to all opportunities
  try {
    const cut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '...' : t; }, tp = { Scholarship: 'Scholarships', Internship: 'Internships' }, have = new Set(fs.readdirSync(OUT).map(f => f.replace(/\.html$/, '')));
    const list = all.filter(o => have.has(o.id)).sort((a, b) => a.name.localeCompare(b.name)), regions = Array.from(new Set(list.map(o => o.region))).sort(), sec = [], jump = [], items = [];
    ['Scholarship', 'Internship'].forEach(t => regions.forEach(r => {
      const g = list.filter(o => o.type === t && o.region === r); if (!g.length) return; const hid = (t + '-' + r).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      jump.push('<a href="#' + hid + '">' + esc(tp[t]) + ' in ' + esc(r) + ' (' + g.length + ')</a>');
      sec.push('<h2 id="' + hid + '" style="margin-top:34px">' + esc(tp[t]) + ' in ' + esc(r) + ' (' + g.length + ')</h2><ul style="padding-left:20px">' + g.map(o => '<li style="margin:0 0 12px"><a href="o/' + encodeURIComponent(o.id) + '.html"><b>' + esc(o.name) + '</b></a>' + (o.closed ? ' (closed)' : '') + (o.sponsor ? ' - ' + esc(cut(o.sponsor, 90)) : '') + '.' + (o.award ? ' Covers: ' + esc(cut(o.award, 150)) + '.' : '') + (o.deadline ? ' Deadline: ' + esc(cut(o.deadline, 90)) + '.' : '') + '</li>').join('') + '</ul>');
    }));
    list.forEach((o, i) => items.push({ '@type': 'ListItem', position: i + 1, url: SITE + '/o/' + encodeURIComponent(o.id) + '.html', name: o.name }));
    const url = SITE + '/opportunities.html', ttl = 'All scholarships and internships (simple list) | UNIPILOT GLOBAL', dsc = 'A plain list of all ' + list.length + ' scholarships and internships on UNIPILOT GLOBAL, grouped by type and region, with what each covers and its deadline.';
    let h = template.replace('<meta charset="utf-8">', '<meta charset="utf-8">').replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(ttl) + '</title>');
    const setMeta = (re, val) => { if (re.test(h)) h = h.replace(re, m => m.replace(/content="[^"]*"/, 'content="' + esc(val) + '"')); };
    setMeta(/<meta name="description"[^>]*>/, dsc); setMeta(/<meta property="og:title"[^>]*>/, ttl); setMeta(/<meta property="og:description"[^>]*>/, dsc); setMeta(/<meta property="og:url"[^>]*>/, url);
    h = h.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">');
    h = h.replace('</head>', '<script type="application/ld+json">' + ldJson({ '@context': 'https://schema.org', '@graph': [{ '@type': 'CollectionPage', '@id': url + '#page', url, name: ttl, description: dsc, inLanguage: 'en', isPartOf: { '@id': SITE + '/#site' }, mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: items } }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'All opportunities', item: url }] }] }) + '</script></head>');
    h = h.replace('assets/pg-opportunity.js', 'assets/pg-all.js');
    const body = '<h1 style="font-size:clamp(1.9rem,3.6vw,2.7rem)">All scholarships and internships</h1><p class="mute">' + list.length + ' opportunities in a plain list. Click a name for eligibility, deadline, documents and how to apply. Want to filter by country, level or subject? <a href="scholarships.html">Use the finder</a>.</p><p style="line-height:2">' + jump.join(' &middot; ') + '</p>' + sec.join('');
    h = h.replace('<div id="hdr"></div>', '<div id="hdr">' + shell.hdr + '</div>').replace(/<div class="w sec" id="root"([^>]*)><\/div>/, '<div class="w sec" id="root"$1>' + body + '</div>').replace('<div id="ftr"></div>', '<div id="ftr">' + shell.ftr + '</div>');
    fs.writeFileSync(path.join(ROOT, 'opportunities.html'), h); console.log('opportunities.html: ' + list.length + ' links');
  } catch (e) { console.log('opportunities.html FAILED: ' + e.message); }
  const r = spawnSync('python3', [path.join(ROOT, 'tools', 'make_sitemap.py'), XLSX, path.join(ROOT, 'sitemap.xml')], { stdio: 'inherit' });
  console.log('Done. Pages written: ' + fs.readdirSync(OUT).length);
})();
