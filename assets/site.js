/* UNIPILOT GLOBAL engine: data loading (Google Sheet or bundled), header/footer, filters, cards. */
(function () {
  'use strict';
  const C = window.CONFIG, BASE = window.BASE || {}, KEY = 'up_payload_v2';
  const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => Array.from(e.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
  const L = s => String(s == null ? '' : s).split(/[,;]/).map(x => x.trim()).filter(Boolean);
  const uniq = a => Array.from(new Set(a));
  const LV = { Bachelor: "Bachelor's", Master: "Master's", PhD: 'PhD' };
  const MONN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], MON = MONN.map(m => m.slice(0, 3).toLowerCase());
  const REGIONS = [['Africa', '#C96F0B'], ['Asia', '#C2185B'], ['Europe', '#1F5FD1'], ['North America', '#0B857A'], ['Latin America & Caribbean', '#2E8B3E'], ['Oceania', '#6D3FD0']];
  const RCOL = Object.fromEntries(REGIONS), RDESC = { 'Latin America & Caribbean': 'South America, Central America and the Caribbean', 'Oceania': 'Australia and New Zealand' };
  const SUBJ = [['Engineering & Technology', 'engineer|technolog|materials'], ['Computer Science, Data & AI', 'computer|data science|\\bict\\b|artificial|\\bai\\b|computing'], ['Mathematics & Natural Sciences', 'math|physics|statistic|chemistry|natural sciences|basic (applied )?sciences|science and engineering|\\bstem\\b|\\bscience\\b'], ['Health & Life Sciences', 'health|medic|biomedical|biolog|life sciences|pharm'], ['Agriculture & Food Security', 'agricultur|agronom|food'], ['Environment, Water & Energy', 'water|energy|climate|environment|sustainab|mining'], ['Business, Economics & Management', 'business|economics|management|entrepreneur|finance'], ['Law, Governance & Public Policy', '\\blaw\\b|justice|governance|policy|public service|peace'], ['Social Sciences & Humanities', 'humanities|social science|history|liberal arts'], ['Education', 'education'], ['Architecture, Arts & Design', 'architect|\\barts\\b|design|creative']].map(a => [a[0], new RegExp(a[1], 'i')]);
  const SUBJECTS = SUBJ.map(s => s[0]);
  const COUNTRIES = 'Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cabo Verde|Cambodia|Cameroon|Canada|Central African Republic|Chad|Chile|China|Colombia|Comoros|Costa Rica|Croatia|Cuba|Cyprus|Czech Republic|Denmark|Djibouti|Dominica|Dominican Republic|DR Congo|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hong Kong|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Ivory Coast|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kosovo|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Macau|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Puerto Rico|Qatar|Republic of the Congo|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|Sao Tome and Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe'.split('|');
  const CMAP = {"afghanistan":"Asia","albania":"Europe","algeria":"Africa","andorra":"Europe","angola":"Africa","antigua and barbuda":"Latin America & Caribbean","argentina":"Latin America & Caribbean","armenia":"Asia","australia":"Oceania","austria":"Europe","azerbaijan":"Asia","bahamas":"Latin America & Caribbean","bahrain":"Asia","bangladesh":"Asia","barbados":"Latin America & Caribbean","belarus":"Europe","belgium":"Europe","belize":"Latin America & Caribbean","benin":"Africa","bhutan":"Asia","bolivia":"Latin America & Caribbean","bosnia and herzegovina":"Europe","botswana":"Africa","brazil":"Latin America & Caribbean","brunei":"Asia","bulgaria":"Europe","burkina faso":"Africa","burundi":"Africa","cabo verde":"Africa","cambodia":"Asia","cameroon":"Africa","canada":"North America","central african republic":"Africa","chad":"Africa","chile":"Latin America & Caribbean","china":"Asia","colombia":"Latin America & Caribbean","comoros":"Africa","costa rica":"Latin America & Caribbean","croatia":"Europe","cuba":"Latin America & Caribbean","cyprus":"Europe","czech republic":"Europe","denmark":"Europe","djibouti":"Africa","dominica":"Latin America & Caribbean","dominican republic":"Latin America & Caribbean","dr congo":"Africa","ecuador":"Latin America & Caribbean","egypt":"Africa","el salvador":"Latin America & Caribbean","equatorial guinea":"Africa","eritrea":"Africa","estonia":"Europe","eswatini":"Africa","ethiopia":"Africa","fiji":"Oceania","finland":"Europe","france":"Europe","gabon":"Africa","gambia":"Africa","georgia":"Asia","germany":"Europe","ghana":"Africa","greece":"Europe","grenada":"Latin America & Caribbean","guatemala":"Latin America & Caribbean","guinea":"Africa","guinea-bissau":"Africa","guyana":"Latin America & Caribbean","haiti":"Latin America & Caribbean","honduras":"Latin America & Caribbean","hong kong":"Asia","hungary":"Europe","iceland":"Europe","india":"Asia","indonesia":"Asia","iran":"Asia","iraq":"Asia","ireland":"Europe","israel":"Asia","italy":"Europe","ivory coast":"Africa","jamaica":"Latin America & Caribbean","japan":"Asia","jordan":"Asia","kazakhstan":"Asia","kenya":"Africa","kiribati":"Oceania","kosovo":"Europe","kuwait":"Asia","kyrgyzstan":"Asia","laos":"Asia","latvia":"Europe","lebanon":"Asia","lesotho":"Africa","liberia":"Africa","libya":"Africa","liechtenstein":"Europe","lithuania":"Europe","luxembourg":"Europe","macau":"Asia","madagascar":"Africa","malawi":"Africa","malaysia":"Asia","maldives":"Asia","mali":"Africa","malta":"Europe","marshall islands":"Oceania","mauritania":"Africa","mauritius":"Africa","mexico":"Latin America & Caribbean","micronesia":"Oceania","moldova":"Europe","monaco":"Europe","mongolia":"Asia","montenegro":"Europe","morocco":"Africa","mozambique":"Africa","myanmar":"Asia","namibia":"Africa","nauru":"Oceania","nepal":"Asia","netherlands":"Europe","new zealand":"Oceania","nicaragua":"Latin America & Caribbean","niger":"Africa","nigeria":"Africa","north korea":"Asia","north macedonia":"Europe","norway":"Europe","oman":"Asia","pakistan":"Asia","palau":"Oceania","palestine":"Asia","panama":"Latin America & Caribbean","papua new guinea":"Oceania","paraguay":"Latin America & Caribbean","peru":"Latin America & Caribbean","philippines":"Asia","poland":"Europe","portugal":"Europe","puerto rico":"Latin America & Caribbean","qatar":"Asia","republic of the congo":"Africa","romania":"Europe","russia":"Europe","rwanda":"Africa","saint kitts and nevis":"Latin America & Caribbean","saint lucia":"Latin America & Caribbean","saint vincent and the grenadines":"Latin America & Caribbean","samoa":"Oceania","san marino":"Europe","sao tome and principe":"Africa","saudi arabia":"Asia","senegal":"Africa","serbia":"Europe","seychelles":"Africa","sierra leone":"Africa","singapore":"Asia","slovakia":"Europe","slovenia":"Europe","solomon islands":"Oceania","somalia":"Africa","south africa":"Africa","south korea":"Asia","south sudan":"Africa","spain":"Europe","sri lanka":"Asia","sudan":"Africa","suriname":"Latin America & Caribbean","sweden":"Europe","switzerland":"Europe","syria":"Asia","taiwan":"Asia","tajikistan":"Asia","tanzania":"Africa","thailand":"Asia","togo":"Africa","tonga":"Oceania","trinidad and tobago":"Latin America & Caribbean","tunisia":"Africa","turkey":"Europe","turkmenistan":"Asia","tuvalu":"Oceania","uganda":"Africa","ukraine":"Europe","united arab emirates":"Asia","united kingdom":"Europe","united states":"North America","uruguay":"Latin America & Caribbean","uzbekistan":"Asia","vanuatu":"Oceania","venezuela":"Latin America & Caribbean","vietnam":"Asia","yemen":"Asia","zambia":"Africa","zimbabwe":"Africa","usa":"North America","uk":"Europe","türkiye":"Europe","czechia":"Europe","uae":"Asia"};

  const ALIAS = { usa: 'United States', us: 'United States', 'u.s.': 'United States', america: 'United States', uk: 'United Kingdom', britain: 'United Kingdom', england: 'United Kingdom', korea: 'South Korea', 'türkiye': 'Turkey', czechia: 'Czech Republic', uae: 'United Arab Emirates', "côte d'ivoire": 'Ivory Coast', 'republic of korea': 'South Korea' };
  const HINT = [['\\buct\\b|mandela rhodes|cape town', 'South Africa'], ['ashesi|knust', 'Ghana'], ['makerere', 'Uganda'], ['e-just|\\bauc\\b', 'Egypt'], ['mext', 'Japan'], ['\\bgks\\b', 'South Korea'], ['singa|\\bnus\\b', 'Singapore'], ['daad', 'Germany'], ['eiffel', 'France'], ['eth zurich', 'Switzerland'], ['fulbright', 'United States'], ['vanier|pearson', 'Canada'], ['gcub', 'Brazil'], ['\\brtp\\b|monash|unsw', 'Australia'], ['manaaki|otago|auckland', 'New Zealand']].map(a => [new RegExp(a[0], 'i'), a[1]]);
  const cn = x => { const k = String(x).trim().toLowerCase(); return ALIAS[k] || COUNTRIES.find(c => c.toLowerCase() === k) || String(x).trim(); };
  const ALL_RX = /all (academic )?(majors|fields|disciplines)|any (field|discipline|major)/i;
  const derSub = t => { const r = SUBJ.filter(s => s[1].test(t)).map(s => s[0]); if (!r.length || ALL_RX.test(t)) r.push('All fields'); return r; };
  const derCty = t => uniq(COUNTRIES.filter(c => new RegExp('\\b' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(t)).concat(Object.keys(ALIAS).filter(k => new RegExp('\\b' + k.replace(/\./g, '\\.') + '\\b', 'i').test(t)).map(k => ALIAS[k]), HINT.filter(h => h[0].test(t)).map(h => h[1])));
  const derTags = (t, lv) => { const r = []; if (/women|female/i.test(t)) r.push('Women'); if (/financial need|low-income|need-based|socio/i.test(t)) r.push('Need-based'); if (/professional experience|work experience|mid-career|years? (of )?(full-time )?professional/i.test(t)) r.push('Work experience'); if (/research/i.test(t) && !(lv.length === 1 && lv[0] === 'Bachelor')) r.push('Research'); if (/refugee|displaced/i.test(t)) r.push('Refugee / displaced'); return r; };
  const ytId = u => { const m = String(u || '').match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : (/^[\w-]{11}$/.test(String(u || '').trim()) ? String(u).trim() : ''); };
  const MR = '(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May(?!\\s+(?:vary|be|apply))|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
  const mi = s => MON.indexOf(s.slice(0, 3).toLowerCase());
  function months(t) {
    t = String(t).replace(/\([^)]*\)/g, ' '); const out = new Set(); let m;
    const rg = new RegExp('\\b' + MR + '\\b\\s*\\d{0,2}\\s*[–\\-]\\s*\\d{0,2}\\s*\\b' + MR + '\\b', 'g');
    while ((m = rg.exec(t))) { const a = mi(m[1]), n = (mi(m[2]) - a + 12) % 12; if (n <= 3) for (let k = 0; k <= n; k++) out.add((a + k) % 12); }
    const one = new RegExp('\\b' + MR + '\\b', 'g'); while ((m = one.exec(t))) out.add(mi(m[1]));
    return Array.from(out).sort((a, b) => a - b);
  }
  const soon = o => o.months.length ? Math.min.apply(null, o.months.map(m => (m - new Date().getMonth() + 12) % 12)) : 99;

  function norm(r) {
    const g = k => r[k] == null ? '' : String(r[k]).trim(), name = g('Name');
    if (!name || /^hidden$/i.test(g('Status'))) return null;
    const lv = uniq(L(g('Levels')).map(x => /bach|under|^ug/i.test(x) ? 'Bachelor' : /mast|post|^ms/i.test(x) ? 'Master' : /phd|doct/i.test(x) ? 'PhD' : x));
    let rg = g('Region'); rg = /austral|zealand|ocean|pacific/i.test(rg) ? 'Oceania' : /latin|south america|caribb/i.test(rg) ? 'Latin America & Caribbean' : rg;
    const txt = [name, g('Sponsor'), g('Eligibility'), g('Award'), g('Description')].join(' '), fund = g('Funding').toLowerCase(), em = g('Effort').match(/^(very\s+)?(low|medium|high)/i);
    const o = { id: g('ID') || slug(name), type: /intern/i.test(g('Type')) ? 'Internship' : 'Scholarship', name, sponsor: g('Sponsor'), region: rg, levels: lv.length ? lv : ['Master'],
      subjects: L(g('Subjects')).length ? L(g('Subjects')) : derSub(txt), countries: L(g('Host countries')).length ? L(g('Host countries')).map(cn) : derCty(txt), tags: L(g('Tags')).length ? L(g('Tags')) : derTags(txt, lv),
      funding: /^full/.test(fund) ? 'full' : /^stip/.test(fund) ? 'stipend' : 'partial', award: g('Award'), deadline: g('Deadline'), months: months(g('Deadline')), elig: g('Eligibility'),
      effort: g('Effort'), effortLevel: em ? em[2][0].toUpperCase() + em[2].slice(1).toLowerCase() : '', best: g('Best for'), desc: g('Description'), docs: g('Documents') ? g('Documents').split('|').map(s => s.trim()).filter(Boolean) : [],
      tips: g('Expert tips') ? g('Expert tips').split('|').map(s => s.trim()).filter(Boolean) : [], scoring: g('Selection'), past: g('Winners'), link: g('Official link'), video: ytId(g('YouTube')), price: g('Price'), pay: g('Pay link'), featured: /^y/i.test(g('Featured')), closed: /^closed/i.test(g('Status')), added: g('Added on'), verified: g('Verified on'), opens: nd(g('Opens on')), dl: nd(g('Deadline date')) };
    // The continent always comes from the host countries, so the Continent and Country filters can never disagree.
    const hr = uniq(o.countries.map(c => CMAP[String(c).toLowerCase()]).filter(Boolean)), xr = String(g('Region')).trim().replace(/^Middle East$/, 'Asia'), rx = REGIONS.some(r => r[0] === xr) ? xr : 'Asia';
    o.regions = hr.length ? hr : [rx]; o.region = o.regions[0]; if (hr.length && !hr.includes(rx) && REGIONS.some(r => r[0] === xr)) o.tags = uniq(o.tags.concat('From ' + rx));
    o.closes = closesTop(o);
    return o;
  }
  const isoOk = d => /^\d{4}-\d{2}-\d{2}/.test(d || '');
  const nd = v => { v = String(v || '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10); const m = v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/); if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); const t = Date.parse(v); return isNaN(t) ? v : new Date(t - new Date(t).getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const MONX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const closesTop = o => { if (isoOk(o.dl)) return o.dl.slice(0, 10); const t = String(o.deadline || '').split('(')[0], y = t.match(/\b(20\d\d)\b/); if (!y) return ''; const rx = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b|\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/gi; let m, last = null; while ((m = rx.exec(t))) last = [MONX[(m[1] || m[4]).toLowerCase()], +(m[2] || m[3])]; if (!last) return ''; const d = new Date(Date.UTC(+y[1], last[0], last[1])); return d.getUTCMonth() === last[0] ? d.toISOString().slice(0, 10) : ''; };
  const fmtDate = d => isoOk(d) ? new Date(d.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : (d || '');
  const img = u => { u = String(u || '').trim(); if (!u) return ''; const m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || u.match(/drive\.google\.com\/open\?id=([\w-]+)/); if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1280'; return /^(https?:|data:|\/)/i.test(u) || u.includes('/') ? u : 'images/' + u; };
  const A = x => Array.isArray(x) ? x : (x ? [x] : []);
  let dbPilots = [], dbSig = '';   // approved pilots from the database (see loadDbPilots)
  function build(p) {
    p = p || {}; const raw = (p.opportunities && p.opportunities.length ? p.opportunities : BASE.opportunities) || [], by = new Map(), dupes = [];
    raw.forEach(r => { const nm = String(r.Name || '').trim(); if (!nm) return; const k = nm.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!by.has(k)) { by.set(k, Object.assign({}, r)); return; } dupes.push(nm); const m = by.get(k);
      Object.keys(r).forEach(c => { const v = String(r[c] == null ? '' : r[c]).trim(); if (!v) return; if (c === 'Levels') m.Levels = uniq(L(m.Levels).concat(L(v))).join(', '); else if (c !== 'ID') m[c] = r[c]; }); });
    const ids = {}, opps = Array.from(by.values()).map(norm).filter(Boolean).map(o => { ids[o.id] = (ids[o.id] || 0) + 1; if (ids[o.id] > 1) o.id += '-' + ids[o.id]; return o; });
    const today = new Date().toISOString().slice(0, 10);
    const nd = v => { v = String(v || '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10); const m = v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/); if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); const t = Date.parse(v); return isNaN(t) ? v : new Date(t - new Date(t).getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
    // News that writes itself: every new listing (added in the last 45 days) and every deadline within 30 days.
    const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    // The closing date: the 'Deadline date' column if filled, otherwise the last full date (with a year) in the Deadline text.
    const closesOn = o => { if (isoOk(o.dl)) return o.dl.slice(0, 10); const t = String(o.deadline || '').split('(')[0], y = t.match(/\b(20\d\d)\b/); if (!y) return ''; const rx = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b|\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/gi; let m, last = null; while ((m = rx.exec(t))) last = [MON[(m[1] || m[4]).toLowerCase()], +(m[2] || m[3])]; if (!last) return ''; const d = new Date(Date.UTC(+y[1], last[0], last[1])); return d.getUTCMonth() === last[0] ? d.toISOString().slice(0, 10) : ''; };
    // News that writes itself from the Excel file: closing soon, closed, opening soon, free seminars and new listings.
    const autoNews = (list, sems) => { const t0 = new Date(today + 'T00:00:00Z'), dd = iso => Math.round((new Date(iso.slice(0, 10) + 'T00:00:00Z') - t0) / 864e5), lk = o => 'opportunity.html?id=' + encodeURIComponent(o.id), pt = iso => fmtDate(iso), closing = [], opening = [], closed = [], fresh = {}, fin = [];
      list.forEach(o => { const cl = closesOn(o), n = cl ? dd(cl) : null;
        if (cl && n >= 0 && n <= 30 && !o.closed) closing.push({ n, o: { date: today, cat: 'Closing soon', title: 'Closing soon: ' + o.name, text: (n === 0 ? 'Closes today' : n === 1 ? 'Closes tomorrow' : 'Closes in ' + n + ' days') + ' (' + pt(cl) + '). Check the official page and apply in time.', link: lk(o), pin: false, auto: true } });
        if (cl && n < 0 && n >= -30) closed.push({ n: -n, o: { date: cl, cat: 'Closed', title: 'Closed: ' + o.name, text: 'The deadline was ' + pt(cl) + '. Start preparing early for the next round.', link: lk(o), pin: false, auto: true } });
        if (isoOk(o.opens) && !o.closed) { const k = dd(o.opens); if (k > 0 && k <= 60) opening.push({ n: k, o: { date: today, cat: 'Upcoming', title: 'Opening soon: ' + o.name, text: 'Applications open on ' + pt(o.opens) + '. Get your documents ready now.', link: lk(o), pin: false, auto: true } }); else if (k <= 0 && k >= -7 && (n === null || n >= 0)) opening.push({ n: 0, o: { date: o.opens.slice(0, 10), cat: 'Open now', title: 'Now open: ' + o.name, text: 'Applications opened on ' + pt(o.opens) + '.', link: lk(o), pin: false, auto: true } }); }
        if (!o.closed) { const a = nd(o.added); if (/^\d{4}-\d{2}-\d{2}$/.test(a)) { const ag = -dd(a); if (ag >= 0 && ag <= 45) (fresh[a] = fresh[a] || []).push(o); } } });
      (sems || []).forEach(s => { if (s.up && /^\d{4}-\d{2}-\d{2}$/.test(s.date)) { const k = dd(s.date); if (k >= 0 && k <= 30) opening.push({ n: k, o: { date: today, cat: 'Upcoming', title: 'Free seminar: ' + s.title, text: pt(s.date) + (s.time ? ' at ' + s.time : '') + '. Free to join. Reserve your seat.', link: 'seminars.html', pin: false, auto: true } }); } });
      Object.keys(fresh).sort().reverse().forEach(d => { const g = fresh[d]; if (g.length > 3) fin.push({ date: d, cat: 'New', title: g.length + ' new opportunities added', text: g.slice(0, 3).map(o => o.name).join(', ') + ' and more. Browse them all in the finder.', link: 'scholarships.html', pin: false, auto: true }); else g.forEach(o => fin.push({ date: d, cat: 'New', title: 'New ' + (o.type === 'Internship' ? 'internship' : 'scholarship') + ': ' + o.name, text: [o.award && String(o.award).replace(/\s*\([^)]*\)/g, ''), o.deadline && 'Deadline: ' + String(o.deadline).replace(/\s*\([^)]*\)/g, '')].filter(Boolean).join('. '), link: lk(o), pin: false, auto: true })); });
      const by = (a, b) => a.n - b.n; return closing.sort(by).slice(0, 6).map(x => x.o).concat(opening.sort(by).slice(0, 4).map(x => x.o), fin.slice(0, 4), closed.sort(by).slice(0, 4).map(x => x.o)); };
    const sem = (p.seminars || BASE.seminars || []).filter(s => (s.Title || s.Topic || s.Date) && !/^(draft|hidden)$/i.test(String(s.Status || '').trim())).map(s => ({ title: s.Title || s.Topic || 'Free seminar', date: nd(s.Date), time: s.Time || '', topic: s.Topic || '', speaker: s.Speaker || '', attendees: s.Attendees || '', register: s['Register link'] || '', rec: ytId(s['Recording (YouTube link)']), cover: img(s['Cover photo']), up: /upcoming/i.test(s.Status) || (!/past/i.test(s.Status) && nd(s.Date) >= today) }));
    const manualNews = (p.news || BASE.news || []).filter(n => n.Title).map(n => ({ date: nd(n.Date), cat: n.Category || 'Update', title: n.Title, text: n.Summary || '', link: n.Link || '', pin: /^y/i.test(n.Pinned), photo: img(n.Photo), feat: /^y/i.test(n.Featured) }));
    const news = manualNews.concat(autoNews(opps, sem));
    const vids = (p.videos || BASE.videos || []).map(v => ({ id: ytId(v.YouTube), title: v.Title || '', text: v.Description || '', cat: v.Category || '' })).filter(v => v.id);
    const reviews = (p.reviews || BASE.reviews || []).filter(r => r.Review && /^y/i.test(String(r.Approved || ''))).map(r => ({ name: r.Name || 'Student', country: r.Country || '', result: r.Result || '', text: r.Review, rating: Math.max(0, Math.min(5, +r.Rating || 0)), photo: img(r.Photo) }));
    const LL = x => String(x || '').split(/[|\n]/).map(s => s.trim()).filter(Boolean);
    const experts = (p.experts || BASE.experts || []).filter(e => e.Name && !/^(draft|hidden)$/i.test(String(e.Status || '').trim())).map(e => { const ph = String(e.Photo || '').trim(); return { id: slug(String(e.Name).trim()), field: String(e.Field || '').trim(), name: String(e.Name).trim(), role: String(e.Role || '').trim(), tagline: String(e.Tagline || '').trim(), about: String(e.About || '').trim(), photo: img(ph), alt: /^[^\/:]+$/.test(ph) ? ph : '', tags: String(e.Scholarships || '').split(/[|\n,;]/).map(s => s.trim()).filter(Boolean), edu: LL(e.Education), exp: LL(e.Highlights), langs: String(e.Languages || '').split(/[|\n,;]/).map(s => s.trim()).filter(Boolean), loc: String(e['Based in'] || '').trim(), studied: String(e['Studied in'] || '').split(/[|\n,;]/).map(s => s.trim()).filter(Boolean), unis: LL(e.Universities), helps: LL(e['Helps with']), li: /^https?:\/\//i.test(String(e.LinkedIn || '').trim()) ? String(e.LinkedIn).trim() : '', feat: /^y/i.test(String(e.Featured || '')) }; });
    const visa = (p.visa || BASE.visa || []).filter(v => v.Country).map(v => ({ country: cn(v.Country), type: v['Visa type'] || '', time: v['Processing time'] || '', docs: v['Key documents'] ? String(v['Key documents']).split('|').map(s => s.trim()).filter(Boolean) : [], link: v['Official link'] || '', notes: v.Notes || '', checked: String(v['Last checked'] || '') }));
    const fmtOf = m => { const f = String(m.Format || '').trim(); if (f) return f; const l = String(m.Link || '').toLowerCase().split('?')[0]; return /\.pdf$/.test(l) ? 'PDF' : /\.(xlsx?|csv)$/.test(l) ? 'Excel' : /\.pptx?$/.test(l) ? 'PowerPoint' : /\.docx?$/.test(l) ? 'Word' : /\.(png|jpe?g|webp|gif)$/.test(l) ? 'Image' : /youtu/.test(l) ? 'Video' : /docs\.google\.com\/spreadsheets/.test(l) ? 'Sheet' : /docs\.google\.com\/presentation/.test(l) ? 'Slides' : /docs\.google\.com\/document/.test(l) ? 'Doc' : ''; };
    const mats = (p.materials || []).filter(m => m.Title && /^https?:\/\//i.test(String(m.Link || '').trim()) && !/^(draft|hidden)$/i.test(String(m.Status || '').trim())).map(m => ({ title: String(m.Title).trim(), type: String(m.Type || 'Guide').trim(), text: m.Description || '', link: String(m.Link).trim(), access: /^(sign|email|login|member|account|lock)/i.test(String(m.Access || '').trim()) ? 'email' : 'free', fmt: fmtOf(m), cat: m.Category || '', added: String(m['Added on'] || ''), feat: /^y/i.test(m.Featured), rel: String(m['Related scholarships'] || '').split(/[|;\n]/).map(x => x.trim().toLowerCase()).filter(Boolean) })).sort((a, b) => b.feat - a.feat || b.added.localeCompare(a.added));
    const TOP = [['IELTS','🎧','Reach the band score you need with practice for listening, reading, writing and speaking, plus test-day tips.'],['TOEFL','🗣️','Prepare for the TOEFL iBT: question types, timing, and how to improve each section.'],['SAT','📐','Plan your SAT preparation: what is tested, how it is scored, and how to practise.'],['GRE & GMAT','🧮','Understand the GRE and GMAT formats and build a study plan for your target score.'],['SOP','✍️','Write a Statement of Purpose that tells your story clearly: structure, examples and common mistakes.'],['CV & Resume','📄','Build an academic or professional CV that fits scholarship and university applications.'],['Recommendation Letters','💌','Choose referees, brief them well, and avoid the mistakes that weaken a letter.'],['Visa & Interview','🛂','Prepare for scholarship and visa interviews with typical questions and confident answers.']], tn = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    const yid = u => { const m = String(u || '').match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ''; };
    const topics = (() => { const mp = new Map(TOP.map(t => [tn(t[0]), { name: t[0], icon: t[1], text: t[2], video: '', q: '' }])); (p.topics || []).forEach(t => { const nm = String(t.Topic || '').trim(); if (!nm) return; const k = tn(nm); if (/^(hidden|draft)$/i.test(String(t.Status || '').trim())) { mp.delete(k); return; } const o = mp.get(k) || { name: nm, icon: '📘', text: '', video: '', q: '' }; mp.set(k, { name: nm, icon: String(t.Icon || '').trim() || o.icon, text: String(t.Description || '').trim() || o.text, video: String(t.YouTube || '').trim(), q: String(t['Search terms'] || '').trim() }); }); return Array.from(mp.values()).map(t => Object.assign(t, { id: slug(t.name), vid: yid(t.video) })); })();
    // pilots who joined through the dashboard and were approved by the team appear next to the ones in the Excel file
    const taken = new Set(experts.map(e => e.id));
    dbPilots.forEach(e => { if (!taken.has(e.id)) { taken.add(e.id); experts.push(e); } });
    return { opps, materials: mats, topics, seminars: sem, news, videos: vids, reviews, experts, visa, settings: p.settings || {}, guides: BASE.regionGuides || {}, dupes };
  }
  const UP = { C, $, $$, esc, LV, REGIONS, RCOL, RDESC, SUBJECTS, COUNTRIES, fmtDate, ytId, soon, img, A, count: 0, D: build(null) };

  function applySettings(s) {
    const m = { students_base: 'studentsBase', seminars_held: 'seminarsHeld', years_experience: 'yearsExperience', whatsapp: 'whatsapp', youtube_channel: 'youtubeChannel', default_video: 'defaultVideo', facebook: 'facebook', linkedin: 'linkedin' };
    Object.keys(m).forEach(k => { if (s[k] !== undefined && String(s[k]).trim() !== '') C[m[k]] = k === 'whatsapp' ? String(s[k]).replace(/\D/g, '') : (/_base|_held|years/.test(k) ? +s[k] : String(s[k]).trim()); });
  }
  UP.wa = m => C.whatsapp ? 'https://wa.me/' + String(C.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(m || C.whatsappMessage) : '';
  // ---------- accounts: small shared helpers (the pop-up and Save buttons live in assets/account.js) ----------
  const accRef = (() => { try { return new URL(C.supabaseUrl).hostname.split('.')[0]; } catch (e) { return ''; } })();
  UP.accShown = () => !!(C.supabaseUrl && C.supabaseKey && C.accountsLaunch !== false);
  UP.accLinks = () => !!(C.supabaseUrl && C.supabaseKey) && (C.accountsLaunch !== false || document.body.dataset.page === 'account');   // links also show on the account page itself, even in private mode
  UP.sessUser = () => { try { const j = JSON.parse(localStorage.getItem('sb-' + accRef + '-auth-token') || 'null'); return (j && j.user) || null; } catch (e) { return null; } };
  UP.loadAcc = () => UP.acc ? Promise.resolve(UP.acc) : (UP.accP = UP.accP || new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'assets/account.js'; sc.onload = () => res(UP.acc); sc.onerror = () => { UP.accP = null; rej(new Error('Sign-in code could not load')); }; document.head.appendChild(sc); }));
  const UICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>';
  // the booking calendar is a separate file, loaded only when someone opens a booking
  // ---- prices in taka: a small "≈ ৳6,575" next to every price in another currency. Rates are public market rates saved by the server once an hour (the source updates daily).
  UP.fx = (function () {
    const KEY = 'up_fx_1', FRESH = 3600000, MAX_AGE = 72 * 3600000; let rates = null, pending = null;
    const keep = j => { try { localStorage.setItem(KEY, JSON.stringify(j)); } catch (e) { } };
    const cached = () => { try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); return j && j.r && typeof j.t === 'number' ? j : null; } catch (e) { return null; } };
    const usable = j => !!(j && j.r && Date.now() - j.t < FRESH * 6);
    const parse = rows => { const r = {}; let oldest = Date.now(); (rows || []).forEach(x => { const v = Number(x.bdt_per_unit), t = Date.parse(x.fetched_at); if (/^[A-Z]{3}$/.test(x.base) && v > 0 && t && Date.now() - t < MAX_AGE) { r[x.base] = v; oldest = Math.min(oldest, t); } }); return Object.keys(r).length ? { r, t: Date.now(), src: oldest } : null; };
    function ready() {
      if (rates) return Promise.resolve(rates);
      const c = cached(); if (c && Date.now() - c.t < FRESH) { rates = c; return Promise.resolve(rates); }
      if (!C.supabaseUrl || !C.supabaseKey) return Promise.resolve(null);
      return pending = pending || fetch(String(C.supabaseUrl).replace(/\/$/, '') + '/rest/v1/fx_rates?select=base,bdt_per_unit,fetched_at', { headers: { apikey: C.supabaseKey, Authorization: 'Bearer ' + C.supabaseKey } })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('rates')), e => Promise.reject(e)).then(rows => { const p = parse(rows); if (p) { rates = p; keep(p); } else rates = null; return rates; })
        .catch(() => { rates = usable(c) ? c : null; return rates; }).then(x => { pending = null; return x; });
    }
    const rate = cur => { const c = String(cur || '').toUpperCase(); if (c === 'BDT') return null; const R = rates || cached(); return R && R.r && R.r[c] > 0 && Date.now() - R.t < FRESH * 6 ? R.r[c] : null; };
    const bdt = (cents, cur) => { const r = rate(cur); return r && cents > 0 ? Math.ceil(cents / 100 * r) : null; };
    const fmt = n => '৳' + new Intl.NumberFormat('en-IN').format(n);
    const text = (cents, cur) => { const n = bdt(cents, cur); return n ? '≈ ' + fmt(n) : ''; };
    const html = (cents, cur) => { const n = bdt(cents, cur); return n ? '<span class="fx" title="About ' + esc(fmt(n)) + ' at today\'s rate (1 ' + esc(String(cur).toUpperCase()) + ' = ৳' + esc(rate(cur).toFixed(2)) + '). The exact amount is shown when you pay.">≈ ' + esc(fmt(n)) + '</span>' : ''; };
    return { ready, rate, bdt, text, html, fmt };
  })();
  UP.loadBook = () => UP.book && UP.book.open ? Promise.resolve(UP.book) : (UP.bookP = UP.bookP || UP.loadAcc().then(() => new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'assets/booking.js'; sc.onload = () => res(UP.book); sc.onerror = () => { UP.bookP = null; rej(new Error('Booking code could not load')); }; document.head.appendChild(sc); })));
  UP.bookOpen = o => UP.loadBook().then(b => b.open(o));
  UP.signHTML = () => { const u = UP.sessUser(); if (!UP.accLinks()) return ''; const nm = u && ((u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || u.email) || '', ini = String(nm).trim().slice(0, 1).toUpperCase() || '&#9679;';
    return u ? `<a id="hsign" class="hsign in" href="account.html" aria-label="My account"><span class="hav">${esc(ini)}</span><span class="hst">My account</span></a>` : `<a id="hsign" class="hsign" href="account.html" aria-label="Sign in">${UICON}<span class="hst">Sign in</span></a>`; };
  // redraws the Sign in / My account links (header, menu, footer) after someone signs in or out
  UP.refreshSign = () => { if (!UP.accLinks()) return; const u = UP.sessUser(), h = document.getElementById('hsign'); if (h) { const t = document.createElement('div'); t.innerHTML = UP.signHTML(); const n = t.firstChild; if (n) { if (document.body.dataset.page === 'account') n.classList.add('on'); h.replaceWith(n); } }
    const nv = document.getElementById('navacc'); if (nv) nv.textContent = u ? 'My account' : 'Sign in'; const ft = document.querySelector('#ftracc a'); if (ft) ft.textContent = u ? 'My account' : 'Sign in or create an account'; };
  UP.students = () => ({ n: (+C.studentsBase || 0) + UP.count, plus: !(UP.count > 0) });
  UP.seminarsHeld = () => +C.seminarsHeld || UP.D.seminars.filter(s => !s.up).length;
  UP.fmtN = n => n.toLocaleString('en-US');

  // ---- minimal .xlsx reader (no libraries): lets you keep your content in an Excel file on GitHub
  const unx = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n)).replace(/&amp;/g, '&');
  async function inflate(u8) { const s = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw')); return new Uint8Array(await new Response(s).arrayBuffer()); }
  async function unzip(buf) {
    const u = new Uint8Array(buf), dv = new DataView(buf), dec = new TextDecoder(), out = {}; let e = u.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
    const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
    for (let i = 0; i < n; i++) { const meth = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true), name = dec.decode(u.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
      const ds = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), data = u.subarray(ds, ds + cs); out[name] = meth === 0 ? data : await inflate(data); }
    return out;
  }
  const txt = u8 => new TextDecoder().decode(u8), attr = (s, k) => { const m = new RegExp('\\b' + k + '="([^"]*)"').exec(s); return m ? unx(m[1]) : ''; };
  const colIdx = ref => { let n = 0; ref.replace(/\d/g, '').split('').forEach(ch => n = n * 26 + ch.charCodeAt(0) - 64); return n - 1; };
  const tt = body => unx(Array.from(body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)).map(x => x[1]).join(''));
  function sheetRows(xml, ss) {
    const rows = [];
    for (const rm of xml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) { const row = [];
      for (const cm of (rm[1] || '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) { const t0 = attr(cm[1], 't'), body = cm[2] || '', ref = attr(cm[1], 'r'); let v = '';
        if (t0 === 's') { const m = /<v>([\s\S]*?)<\/v>/.exec(body); v = m ? (ss[+m[1]] || '') : ''; } else if (t0 === 'inlineStr') v = tt(body); else { const m = /<v>([\s\S]*?)<\/v>/.exec(body); v = m ? unx(m[1]) : ''; }
        if (ref) row[colIdx(ref)] = v; }
      rows.push(row); }
    return rows;
  }
  async function readXlsx(buf) {
    const f = await unzip(buf), wb = txt(f['xl/workbook.xml']), rel = txt(f['xl/_rels/workbook.xml.rels']), ss = f['xl/sharedStrings.xml'] ? Array.from(txt(f['xl/sharedStrings.xml']).matchAll(/<si>([\s\S]*?)<\/si>|<si\/>/g)).map(m => tt(m[1] || '')) : [], out = {};
    const targets = {}; Array.from(rel.matchAll(/<Relationship\b[^>]*\/?>/g)).forEach(m => { let tg = attr(m[0], 'Target'); tg = tg.replace(/^\/?(xl\/)?/, ''); targets[attr(m[0], 'Id')] = 'xl/' + tg; });
    for (const m of wb.matchAll(/<sheet\b[^>]*\/?>/g)) { const name = attr(m[0], 'name'), file = f[targets[attr(m[0], 'r:id')]]; if (!file) continue;
      const rows = sheetRows(txt(file), ss), head = (rows.shift() || []).map(h => String(h || '').trim());
      out[name.toLowerCase()] = rows.filter(r => r.some(c => c !== undefined && c !== '')).map(r => { const o = {}; head.forEach((h, i) => { if (!h) return; let v = r[i] === undefined ? '' : r[i]; if (/date|added on|verified on/i.test(h) && /^\d{5}(\.\d+)?$/.test(v) && +v > 30000 && +v < 80000) v = new Date(Math.round((+v - 25569) * 86400000)).toISOString().slice(0, 10); o[h] = v; }); return o; }); }
    const settings = {}; (out.settings || []).forEach(r => { if (r.Key) settings[String(r.Key).trim()] = r.Value; });
    return { opportunities: out.opportunities || [], seminars: out.seminars || [], news: out.news || [], videos: out.videos || [], reviews: out.reviews || [], experts: out.experts || [], visa: out.visa || [], materials: out.materials || [], topics: out.topics || [], settings };
  }
  UP.readXlsx = readXlsx;
  // Live content from a Google Sheet (set sheetId in config.js). Edits show on the site a few seconds after you change a cell.
  function csv(t) { const rows = []; let r = [], f = '', q = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === ',') { r.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; r.push(f); rows.push(r); r = []; f = ''; } else f += c; } if (f !== '' || r.length) { r.push(f); rows.push(r); } return rows; }
  async function readSheets(id) {
    const need = { opportunities: 'Name', seminars: 'Title', news: 'Summary', videos: 'YouTube', reviews: 'Review', experts: 'Field', visa: 'Visa type', materials: 'Related scholarships', settings: 'Key' }, out = {};
    await Promise.all(Object.keys(need).map(async k => { try { const r = await tfetch('https://docs.google.com/spreadsheets/d/' + encodeURIComponent(id) + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(k.charAt(0).toUpperCase() + k.slice(1))); if (!r.ok) return; const rows = csv(await r.text()), head = (rows.shift() || []).map(h => h.trim()); if (!head.includes(need[k])) return; out[k] = rows.filter(x => x.some(c => c !== '')).map(x => { const o = {}; head.forEach((h, i) => { if (h) o[h] = x[i] === undefined ? '' : x[i]; }); return o; }); } catch (e) { } }));
    const settings = {}; (out.settings || []).forEach(r => { if (r.Key) settings[String(r.Key).trim()] = r.Value; });
    return { opportunities: out.opportunities || [], seminars: out.seminars || [], news: out.news || [], videos: out.videos || [], reviews: out.reviews || [], experts: out.experts || [], visa: out.visa || [], materials: out.materials || [], settings };
  }
  UP.readSheets = readSheets;
  // Free materials that belong to one scholarship (by its name or id), plus those marked "All".
  const nz = x => String(x).toLowerCase().replace(/[^a-z0-9]/g, '');
  UP.matFor = o => { const id = nz(o.id), nm = nz(o.name), sc = m => m.rel.some(r => nz(r) === id || nz(r) === nm || (nz(r).length > 2 && nm.includes(nz(r)))) ? 2 : m.rel.includes('all') ? 1 : 0; return UP.D.materials.map(m => [sc(m), m]).filter(x => x[0]).sort((a, b) => b[0] - a[0]).map(x => x[1]); };
  // A material is "locked" when its Access column says sign in / email / member. With accounts on, a free account unlocks it; otherwise the old email box is used.
  UP.unlocked = () => UP.accShown() ? !!UP.sessUser() : (() => { try { return !!localStorage.getItem('up_unlock'); } catch (e) { return false; } })();
  UP.matCard = m => { const lk = m.access === 'email' && !UP.unlocked(); return `<a class="mat${lk ? ' locked' : ''}" ${lk ? `href="#" data-gate="${esc(m.link)}" data-t="${esc(m.title)}"` : `href="${esc(m.link)}" target="_blank" rel="noopener"`}><span class="mt">${esc(m.type)}</span>${m.fmt ? `<span class="fmt">${esc(m.fmt)}</span>` : ''}<b>${esc(m.title)}</b>${m.text ? `<p>${esc(m.text)}</p>` : ''}<span class="mo">${lk ? (UP.accShown() ? '&#128274; Free account to unlock' : 'Enter your email to unlock') : /youtu/i.test(m.link) ? 'Watch' : 'Open or download'} &rarr;</span></a>`; };
  const unlockCards = () => document.querySelectorAll('[data-gate]').forEach(a => { a.href = a.dataset.gate; a.target = '_blank'; a.rel = 'noopener'; a.classList.remove('locked'); a.removeAttribute('data-gate'); const o = a.querySelector('.mo'); if (o) o.innerHTML = 'Open or download &rarr;'; });
  // Free sign-up gate. With accounts on: the small sign-in pop-up (people stay on the page). Otherwise: the old one-time email box.
  UP.gate = (link, title) => {
    if (UP.accShown()) {
      UP.loadAcc().then(A => A.need({ title: 'Unlock "' + title + '"', lead: 'Create a free account in about 20 seconds. All free materials open right away, and you can save your favourites.', cta: { label: 'Open ' + title, href: link, text: 'This material is unlocked, and so is every other free material.' } })).then(r => {
        if (!r) return; unlockCards();
        const em = (r.user && r.user.email) || '', nm = (r.user && r.user.user_metadata && r.user.user_metadata.full_name) || em;
        try { UP.send({ action: 'material', Name: nm, Email: em, Material: title, Link: link, Page: location.pathname }).catch(() => { }); } catch (x) { }
      }).catch(() => { window.open(link, '_blank', 'noopener'); });   // if sign-in cannot load, never block a free guide
      return;
    }
    let d = document.getElementById('ugate'); if (!d) { d = document.createElement('dialog'); d.id = 'ugate'; d.className = 'm2 sm'; document.body.appendChild(d); }
    d.innerHTML = `<button class="x" type="button" data-x aria-label="Close">&times;</button><div class="in"><h2 style="margin:0 0 8px">Unlock this free material</h2><p class="mute" style="margin:0 0 14px">Enter your email and <b>${esc(title)}</b> opens right away. We may send you scholarship deadlines. No spam, and you can unsubscribe at any time.</p><form id="ugf" class="f"><div><label for="uge">Email *</label><input id="uge" type="email" required autocomplete="email"></div><div><label for="ugn">First name</label><input id="ugn" autocomplete="given-name"></div><label class="chk2"><input type="checkbox" required> I agree to the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy Policy</a>.</label><button class="btn" type="submit">Unlock and open</button></form></div>`;
    if (d.showModal) d.showModal(); else d.setAttribute('open', ''); const shut = () => { if (d.close) d.close(); else d.removeAttribute('open'); };
    d.onclick = ev => { if (ev.target.closest('[data-x]') || ev.target === d) shut(); };
    d.querySelector('#ugf').onsubmit = async ev => { ev.preventDefault(); const em = d.querySelector('#uge').value.trim(), nm = d.querySelector('#ugn').value.trim(); d.querySelector('button[type=submit]').disabled = true;
      try { await UP.send({ action: 'material', Name: nm || em, Email: em, Material: title, Link: link, Page: location.pathname }); } catch (x) { }
      try { localStorage.setItem('up_unlock', em); } catch (x) { } unlockCards();
      shut(); window.open(link, '_blank', 'noopener'); }; };
  document.addEventListener('up-auth', unlockCards);
  document.addEventListener('click', e => { const g = e.target.closest('[data-gate]'); if (g) { e.preventDefault(); UP.gate(g.dataset.gate, g.dataset.t); } });
  // ---- AI helper (optional). It appears only when the "ai-chat" server function answers a ping, so nothing breaks while it is not set up.
  const aiHdr = () => ({ 'Content-Type': 'application/json', apikey: C.supabaseKey, Authorization: 'Bearer ' + C.supabaseKey });
  const aiFetch = (body, ms) => { const ctl = typeof AbortController === 'function' ? new AbortController() : null, t = setTimeout(() => { if (ctl) ctl.abort(); }, ms);
    return fetch(String(C.supabaseUrl).replace(/\/$/, '') + '/functions/v1/ai-chat', { method: 'POST', headers: aiHdr(), body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined }).finally(() => clearTimeout(t)); };
  let aiMemo = null;
  UP.aiReady = () => { const now = Date.now(); if (aiMemo && now - aiMemo.t < (aiMemo.ok ? 600000 : 120000)) return aiMemo.p;
    const p = (async () => { if (!C.supabaseUrl || !C.supabaseKey || C.aiChat === false) return false;
      try { const r = await aiFetch({ ping: true }, 5000); if (!r.ok) return false; const j = await r.json(); return !!(j && j.ok === true); } catch (e) { return false; } })();
    const m = aiMemo = { t: now, p, ok: false }; p.then(ok => { m.ok = ok; }); return p; };
  const AI_STOP = new Set('the and for with from that this what which where when how can you your are any have has about into who why does not get give want need looking find some more than best good scholarship scholarships please tell'.split(' '));
  // Chooses the listings most related to the conversation, so the AI only sees a short, relevant list (never the whole database).
  UP.aiPick = (text, profile, n) => { text = String(text || '').toLowerCase(); profile = profile || {}; const toks = (text.match(/[a-z0-9]{3,}/g) || []).filter(w => !AI_STOP.has(w)), wantClosed = /\b(closed|past|expired|old)\b/.test(text);
    const arr = x => Array.isArray(x) ? x : [], sc = UP.D.opps.map(o => { const nm = (String(o.name) + ' ' + String(o.sponsor)).toLowerCase(), rest = [arr(o.countries).join(' '), arr(o.levels).join(' '), arr(o.subjects).join(' '), arr(o.tags).join(' '), arr(o.regions).join(' '), o.type, o.funding, o.elig, o.award].join(' ').toLowerCase();
      let s = 0; toks.forEach(w => { if (nm.includes(w)) s += 3; else if (rest.includes(w)) s += 1; });
      if (profile.level && (profile.level === 'Internship' ? o.type === 'Internship' : arr(o.levels).includes(profile.level))) s += 2;
      if (profile.region && arr(o.regions).includes(profile.region)) s += 2; if (profile.funding === 'full' && o.funding === 'full') s += 1.5; if (profile.subject && arr(o.subjects).includes(profile.subject)) s += 1.5;
      if (o.featured) s += .5; if (o.closed && !wantClosed) s -= 6; return { o, s }; });
    sc.sort((a, b) => b.s - a.s); return sc.slice(0, n).map(x => ({ id: x.o.id, name: x.o.name, sponsor: x.o.sponsor, countries: x.o.countries, levels: x.o.levels, funding: x.o.funding, award: x.o.award, deadline: x.o.deadline, closed: !!x.o.closed, elig: x.o.elig })); };
  // Turns the AI's text into safe HTML: everything is escaped first, then only **bold**, line breaks and links to OUR OWN listings are added.
  UP.aiHtml = t => { const ids = new Map(UP.D.opps.map(o => [String(o.id).toLowerCase(), o.id]));
    return esc(t).replace(/\*\*([^*\n]{1,120})\*\*/g, '<b>$1</b>').replace(/\s?\[\[([a-z0-9-]{1,81})\]\]/g, (m, id) => ids.has(id) ? ' <a class="ai-link" href="opportunity.html?id=' + encodeURIComponent(ids.get(id)) + '">View page</a>' : '').replace(/\[\[[^\]]{0,90}\]\]/g, '').replace(/\n/g, '<br>'); };
  UP.aiAsk = async (msgs, profile) => {
    const lastUser = msgs.filter(m => m.role === 'user').slice(-3).map(m => m.content).join(' ');
    try { const r = await aiFetch({ messages: msgs.slice(-10), context: UP.aiPick(lastUser, profile, 25), profile }, 40000), j = await r.json().catch(() => ({}));
      if (r.ok && j && j.reply) return { reply: String(j.reply) };
      if (r.status === 429) return { limit: true, error: String(j.message || "You have reached today's free question limit. Please come back tomorrow, or talk to a pilot for personal advice.") };
      return { error: j && j.error && j.error !== 'limit' ? String(j.error) : 'The AI helper could not answer right now. Please try again in a minute.' };
    } catch (e) { return { error: e && e.name === 'AbortError' ? 'The AI helper is taking too long. Please try again.' : 'We could not reach the AI helper. Please check your internet connection and try again.' }; } };
  // Guided assistant: asks four questions and answers ONLY from your own listings, so it can never invent a scholarship.
  UP.assistant = () => { if (document.getElementById('asb')) return;
    const b = document.createElement('button'); b.id = 'asb'; b.type = 'button'; b.className = 'asst'; b.textContent = 'Find my match'; document.body.appendChild(b);
    const d = document.createElement('dialog'); d.id = 'asd'; d.className = 'm2 sm'; document.body.appendChild(d);
    const ST = () => [['level', 'What are you looking for?', [['Master', "A Master's scholarship"], ['Bachelor', "A Bachelor's scholarship"], ['PhD', 'A PhD scholarship'], ['Internship', 'An internship']]], ['region', 'Where would you like to study?', [['', 'Anywhere']].concat(UP.REGIONS.map(r => [r[0], r[0]]))], ['funding', 'How much funding do you need?', [['full', 'Fully funded only'], ['', 'Any funding is fine']]], ['subject', 'What is your field?', [['', 'Any field']].concat(UP.SUBJECTS.map(s => [s, s]))]];
    let i = 0, v = {}, aiOn = false, chatOn = false, busy = false, hist = [], view = [];
    const open = () => { i = 0; v = {}; chatOn = false; draw(); if (d.showModal) d.showModal(); else d.setAttribute('open', '');
      UP.aiReady().then(ok => { if (ok !== aiOn) { aiOn = ok; if (!chatOn && d.hasAttribute('open')) draw(); } }); }, shut = () => { if (d.close) d.close(); else d.removeAttribute('open'); };
    const flt = () => ({ level: v.level && v.level !== 'Internship' ? [v.level] : [], type: v.level === 'Internship' ? ['Internship'] : [], region: v.region ? [v.region] : [], funding: v.funding ? [v.funding] : [], subject: v.subject ? [v.subject] : [] });
    const aiBtn = (cls) => aiOn ? `<button type="button" class="${cls}" data-chat>Ask our AI helper</button>` : '';
    const prof = () => { const p = {}; ['level', 'region', 'funding', 'subject'].forEach(k => { if (v[k]) p[k] = v[k]; }); return p; };
    const starters = () => { const p = prof(); return ['Which fully funded scholarships close soonest?', Object.keys(p).length ? 'Which scholarships fit me best?' : "Which scholarships are good for a Master's degree?", 'How do I start my application?']; };
    const bubble = m => `<div class="ai-m ${m.k}">${m.k === 'u' ? esc(m.t) : m.h}</div>`;
    const drawChat = () => { const top = '<button class="x" type="button" data-x aria-label="Close">&times;</button>';
      d.innerHTML = `${top}<div class="in"><p class="pk2">AI helper</p><h2 style="margin:4px 0 8px">Ask a question</h2><p class="ai-note">The AI can make mistakes. Please confirm every detail on the official page. Do not type passport, bank or other private details. Your questions are processed by Anthropic, which runs the AI, and we do not save them.</p><div class="ai-log" id="ail" role="log" aria-live="polite" aria-label="Conversation">${view.length ? view.map(bubble).join('') : `<div class="ai-chips">${starters().map(q => `<button type="button" class="ai-chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`}</div><form class="ai-form" id="aif"><textarea id="ait" rows="2" maxlength="500" aria-label="Your question" placeholder="Type your question here"${view.some(m => m.lim) ? ' disabled' : ''}></textarea><button class="btn" type="submit"${busy || view.some(m => m.lim) ? ' disabled' : ''}>Send</button></form><div class="mact" style="margin-top:12px"><button type="button" class="btn out sm" data-qs>Back to the questions</button><a class="btn out sm" href="pilots.html">Talk to a pilot</a></div></div>`;
      const l = d.querySelector('#ail'), la = l && l.querySelector('.ai-m.a:last-child'); if (l) l.scrollTop = la ? Math.max(0, la.offsetTop - l.offsetTop - 4) : l.scrollHeight; };      // a new answer is shown from its first line, a new question at the bottom
    const say = async text => { text = String(text || '').trim().slice(0, 500); if (!text || busy) return; busy = true; view = view.filter(m => m.k !== 'e');
      view.push({ k: 'u', t: text }); hist.push({ role: 'user', content: text }); view.push({ k: 'w', h: '<span class="ai-dots" aria-label="Thinking"><i></i><i></i><i></i></span>' }); drawChat();
      const r = await UP.aiAsk(hist, prof()); busy = false; view = view.filter(m => m.k !== 'w');
      if (r.reply) { hist.push({ role: 'assistant', content: r.reply }); view.push({ k: 'a', h: UP.aiHtml(r.reply) }); }
      else { hist.pop(); view.pop(); view.push({ k: 'e', h: esc(r.error), lim: !!r.limit }); }      // a failed question is put back in the box so nothing has to be typed twice
      if (chatOn && d.hasAttribute('open')) { drawChat(); const t = d.querySelector('#ait'); if (t) { if (!r.reply && !r.limit) t.value = text; if (!t.disabled) t.focus(); } } };
    const draw = () => { if (chatOn) return drawChat(); const S = ST(), top = '<button class="x" type="button" data-x aria-label="Close">&times;</button>';
      if (i < S.length) { const [k, q, os] = S[i]; d.innerHTML = `${top}<div class="in"><p class="pk2">Step ${i + 1} of ${S.length}</p><h2 style="margin:4px 0 16px">${esc(q)}</h2><div class="aopts">${os.map(o => `<button type="button" class="aopt" data-k="${k}" data-v="${esc(o[0])}">${esc(o[1])}</button>`).join('')}</div>${i ? '<button type="button" class="btn out sm" data-back style="margin-top:18px">Back</button>' : aiBtn('btn out sm ai-open')}</div>`; return; }
      const f = flt(), all = UP.filterList(UP.D.opps, f).filter(o => !o.closed), best = all.slice().sort((a, c) => (c.featured - a.featured) || ((c.funding === 'full') - (a.funding === 'full'))).slice(0, 3), qs = []; Object.keys(v).forEach(k => { if (v[k]) qs.push(k === 'level' && v[k] === 'Internship' ? 'type=Internship' : k + '=' + encodeURIComponent(v[k])); });
      const seen = new Set(), pl = []; best.forEach(o => UP.pilotsFor(o).forEach(x => { if (!seen.has(x.e.id) && pl.length < 2) { seen.add(x.e.id); pl.push(x); } })); if (!pl.length && v.subject) UP.D.experts.filter(e => e.field === v.subject).slice(0, 2).forEach(e => pl.push({ e, why: e.field }));
      d.innerHTML = `${top}<div class="in"><h2 style="margin:0 0 6px">${all.length ? 'We found ' + all.length + (all.length === 1 ? ' match' : ' matches') : 'No exact match yet'}</h2><p class="mute" style="margin:0 0 14px">${all.length ? 'Here are the strongest ones. Always confirm details on the official page.' : 'Try again with a wider choice, or ask our advisors.'}</p>${best.map(o => `<a class="amatch" href="opportunity.html?id=${encodeURIComponent(o.id)}"><b>${esc(o.name)}</b><span>${esc((o.sponsor || '').split(' - ')[0].split(':')[0])}</span></a>`).join('')}${all.length > 3 ? `<a class="btn sm" style="margin:6px 0 14px" href="scholarships.html?${qs.join('&')}">See all ${all.length} results</a>` : ''}${pl.length ? `<h3 style="margin:14px 0 8px;font-size:1rem">Pilots who can guide you</h3><div class="pgrid">${pl.map(UP.pilotMini).join('')}</div>` : ''}<div class="mact" style="margin-top:16px"><a class="btn" href="pilots.html">Talk to a pilot</a>${aiBtn('btn out')}<button type="button" class="btn out" data-restart>Start again</button></div></div>`; };
    b.onclick = open; d.onclick = e => { if (e.target.closest('[data-x]') || e.target === d) { shut(); return; } const o = e.target.closest('.aopt'); if (o) { v[o.dataset.k] = o.dataset.v; i++; draw(); } else if (e.target.closest('[data-back]')) { i = Math.max(0, i - 1); draw(); } else if (e.target.closest('[data-restart]')) { i = 0; v = {}; draw(); }
      else if (e.target.closest('[data-chat]')) { chatOn = true; drawChat(); const t = d.querySelector('#ait'); if (t) t.focus(); }
      else if (e.target.closest('[data-qs]')) { chatOn = false; draw(); }
      else { const q = e.target.closest('[data-q]'); if (q) say(q.dataset.q); } };
    d.onsubmit = e => { e.preventDefault(); const t = d.querySelector('#ait'); if (t && t.value.trim()) say(t.value); };
    d.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && e.target && e.target.id === 'ait') { e.preventDefault(); const t = e.target; if (t.value.trim()) say(t.value); } }); };

  // ---- approved pilots from the database (public, read-only: only name, profile text and photo of ACTIVE pilots are ever sent)
  const dbMap = r => {
    const arr = v => Array.isArray(v) ? v.map(x => String(x || '').trim()).filter(Boolean) : [], id = String(r.slug || '').trim().toLowerCase();
    if (!id || !/^[a-z0-9-]{2,60}$/.test(id) || !String(r.display_name || '').trim()) return null;
    const ph = String(r.photo_url || '').trim(), li = String(r.linkedin_url || '').trim();
    return { id, field: String(r.field || '').trim(), name: String(r.display_name).trim(), role: String(r.headline || '').trim(), tagline: String(r.tagline || '').trim(), about: String(r.bio || '').trim(), photo: /^https:\/\//i.test(ph) ? ph : '', alt: '', tags: arr(r.scholarships), edu: arr(r.education), exp: arr(r.highlights), langs: arr(r.languages), loc: String(r.based_in || '').trim(), studied: arr(r.studied_in), unis: arr(r.universities), helps: arr(r.helps_with), li: /^https:\/\//i.test(li) ? li : '', feat: false, fromDb: true, uuid: /^[0-9a-f-]{36}$/i.test(String(r.id || '')) ? String(r.id) : '', tz: String(r.timezone || '').trim() };
  };
  async function loadDbPilots() {
    if (!UP.accShown()) return [];
    try {
      const ctl = typeof AbortController === 'function' ? new AbortController() : null, t = setTimeout(() => { if (ctl) ctl.abort(); }, 6000);
      const base = 'slug,display_name,headline,bio,field,studied_in,universities,scholarships,languages,helps_with,photo_url,linkedin_url', go = cols => fetch(C.supabaseUrl + '/rest/v1/v_pilot_cards?select=' + cols + '&limit=300', { headers: { apikey: C.supabaseKey, Accept: 'application/json' }, signal: ctl ? ctl.signal : undefined });
      let r = await go('id,timezone,education,highlights,based_in,tagline,' + base);
      if (!r.ok) r = await go('id,timezone,' + base);          // the full-profile database update is not installed yet
      if (!r.ok) r = await go(base);          // the database update for booking is not installed yet: still show the pilots
      clearTimeout(t); if (!r.ok) return []; const j = await r.json();
      return Array.isArray(j) ? j.map(dbMap).filter(Boolean) : [];
    } catch (e) { return []; }
  }

  async function boot(active, render) {
    let raw = null; try { raw = localStorage.getItem(KEY); } catch (e) { }
    const run = p => { UP.D = build(p); applySettings(UP.D.settings); shell(active); render(UP); reveal(); };
    let first = null; try { first = raw ? JSON.parse(raw) : null; } catch (e) { }
    const dbp = loadDbPilots();
    run(first);
    let src = null;
    if (C.sheetId) { try { src = await readSheets(C.sheetId); if (!src.opportunities.length) src = null; } catch (e) { src = null; } if (!src) console.warn('Google Sheet not loaded (is it shared as "Anyone with the link: Viewer"?). Using the Excel file instead.'); }
    if (!src && C.contentFile) { try { const r = await fetch(C.contentFile, { cache: 'no-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status); src = await readXlsx(await r.arrayBuffer()); } catch (e) { console.warn('Content file not loaded; using saved or built-in data.', e); } }
    if (src && src.opportunities.length) { const s = JSON.stringify(src); if (s !== raw) { try { localStorage.setItem(KEY, s); } catch (e) { } run(src); } if (UP.D.dupes.length) console.warn('Same-name rows were merged into one card:', UP.D.dupes); }
    try { const pl = await dbp, sig = JSON.stringify(pl); if (sig !== dbSig && (pl.length || dbSig)) { dbSig = sig; dbPilots = pl; run(src || first); } } catch (e) { }
    if (C.scriptUrl) { try { const r = await fetch(C.scriptUrl + (C.scriptUrl.includes('?') ? '&' : '?') + 'action=count'), j = await r.json(); if (+j.count >= 0 && +j.count !== UP.count) { UP.count = +j.count; shell(active); render(UP); reveal(); } } catch (e) { } }
  }
  UP.boot = boot;

  const ICON = { pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>', doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>', cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>', check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>' };
  UP.icon = k => `<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ICON.check}</svg></span>`;
  const logo = '<img class="lg" src="images/logo-mark.jpg" alt="UNIPILOT GLOBAL logo" width="63" height="50">';

  const dg = s => String(s || '').replace(/\D/g, '');
  UP.waDisplay = () => C.whatsapp ? (C.whatsappDisplay && dg(C.whatsappDisplay) === dg(C.whatsapp) ? C.whatsappDisplay : '+' + dg(C.whatsapp)) : '';
  const socials = () => [['Facebook', C.facebook], ['LinkedIn', C.linkedin], ['YouTube', C.youtubeChannel]].concat(Object.keys(C.social || {}).map(k => [k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1), C.social[k]])).filter(x => x[1]);
  function shell(active) {
    const nav0 = C.nav.filter(n => !n.needs || (UP.D[n.needs] || []).length), has = re => nav0.some(n => re.test(n.href)), nav1 = has(/pilots\.html|consultation\.html/) ? nav0 : nav0.slice(0, 2).concat([{ id: 'pilots', label: 'Pilots', href: 'pilots.html' }], nav0.slice(2)), nav = has(/contact\.html/) ? nav1 : nav1.concat([{ id: 'contact', label: 'Contact', href: 'contact.html' }]), w = UP.wa(), up = UP.D.seminars.filter(s => s.up).sort((a, b) => a.date.localeCompare(b.date))[0];
    const so = socials(), disp = UP.waDisplay();
    const IC = { WhatsApp: '<path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8z"/><path d="M9.2 9.2c0 2.9 2.7 5.6 5.6 5.6l1-1.5-1.9-1-1 .7c-1-.4-1.7-1.1-2.1-2.1l.7-1-1-1.9z"/>', Email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', Facebook: '<path d="M14 8.5h3V4.5h-3a4 4 0 0 0-4 4V11H7v4h3v6h4v-6h3l1-4h-4V8.5z"/>', LinkedIn: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.5v.01M12 17v-3.5a2 2 0 0 1 4 0V17M12 10.5V17"/>', YouTube: '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/>' }, ic = (n, href, ext) => `<a href="${esc(href)}" ${ext ? 'target="_blank" rel="noopener" ' : ''}aria-label="${esc(n)}" title="${esc(n)}"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ICON.globe}</svg></a>`;
    const shortD = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch (e) { return ''; } };
    const msg = up ? `<span class="tb">Free seminar</span><span class="ml"><b>${esc(up.title)}</b>${isoOk(up.date) ? ' &middot; ' + esc(fmtDate(up.date)) : ''}</span><span class="ms">${isoOk(up.date) ? esc(shortD(up.date)) : ''}</span><a href="seminars.html"><span class="ml">Reserve your seat </span><span class="ms">Join </span>&rarr;</a>` : 'Real guidance from pilots who won scholarships and studied abroad';
    $('#hdr').innerHTML = `<div class="cbar"><div class="w"><p class="cmsg">${msg}</p><span class="ci">${(w ? ic('WhatsApp', w, 1) : '') + (C.email ? ic('Email', 'mailto:' + C.email) : '') + so.map(s => ic(s[0], s[1], 1)).join('')}</span></div></div>` +
      `<header><div class="w"><a class="logo" href="index.html">${logo}<span><b>${esc(C.brand)}</b><small>${esc(C.tagline)}</small></span></a>
      <nav id="nav">${nav.map(n => `<a href="${n.href}" class="${n.id === active ? 'on' : ''}">${esc(n.label)}</a>`).join('')}${UP.accLinks() ? `<a id="navacc" class="navacc" href="account.html">${UP.sessUser() ? 'My account' : 'Sign in'}</a>` : ''}</nav>
      ${w ? `<a class="btn sm wa hide-m" href="${w}" target="_blank" rel="noopener">WhatsApp</a>` : ''}${UP.signHTML()}<button id="menu" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button></div></header>`;
    $('#menu').onclick = e => { const o = $('#nav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
    $('#ftr').innerHTML = `<footer><div class="w"><div class="fg"><div><a class="flogo" href="index.html"><img src="images/logo-full.jpg" alt="UNIPILOT GLOBAL" width="120" height="96"></a><h4>${esc(C.brand)}</h4><p>${esc(C.tagline)}. We help students find scholarships abroad and prepare stronger applications.</p>
      ${true ? `<form id="subf" class="sub"><input type="email" name="e" required placeholder="Email for deadline alerts" aria-label="Email"><button class="btn sm" type="submit">Join</button></form><p id="subm" style="margin-top:8px"></p>` : ''}</div>
      <div><h4>Explore</h4>${nav.map(n => `<div><a href="${n.href}">${esc(n.label)}</a></div>`).join('')}<div><a href="reviews.html">Share your experience</a></div><div><a href="legal.html">Legal &amp; Privacy</a></div>${UP.accLinks() ? `<div id="ftracc"><a href="account.html">${UP.sessUser() ? 'My account' : 'Sign in or create an account'}</a></div>${UP.sessUser() ? '' : '<div><a href="account.html?as=pilot">Pilot sign in</a></div>'}` : ''}</div>
      <div><h4>Continents</h4>${REGIONS.map(r => `<div><a href="scholarships.html?region=${encodeURIComponent(r[0])}">${esc(r[0])}</a></div>`).join('')}</div>
      <div><h4>Contact</h4>${w ? `<div><a href="${w}" target="_blank" rel="noopener">Chat on WhatsApp</a></div>` : ''}<div><a href="mailto:${esc(C.email)}">${esc(C.email)}</a></div>${so.map(s => `<div><a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a></div>`).join('')}</div></div>
      <p class="fine">Scholarship details are compiled from official programme information and change from year to year. Always confirm deadlines, amounts and requirements on the official website before you apply. ${esc(C.brand)} is an advisory service. We do not award scholarships and cannot guarantee admission or funding. &copy; ${new Date().getFullYear()} ${esc(C.brand)}</p></div></footer>${w ? `<a class="wafab" href="${w}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp" title="Chat on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41Z"/></svg></a>` : ''}`;
    const sf = $('#subf'); if (sf) sf.onsubmit = async e => { e.preventDefault(); const m = $('#subm'); try { await send({ action: 'subscribe', Email: sf.e.value.trim() }); m.textContent = 'Thank you. Check your inbox for a confirmation.'; sf.reset(); } catch (x) { m.textContent = 'Could not subscribe right now. Please email us instead.'; } };
    // accounts: adds "Sign in / My account" (only when config.js has the Supabase values)
    if (UP.accLinks()) { if (UP.acc) UP.acc.header(); else UP.loadAcc().then(a => a.header()).catch(() => { }); }
  }
  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); const n = e.target.dataset.n; if (n) { const t = +n, s = performance.now(), f = x => { const p = Math.min(1, (x - s) / 1100); e.target.textContent = UP.fmtN(Math.round(t * (1 - Math.pow(1 - p, 3)))) + (e.target.dataset.p || ''); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); } io.unobserve(e.target); }), { threshold: .2 });
    $$('.rv:not(.in),[data-n]:not(.in)').forEach(el => io.observe(el));
  }
  UP.reveal = reveal;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const tfetch = (u, o, ms) => { const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 15000); return fetch(u, Object.assign({ signal: c.signal }, o)).finally(() => clearTimeout(t)); };
  // Sends a form to the owner's inbox. Tries every available route, twice each, before giving up.
  async function send(obj) {
    const flat = {}; Object.keys(obj).forEach(k => { if (k !== 'action' && k !== 'website') flat[k] = obj[k]; });
    const kind = obj.action === 'subscribe' ? 'New subscriber' : obj.action === 'review' ? 'New review to approve' : obj.action === 'contact' ? 'New message' : 'New request', subject = kind + ': ' + (obj.Name || obj.Email) + (obj.Service ? ' (' + obj.Service + ')' : '');
    try { const q = JSON.parse(localStorage.getItem('up_outbox') || '[]'); q.push({ t: Date.now(), obj }); localStorage.setItem('up_outbox', JSON.stringify(q.slice(-5))); } catch (e) { }
    const rest = Object.assign({}, flat); delete rest.Name; delete rest.Email; const routes = [], FE = C.formEmail || C.email;
    const auto = 'Thank you for contacting ' + C.brand + '. We have received your message and will reply to you personally soon. ' + C.tagline;
    if (C.scriptUrl) routes.push(async () => { const r = await tfetch(C.scriptUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(obj) }), j = await r.json(); if (!j.success) throw new Error(j.error || 'Not accepted'); if (typeof j.count === 'number') UP.count = j.count; return j; });
    if (C.web3formsKey) routes.push(async () => { const r = await tfetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ access_key: C.web3formsKey, subject, from_name: C.brand + ' website', name: obj.Name || '', email: obj.Email, botcheck: '' }, rest)) }), j = await r.json(); if (!j.success) throw new Error(j.message || 'Not accepted'); return j; });
    // FormSubmit, route 1: JSON (lets us read the answer)
    routes.push(async () => { const r = await tfetch('https://formsubmit.co/ajax/' + encodeURIComponent(FE), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ _subject: subject, _template: 'table', _captcha: 'false', _autoresponse: auto, name: obj.Name || '', email: obj.Email }, rest)) }), j = await r.json().catch(() => ({})); if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || 'Not accepted'); return j; });
    // FormSubmit, route 2: the classic form post that has always worked for this inbox (answer cannot be read, delivery is by email)
    routes.push(async () => { const fd = new FormData(); fd.append('_subject', subject); fd.append('_template', 'table'); fd.append('_captcha', 'false'); fd.append('_autoresponse', auto); fd.append('name', obj.Name || ''); fd.append('email', obj.Email || ''); Object.keys(rest).forEach(k => fd.append(k, rest[k])); await tfetch('https://formsubmit.co/' + encodeURIComponent(FE), { method: 'POST', mode: 'no-cors', body: fd }); return { success: true, unconfirmed: true }; });
    let last; UP.errs = [];
    for (const go of routes) for (let i = 0; i < 2; i++) { try { const j = await go(); try { localStorage.removeItem('up_outbox'); } catch (e) { } return j; } catch (e) { last = e; UP.errs.push(String(e.message || e)); if (i === 0) await sleep(900); } }
    throw last;
  }
  // Friendly recovery box: nothing is lost, the visitor can deliver the same answers by email or WhatsApp in one tap.
  UP.failBox = (obj, what, err) => {
    const lines = Object.keys(obj).filter(k => k !== 'action' && k !== 'website' && obj[k]).map(k => k + ': ' + obj[k]).join('\n'), subj = C.brand + ': ' + (what || 'my request'), w = UP.wa(subj + '\n\n' + lines);
    const mail = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.slice(0, 1800));
    return `<div class="msg err" role="alert"><b>Your answers are safe, but they did not reach us automatically.</b><br>Please send them in one tap using the same details:<div class="fb"><a class="btn sm" href="${esc(mail)}">Send by email</a>${w ? `<a class="btn sm wa" href="${w}" target="_blank" rel="noopener">Send on WhatsApp</a>` : ''}<button type="button" class="btn sm out" data-copy="${esc(lines)}">Copy my answers</button><span class="mute">or press the send button again</span></div>${new URLSearchParams(location.search).get('debug') && err ? '<pre style="white-space:pre-wrap;margin:10px 0 0">' + esc(String(err.message || err)) + '</pre>' : ''}</div>`;
  };
  document.addEventListener('click', e => { const b = e.target.closest('[data-copy]'); if (!b) return; const t = b.dataset.copy, d = () => { b.textContent = 'Copied'; }; (navigator.clipboard ? navigator.clipboard.writeText(t).then(d) : Promise.reject()).catch(() => { const x = document.createElement('textarea'); x.value = t; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); d(); } catch (z) { } x.remove(); }); });
  const post = send;
  UP.post = send; UP.send = send;

  // ---------- filtering ----------
  function filterList(list, f) {
    const W = (f.q || '').toLowerCase().split(/\s+/).filter(Boolean), ty = A(f.type), lv0 = A(f.level), rg = A(f.region), co = A(f.country), su = A(f.subject), fu = A(f.funding), ef = A(f.effort), tg = A(f.tag), mo = A(f.month).map(String);
    const r = list.filter(o => (!ty.length || ty.includes(o.type)) && (!rg.length || rg.some(r => o.regions.includes(r))) && (!co.length || co.some(c => o.countries.includes(c))) && (!lv0.length || lv0.some(l => o.levels.includes(l))) &&
      (!su.length || su.some(s => o.subjects.includes(s)) || o.subjects.includes('All fields')) && (!fu.length || fu.includes(o.funding)) && (!ef.length || ef.includes(o.effortLevel)) && (!tg.length || tg.some(x => o.tags.includes(x))) &&
      (!mo.length || mo.some(m => m === 'roll' ? !o.months.length : o.months.includes(+m))) && (!f.video || !!o.video) &&
      W.every(w => (o.levels.map(l => LV[l] || l).join(' ') + ' ' + o.name + ' ' + o.sponsor + ' ' + o.elig + ' ' + o.region + ' ' + o.countries.join(' ') + ' ' + o.subjects.join(' ') + ' ' + o.award + ' ' + o.best).toLowerCase().includes(w)));
    const lv = { Bachelor: 0, Master: 1, PhD: 2 }, cl = (a, b) => (a.closed ? 1 : 0) - (b.closed ? 1 : 0), nm = (a, b) => a.name.localeCompare(b.name), sp = o => su.length && !su.some(s => o.subjects.includes(s)) ? 1 : 0, s = f.sort || 'rec';
    r.sort(s === 'name' ? nm : s === 'level' ? (a, b) => lv[a.levels[0]] - lv[b.levels[0]] || nm(a, b) : s === 'soon' ? (a, b) => cl(a, b) || sp(a) - sp(b) || soon(a) - soon(b) || nm(a, b) : (a, b) => cl(a, b) || sp(a) - sp(b) || (b.featured - a.featured) || String(b.added).localeCompare(String(a.added)) || nm(a, b));
    return r;
  }
  const OPT = {
    type: [['', 'all opportunities'], ['Scholarship', 'scholarships'], ['Internship', 'internships']],
    level: [['', 'any degree'], ['Bachelor', "Bachelor's"], ['Master', "Master's"], ['PhD', 'PhD']],
    funding: [['', 'any funding'], ['full', 'Fully funded (tuition + living costs)'], ['stipend', 'Stipend or fellowship'], ['partial', 'Partial grant or waiver']],
    effort: [['', 'any effort'], ['Low', 'Low effort'], ['Medium', 'Medium effort'], ['High', 'High effort']],
    tag: [['', 'any applicant'], ['From Africa', 'Applicants from Africa'], ['From Asia', 'Applicants from Asia'], ['From Europe', 'Applicants from Europe'], ['From North America', 'Applicants from North America'], ['From Latin America & Caribbean', 'Applicants from Latin America'], ['From Oceania', 'Applicants from Oceania'], ['Women', 'Women applicants'], ['Need-based', 'Financial need'], ['Work experience', 'Work experience required'], ['Research', 'Research-focused'], ['Refugee / displaced', 'Refugee or displaced']],
    month: [['', 'any month']].concat(MONN.map((m, i) => [String(i), m]), [['roll', 'Rolling or varies']]),
    sort: [['rec', 'Recommended'], ['soon', 'Deadline soonest'], ['name', 'Name A to Z'], ['level', 'Degree level']]
  };
  UP.optHTML = key => {
    const o = op => op.map(x => `<option value="${esc(x[0])}">${esc(x[1])}</option>`).join('');
    if (key === 'region') return o([['', 'any continent']].concat(REGIONS.map(r => [r[0], r[0]])));
    if (key === 'subject') return o([['', 'any subject']].concat(SUBJECTS.map(s => [s, s])));
    if (key === 'country') { const n = {}; UP.D.opps.forEach(x => x.countries.forEach(c => n[c] = (n[c] || 0) + 1)); const have = Object.keys(n).sort(), rest = COUNTRIES.filter(c => !n[c]);
      return '<option value="">any country</option>' + (have.length ? '<optgroup label="Countries with listings">' + have.map(c => `<option value="${esc(c)}">${esc(c)} (${n[c]})</option>`).join('') + '</optgroup>' : '') + '<optgroup label="All other countries">' + rest.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('') + '</optgroup>'; }
    if (key === 'type' && !UP.D.opps.some(x => x.type === 'Internship')) return o(OPT.type.filter(x => x[0] !== 'Internship'));
    return o(OPT[key]);
  };
  UP.fill = (ids) => ids.forEach(k => { const el = $('#' + k); if (!el) return; const v = el.value; el.innerHTML = UP.optHTML(k); el.value = v; });

  // ---------- components ----------
  UP.card = o => {
    const cut = (t, n) => { t = String(t || '').replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim(); const w = t.split(' '); return w.length > n ? w.slice(0, n).join(' ').replace(/[,;:\-–—]+$/, '') + '…' : t; };
    const where = o.countries.length ? o.countries.slice(0, 3).map(c => UP.flag(c) || `<span class="fm">${esc(c)}</span>`).join('') + (o.countries.length > 3 ? `<span class="fm">+${o.countries.length - 3}</span>` : '') : '<span class="fm">Multiple countries</span>';
    return `<a class="card" style="--c:${RCOL[o.region] || '#1F4E8C'}" href="opportunity.html?id=${encodeURIComponent(o.id)}"><div><span class="pill ${o.type}">${o.type}</span><span class="pill">${esc(o.levels.map(l => LV[l] || l).join(' / '))}</span>${o.funding === 'full' ? '<span class="pill ok">Fully funded</span>' : ''}${o.closed ? '<span class="pill bad">Closed</span>' : ''}</div>
      <h3>${esc(o.name)}</h3><p class="sp" title="${esc(o.sponsor)}">${esc(cut(o.sponsor.split(' — ')[0], 6))}</p><dl><div><dt>Covers</dt><dd title="${esc(o.award)}">${esc(cut(o.award, 8))}</dd></div><div><dt>Deadline</dt><dd title="${esc(o.deadline)}">${esc(cut(o.deadline, 5))}</dd></div></dl>
      <div class="cf"><span class="cfl">${where}${o.video ? '<span class="vtag">Video</span>' : ''}</span><span class="go">View details &rarr;</span></div></a>`;
  };
  UP.href = l => { const o = UP.D.opps.find(x => x.id === l); return o ? 'opportunity.html?id=' + encodeURIComponent(l) : l; };
  UP.newsCard = n => `<a class="nc ${n.pin ? 'pin' : ''}" ${n.link ? `href="${esc(UP.href(n.link))}"` : ''}><span class="pill gold">${esc(n.cat)}</span> <span class="nm">${esc(fmtDate(n.date))}${n.pin ? ' · Pinned' : ''}</span><h3>${esc(n.title)}</h3><p style="margin:0">${esc(n.text)}</p>${n.link ? '<p class="go" style="margin:10px 0 0;font-weight:700">Read more &rarr;</p>' : ''}</a>`;
  UP.video = (id, title) => `<button class="vid" data-v="${esc(id)}" style="background-image:url(https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg)" aria-label="Play ${esc(title)}"></button>`;
  UP.videoCard = v => `<div class="box">${UP.video(v.id, v.title)}<h3 style="margin-top:14px">${esc(v.title)}</h3><p class="mute" style="margin:0">${esc(v.text)}</p></div>`;
  UP.semCard = s => {
    const dt = isoOk(s.date) ? fmtDate(s.date) : s.date, rw = UP.wa('I want to register for the free seminar: ' + s.title);
    const cover = s.cover ? `<div class="cover" style="background-image:url('${esc(s.cover)}')" role="img" aria-label="${esc(s.title)}"></div>` : `<div class="cover gen"><span>FREE SEMINAR</span><b>${esc(s.title)}</b></div>`;
    const act = s.up ? (s.register ? `<a class="btn" href="${esc(s.register)}" target="_blank" rel="noopener">Register free</a>` : rw ? `<a class="btn" href="${rw}" target="_blank" rel="noopener">Register on WhatsApp</a>` : '') : '';
    return `<div class="box sc">${!s.up && s.rec ? UP.video(s.rec, s.title) : cover}<div class="sb"><span class="date">${esc(dt)}${s.time ? ' · ' + esc(s.time) : ''}</span><h3>${esc(s.title)}</h3><p class="mute">${esc(s.topic)}</p>${s.speaker ? `<p><b>Speaker:</b> ${esc(s.speaker)}</p>` : ''}${act}${!s.up && s.attendees ? `<p class="mute" style="margin:10px 0 0">${esc(s.attendees)} attended</p>` : ''}</div></div>`;
  };
  const av = n => `<span class="av">${esc(String(n).slice(0, 1))}</span>`;
  // Side-by-side scrolling list with arrows (swipe works on phones).
  UP.car = el => { if (!el) return; el.classList.remove('grid', 'three'); el.classList.add('car'); let w = el.parentNode; if (!w.classList.contains('carw')) { w = document.createElement('div'); w.className = 'carw'; el.parentNode.insertBefore(w, el); w.appendChild(el); w.insertAdjacentHTML('beforeend', '<button type="button" class="cb prev" aria-label="Previous">&#8249;</button><button type="button" class="cb next" aria-label="Next">&#8250;</button>'); w.addEventListener('click', e => { const b = e.target.closest('.cb'); if (b) el.scrollBy({ left: (b.classList.contains('next') ? 1 : -1) * el.clientWidth * .85, behavior: 'smooth' }); }); el._u = () => { w.classList.toggle('noscroll', el.scrollWidth <= el.clientWidth + 4); w.querySelector('.prev').disabled = el.scrollLeft < 4; w.querySelector('.next').disabled = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4; }; el.addEventListener('scroll', el._u, { passive: true }); window.addEventListener('resize', el._u); } el.scrollLeft = 0; setTimeout(el._u, 60); };
  { const nc0 = UP.newsCard; UP.newsCard = n => { const h = nc0(n); return n.photo ? h.replace(/^(<[a-z]+[^>]*>)/, '$1<img class="nph" src="' + esc(n.photo) + '" alt="" loading="lazy" onerror="this.remove()">') : h; }; }
  UP.reviewCard = r => `<figure class="box rev"><div class="stars" aria-label="${r.rating} out of 5">${r.rating ? '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) : ''}</div><blockquote>${esc(r.text)}</blockquote><figcaption>${r.photo ? `<img src="${esc(r.photo)}" alt="" loading="lazy" data-n="${esc(String(r.name || '?').slice(0, 1))}" onerror="UP.imgFail(this)">` : av(r.name)}<span><b>${esc(r.name)}</b><br><span class="mute">${esc([r.country, r.result].filter(Boolean).join(' · '))}</span></span></figcaption></figure>`;
  // Photos never show a broken icon: try images/ then the top folder, then fall back to the initial.
  UP.imgFail = el => { if (el.dataset.a && !el.dataset.t) { el.dataset.t = 1; el.src = el.dataset.a; return; } const s = document.createElement('span'); s.className = el.closest('.mph') ? 'avl' : 'av'; s.textContent = el.dataset.n || '?'; el.replaceWith(s); };
  UP.photoHTML = e => e.photo ? `<img src="${esc(e.photo)}" alt="${esc(e.name)}" loading="lazy" data-n="${esc(e.name.slice(0, 1))}" data-a="${esc(e.alt || '')}" onerror="UP.imgFail(this)">` : `<span class="avl">${esc(e.name.slice(0, 1))}</span>`;
  UP.FLAGS = {"afghanistan":"af","albania":"al","algeria":"dz","andorra":"ad","angola":"ao","antigua and barbuda":"ag","argentina":"ar","armenia":"am","australia":"au","austria":"at","azerbaijan":"az","bahamas":"bs","bahrain":"bh","bangladesh":"bd","barbados":"bb","belarus":"by","belgium":"be","belize":"bz","benin":"bj","bhutan":"bt","bolivia":"bo","bosnia and herzegovina":"ba","botswana":"bw","brazil":"br","brunei":"bn","bulgaria":"bg","burkina faso":"bf","burundi":"bi","cabo verde":"cv","cambodia":"kh","cameroon":"cm","canada":"ca","central african republic":"cf","chad":"td","chile":"cl","china":"cn","colombia":"co","comoros":"km","costa rica":"cr","croatia":"hr","cuba":"cu","cyprus":"cy","czech republic":"cz","denmark":"dk","djibouti":"dj","dominica":"dm","dominican republic":"do","dr congo":"cd","ecuador":"ec","egypt":"eg","el salvador":"sv","equatorial guinea":"gq","eritrea":"er","estonia":"ee","eswatini":"sz","ethiopia":"et","fiji":"fj","finland":"fi","france":"fr","gabon":"ga","gambia":"gm","georgia":"ge","germany":"de","ghana":"gh","greece":"gr","grenada":"gd","guatemala":"gt","guinea":"gn","guinea-bissau":"gw","guyana":"gy","haiti":"ht","honduras":"hn","hong kong":"hk","hungary":"hu","iceland":"is","india":"in","indonesia":"id","iran":"ir","iraq":"iq","ireland":"ie","israel":"il","italy":"it","ivory coast":"ci","jamaica":"jm","japan":"jp","jordan":"jo","kazakhstan":"kz","kenya":"ke","kiribati":"ki","kosovo":"xk","kuwait":"kw","kyrgyzstan":"kg","laos":"la","latvia":"lv","lebanon":"lb","lesotho":"ls","liberia":"lr","libya":"ly","liechtenstein":"li","lithuania":"lt","luxembourg":"lu","macau":"mo","madagascar":"mg","malawi":"mw","malaysia":"my","maldives":"mv","mali":"ml","malta":"mt","marshall islands":"mh","mauritania":"mr","mauritius":"mu","mexico":"mx","micronesia":"fm","moldova":"md","monaco":"mc","mongolia":"mn","montenegro":"me","morocco":"ma","mozambique":"mz","myanmar":"mm","namibia":"na","nauru":"nr","nepal":"np","netherlands":"nl","new zealand":"nz","nicaragua":"ni","niger":"ne","nigeria":"ng","north korea":"kp","north macedonia":"mk","norway":"no","oman":"om","pakistan":"pk","palau":"pw","palestine":"ps","panama":"pa","papua new guinea":"pg","paraguay":"py","peru":"pe","philippines":"ph","poland":"pl","portugal":"pt","puerto rico":"pr","qatar":"qa","republic of the congo":"cg","romania":"ro","russia":"ru","rwanda":"rw","saint kitts and nevis":"kn","saint lucia":"lc","saint vincent and the grenadines":"vc","samoa":"ws","san marino":"sm","sao tome and principe":"st","saudi arabia":"sa","senegal":"sn","serbia":"rs","seychelles":"sc","sierra leone":"sl","singapore":"sg","slovakia":"sk","slovenia":"si","solomon islands":"sb","somalia":"so","south africa":"za","south korea":"kr","south sudan":"ss","spain":"es","sri lanka":"lk","sudan":"sd","suriname":"sr","sweden":"se","switzerland":"ch","syria":"sy","taiwan":"tw","tajikistan":"tj","tanzania":"tz","thailand":"th","timor-leste":"tl","togo":"tg","tonga":"to","trinidad and tobago":"tt","tunisia":"tn","turkey":"tr","turkmenistan":"tm","tuvalu":"tv","uganda":"ug","ukraine":"ua","united arab emirates":"ae","united kingdom":"gb","united states":"us","uruguay":"uy","uzbekistan":"uz","vanuatu":"vu","vatican city":"va","venezuela":"ve","vietnam":"vn","yemen":"ye","zambia":"zm","zimbabwe":"zw","t\u00fcrkiye":"tr","czechia":"cz","usa":"us","uk":"gb","cape verde":"cv","cote d'ivoire":"ci","congo (drc)":"cd","democratic republic of the congo":"cd","swaziland":"sz","macedonia":"mk","uae":"ae","burma":"mm","east timor":"tl","the gambia":"gm"};
  UP.flag = n => { const c = UP.FLAGS[String(n).trim().toLowerCase()]; return c ? `<img class="fl" src="images/flags/${c}.svg" alt="" title="${esc(n)}" width="24" height="18" loading="lazy" onerror="this.remove()">` : ''; };
  // Side drawer for filters (button next to the search bar). Used by the finder and the pilot page.
  UP.drawerInit = () => { const dr = document.getElementById('fdrawer'), bg = document.getElementById('fdbg'); if (!dr || dr._i) return; dr._i = 1;
    const open = () => { bg.hidden = false; dr.hidden = false; requestAnimationFrame(() => dr.classList.add('open')); document.body.style.overflow = 'hidden'; }, shut = () => { dr.classList.remove('open'); bg.hidden = true; document.body.style.overflow = ''; setTimeout(() => { if (!dr.classList.contains('open')) dr.hidden = true; }, 260); };
    document.getElementById('fbtn2').onclick = open; ['fdx', 'fdshow', 'fdbg'].forEach(i => { document.getElementById(i).onclick = shut; }); document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); }); };
  UP.regionOf = c => CMAP[String(c).trim().toLowerCase()] || '';
  UP.matForTopic = t => UP.D.materials.filter(m => nz(m.cat) === nz(t.name) || nz(m.cat) === nz(t.id));
  // Pilots for one scholarship page: only those who know this scholarship or studied in its host country.
  UP.pilotsFor = o => { const nm = nz(o.name + ' ' + (o.sponsor || '')), cc = n => UP.FLAGS[String(n).trim().toLowerCase()] || nz(n), cs = (o.countries || []).map(cc), stop = /^(scholarships?|fellowships?|grants?|awards?|programs?|programmes?|master|masters|joint|foundation|university|government|the|and|for|of)$/;
    const known = tag => { const w = String(tag).toLowerCase().split(/[^a-z0-9]+/).filter(x => x.length > 2 && !stop.test(x)); return w.length > 0 && (nm.includes(nz(tag)) || w.every(x => nm.includes(x))); };
    // Strict: a pilot appears only if they know THIS scholarship or studied in its host country. No fallback.
    return UP.D.experts.map(e => { const t = e.tags.find(known), c = e.studied.find(x => cs.includes(cc(x))); return { e, sc: (t ? 3 : 0) + (c ? 2 : 0) + (e.feat ? .5 : 0), why: t ? 'Knows ' + t : c ? 'Studied in ' + c : '' }; }).filter(x => x.why).sort((a, b) => b.sc - a.sc); };
  UP.pilotMini = x => `<a class="pm2" href="pilots.html?pilot=${esc(x.e.id)}"><span class="pm2p">${UP.photoHTML(x.e)}</span><span class="pm2t"><b>${esc(x.e.name)}</b><span>${esc(x.e.role)}</span>${x.e.studied.length ? `<span class="pm2f">${x.e.studied.slice(0, 4).map(UP.flag).join('')}</span>` : ''}${x.why ? `<small>${esc(x.why)}</small>` : ''}</span></a>`;
  UP.mentorCard = e => `<article class="mc" tabindex="0" data-m="${esc(e.id)}"><div class="mph">${UP.photoHTML(e)}${e.studied.length ? `<div class="mflags">${e.studied.slice(0, 5).map(UP.flag).join('')}</div>` : ''}</div><div class="mb"><h3>${esc(e.name)}</h3><p class="mr">${esc(e.role)}</p>${e.tagline ? `<p class="mt2">${esc(e.tagline)}</p>` : ''}<p class="mtags">${e.field ? `<span class="pill">${esc(e.field)}</span>` : ''}${e.tags.slice(0, 2).map(t => `<span class="pill g">${esc(t)}</span>`).join('')}</p>${e.helps.length ? `<p class="mh">${e.helps.slice(0, 3).map(h => `<span>${esc(h)}</span>`).join('')}</p>` : ''}<div class="mact"><button type="button" class="btn sm out" data-m="${esc(e.id)}">View profile</button><button type="button" class="btn sm" data-b="${esc(e.id)}">Book</button></div></div></article>`;
  UP.ask = o => {
    let d = document.getElementById('askd'); if (!d) { d = document.createElement('dialog'); d.id = 'askd'; d.className = 'dlg'; document.body.appendChild(d); }
    d.innerHTML = `<button class="dx" type="button" aria-label="Close">&times;</button><h3>Ask an experienced advisor</h3><p class="mute">About: <b>${esc(o.name)}</b>. Tell us what you want to know. We reply by email or WhatsApp.</p><div id="askm"></div>
      <form id="askf" class="f" style="grid-template-columns:1fr"><div><label for="a_n">Your name *</label><input id="a_n" required></div><div><label for="a_e">Email *</label><input id="a_e" type="email" required></div><div><label for="a_p">WhatsApp number (optional)</label><input id="a_p" type="tel"></div><div><label for="a_b">Your degree and field</label><input id="a_b" placeholder="e.g. BSc Chemistry, 3.5 GPA"></div><div><label for="a_q">Your question *</label><textarea id="a_q" rows="3" required></textarea></div><input id="a_h" style="display:none" tabindex="-1" autocomplete="off"><button class="btn blk" id="a_go" type="submit">Send my question</button></form>`;
    const q = s => d.querySelector(s); q('.dx').onclick = () => d.close();
    q('#askf').onsubmit = async e => {
      e.preventDefault(); if (q('#a_h').value) return; const v = i => q('#' + i).value.trim(), btn = q('#a_go'), m = q('#askm');
      const p = { action: 'request', website: '', Name: v('a_n'), Email: v('a_e'), Phone: v('a_p'), 'Current education': v('a_b'), Service: 'Scholarship expert question', Opportunity: o.name, Message: v('a_q') };
      btn.disabled = true; btn.textContent = 'Sending...'; m.innerHTML = '';
      try { await send(p); q('#askf').hidden = true; m.innerHTML = `<div class="msg ok"><b>Thank you, ${esc(p.Name)}.</b> Your question is with our team. We will reply to ${esc(p.Email)} soon.</div>`; }
      catch (err) { m.innerHTML = UP.failBox(p, 'question about ' + o.name, err); btn.disabled = false; btn.textContent = 'Send my question'; }
    };
    d.showModal();
  };
  UP.facetOpts = key => {
    const D = UP.D;
    if (key === 'country') { const n = {}; D.opps.forEach(o => o.countries.forEach(c => n[c] = 1)); return Object.keys(n).sort().map(c => [c, c]); }
    if (key === 'region') return REGIONS.map(r => [r[0], r[0]]);
    if (key === 'subject') return SUBJECTS.map(s => [s, s]);
    return (OPT[key] || []).filter(x => x[0] !== '');
  };
  UP.tipsFor = o => {
    const t = [], lv = o.levels;
    if (o.type === 'Internship') t.push('Tailor your CV to the role: lead with the skills and projects the posting asks for.', 'Write a short, specific motivation statement. Name the team or project you want to join and why.');
    else t.push('Read the eligibility line by line before you write anything. Most rejections are eligibility mismatches, not weak essays.');
    if (lv.includes('PhD')) t.push('Contact potential supervisors before you apply. Send a one-page research summary and a short, specific email.');
    if (lv.includes('Master')) t.push('Show a clear link between your past studies, this programme and your career goal. Committees look for a story, not a list.');
    if (lv.includes('Bachelor')) t.push('Beyond grades, show leadership and community impact with concrete numbers and outcomes.');
    if (o.scoring) t.push('Spend most of your time on the criteria with the highest weight in the selection breakdown above.');
    if (o.effortLevel === 'High') t.push('Start at least 8 to 12 weeks early. Certified transcripts, translations and referee letters usually take longer than expected.');
    if (o.docs.length) t.push('Ask your referees at least 4 weeks ahead and give them your CV, your draft SOP and the deadline.');
    if (o.tags.includes('Need-based')) t.push('Support your financial-need statement with clear documents and keep the numbers consistent across forms.');
    if (o.tags.includes('Women')) t.push('Explain the impact you want to make for women in your field, not only your own career.');
    if (!o.months.length) t.push('"Rolling" or "varies" does not mean unlimited time. Funds are awarded as applications are reviewed, so apply early.');
    t.push('Submit at least 48 hours before the deadline. Portals slow down on the last day.', 'Have your SOP and CV reviewed by someone who has seen successful applications before you submit.');
    return t.slice(0, 6);
  };
  UP.guideHTML = r => { const G = UP.D.guides, names = r === 'Oceania' ? ['Australia', 'New Zealand'] : [r]; const ok = names.filter(n => G[n]); if (!ok.length) return '';
    return `<details class="rg"><summary>How to match your profile for ${esc(r)}</summary>` + ok.map(n => `${names.length > 1 ? `<h3 style="margin-top:14px">${esc(n)}</h3>` : ''}<table><tr><th>Profile area</th><th>What you need to know</th><th>How it shapes your options</th></tr>${G[n].map(g => `<tr><td><b>${esc(g.cat)}</b></td><td><ul>${g.inputs.map(i => `<li>${esc(i)}</li>`).join('')}</ul></td><td><ul>${g.use.map(i => `<li>${esc(i)}</li>`).join('')}</ul></td></tr>`).join('')}</table>`).join('') + '</details>'; };
  document.addEventListener('click', e => { const b = e.target.closest('.vid[data-v]'); if (b) b.outerHTML = `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.v}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe></div>`; });
  UP.filterList = filterList; UP.OPT = OPT; UP.build = build; UP.norm = norm;
  window.UP = UP; setTimeout(() => UP.assistant(), 0);
})();
