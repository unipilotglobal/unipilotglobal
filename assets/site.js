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
    return { id: g('ID') || slug(name), type: /intern/i.test(g('Type')) ? 'Internship' : 'Scholarship', name, sponsor: g('Sponsor'), region: rg, levels: lv.length ? lv : ['Master'],
      subjects: L(g('Subjects')).length ? L(g('Subjects')) : derSub(txt), countries: L(g('Host countries')).length ? L(g('Host countries')).map(cn) : derCty(txt), tags: L(g('Tags')).length ? L(g('Tags')) : derTags(txt, lv),
      funding: /^full/.test(fund) ? 'full' : /^stip/.test(fund) ? 'stipend' : 'partial', award: g('Award'), deadline: g('Deadline'), months: months(g('Deadline')), elig: g('Eligibility'),
      effort: g('Effort'), effortLevel: em ? em[2][0].toUpperCase() + em[2].slice(1).toLowerCase() : '', best: g('Best for'), desc: g('Description'), docs: g('Documents') ? g('Documents').split('|').map(s => s.trim()).filter(Boolean) : [],
      tips: g('Expert tips') ? g('Expert tips').split('|').map(s => s.trim()).filter(Boolean) : [], scoring: g('Selection'), past: g('Winners'), link: g('Official link'), video: ytId(g('YouTube')), price: g('Price'), pay: g('Pay link'), featured: /^y/i.test(g('Featured')), closed: /^closed/i.test(g('Status')), added: g('Added on'), verified: g('Verified on') };
  }
  const isoOk = d => /^\d{4}-\d{2}-\d{2}/.test(d || '');
  const fmtDate = d => isoOk(d) ? new Date(d.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : (d || '');
  const img = u => { u = String(u || '').trim(); if (!u) return ''; const m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || u.match(/drive\.google\.com\/open\?id=([\w-]+)/); return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1280' : u; };
  const A = x => Array.isArray(x) ? x : (x ? [x] : []);
  function build(p) {
    p = p || {}; const raw = (p.opportunities && p.opportunities.length ? p.opportunities : BASE.opportunities) || [], by = new Map(), dupes = [];
    raw.forEach(r => { const nm = String(r.Name || '').trim(); if (!nm) return; const k = nm.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!by.has(k)) { by.set(k, Object.assign({}, r)); return; } dupes.push(nm); const m = by.get(k);
      Object.keys(r).forEach(c => { const v = String(r[c] == null ? '' : r[c]).trim(); if (!v) return; if (c === 'Levels') m.Levels = uniq(L(m.Levels).concat(L(v))).join(', '); else if (c !== 'ID') m[c] = r[c]; }); });
    const ids = {}, opps = Array.from(by.values()).map(norm).filter(Boolean).map(o => { ids[o.id] = (ids[o.id] || 0) + 1; if (ids[o.id] > 1) o.id += '-' + ids[o.id]; return o; });
    const today = new Date().toISOString().slice(0, 10);
    const sem = (p.seminars || BASE.seminars || []).filter(s => s.Title && !/^(draft|hidden)$/i.test(String(s.Status || '').trim())).map(s => ({ title: s.Title, date: String(s.Date || ''), time: s.Time || '', topic: s.Topic || '', speaker: s.Speaker || '', attendees: s.Attendees || '', register: s['Register link'] || '', rec: ytId(s['Recording (YouTube link)']), cover: img(s['Cover photo']), up: /upcoming/i.test(s.Status) || (!/past/i.test(s.Status) && String(s.Date) >= today) }));
    const news = (p.news || BASE.news || []).filter(n => n.Title).map(n => ({ date: String(n.Date || ''), cat: n.Category || 'Update', title: n.Title, text: n.Summary || '', link: n.Link || '', pin: /^y/i.test(n.Pinned) }));
    const vids = (p.videos || BASE.videos || []).map(v => ({ id: ytId(v.YouTube), title: v.Title || '', text: v.Description || '', cat: v.Category || '' })).filter(v => v.id);
    const reviews = (p.reviews || BASE.reviews || []).filter(r => r.Review && /^y/i.test(String(r.Approved || ''))).map(r => ({ name: r.Name || 'Student', country: r.Country || '', result: r.Result || '', text: r.Review, rating: Math.max(0, Math.min(5, +r.Rating || 0)), photo: img(r.Photo) }));
    const experts = (p.experts || BASE.experts || []).filter(e => e.Name).map(e => ({ field: e.Field || '', name: e.Name, role: e.Role || '', about: e.About || '', photo: img(e.Photo) }));
    const visa = (p.visa || BASE.visa || []).filter(v => v.Country).map(v => ({ country: cn(v.Country), type: v['Visa type'] || '', time: v['Processing time'] || '', docs: v['Key documents'] ? String(v['Key documents']).split('|').map(s => s.trim()).filter(Boolean) : [], link: v['Official link'] || '', notes: v.Notes || '', checked: String(v['Last checked'] || '') }));
    const mats = (p.materials || []).filter(m => m.Title && /^https?:\/\//i.test(String(m.Link || '').trim()) && !/^(draft|hidden)$/i.test(String(m.Status || '').trim())).map(m => ({ title: String(m.Title).trim(), type: String(m.Type || 'Guide').trim(), text: m.Description || '', link: String(m.Link).trim(), cat: m.Category || '', added: String(m['Added on'] || ''), feat: /^y/i.test(m.Featured), rel: String(m['Related scholarships'] || '').split(/[|;\n]/).map(x => x.trim().toLowerCase()).filter(Boolean) })).sort((a, b) => b.feat - a.feat || b.added.localeCompare(a.added));
    return { opps, materials: mats, seminars: sem, news, videos: vids, reviews, experts, visa, settings: p.settings || {}, guides: BASE.regionGuides || {}, dupes };
  }
  const UP = { C, $, $$, esc, LV, REGIONS, RCOL, RDESC, SUBJECTS, COUNTRIES, fmtDate, ytId, soon, img, A, count: 0, D: build(null) };

  function applySettings(s) {
    const m = { students_base: 'studentsBase', seminars_held: 'seminarsHeld', years_experience: 'yearsExperience', whatsapp: 'whatsapp', youtube_channel: 'youtubeChannel', default_video: 'defaultVideo', facebook: 'facebook' };
    Object.keys(m).forEach(k => { if (s[k] !== undefined && String(s[k]).trim() !== '') C[m[k]] = k === 'whatsapp' ? String(s[k]).replace(/\D/g, '') : (/_base|_held|years/.test(k) ? +s[k] : String(s[k]).trim()); });
  }
  UP.wa = m => C.whatsapp ? 'https://wa.me/' + String(C.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(m || C.whatsappMessage) : '';
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
    return { opportunities: out.opportunities || [], seminars: out.seminars || [], news: out.news || [], videos: out.videos || [], reviews: out.reviews || [], experts: out.experts || [], visa: out.visa || [], materials: out.materials || [], settings };
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
  UP.matCard = m => `<a class="mat" href="${esc(m.link)}" target="_blank" rel="noopener"><span class="mt">${esc(m.type)}</span><b>${esc(m.title)}</b>${m.text ? `<p>${esc(m.text)}</p>` : ''}<span class="mo">${/youtu/i.test(m.link) ? 'Watch' : 'Open or download'} &rarr;</span></a>`;
  async function boot(active, render) {
    let raw = null; try { raw = localStorage.getItem(KEY); } catch (e) { }
    const run = p => { UP.D = build(p); applySettings(UP.D.settings); shell(active); render(UP); reveal(); };
    let first = null; try { first = raw ? JSON.parse(raw) : null; } catch (e) { }
    run(first);
    let src = null;
    if (C.sheetId) { try { src = await readSheets(C.sheetId); if (!src.opportunities.length) src = null; } catch (e) { src = null; } if (!src) console.warn('Google Sheet not loaded (is it shared as "Anyone with the link: Viewer"?). Using the Excel file instead.'); }
    if (!src && C.contentFile) { try { const r = await fetch(C.contentFile, { cache: 'no-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status); src = await readXlsx(await r.arrayBuffer()); } catch (e) { console.warn('Content file not loaded; using saved or built-in data.', e); } }
    if (src && src.opportunities.length) { const s = JSON.stringify(src); if (s !== raw) { try { localStorage.setItem(KEY, s); } catch (e) { } run(src); } if (UP.D.dupes.length) console.warn('Same-name rows were merged into one card:', UP.D.dupes); }
    if (C.scriptUrl) { try { const r = await fetch(C.scriptUrl + (C.scriptUrl.includes('?') ? '&' : '?') + 'action=count'), j = await r.json(); if (+j.count >= 0 && +j.count !== UP.count) { UP.count = +j.count; shell(active); render(UP); reveal(); } } catch (e) { } }
  }
  UP.boot = boot;

  const ICON = { pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>', doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>', cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>', check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>' };
  UP.icon = k => `<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ICON.check}</svg></span>`;
  const logo = '<img class="lg" src="images/logo-mark.jpg" alt="UNIPILOT GLOBAL logo" width="63" height="50">';

  const dg = s => String(s || '').replace(/\D/g, '');
  UP.waDisplay = () => C.whatsapp ? (C.whatsappDisplay && dg(C.whatsappDisplay) === dg(C.whatsapp) ? C.whatsappDisplay : '+' + dg(C.whatsapp)) : '';
  const socials = () => [['Facebook', C.facebook], ['YouTube', C.youtubeChannel]].concat(Object.keys(C.social || {}).map(k => [k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1), C.social[k]])).filter(x => x[1]);
  function shell(active) {
    const nav = C.nav.filter(n => !n.needs || (UP.D[n.needs] || []).length), w = UP.wa(), up = UP.D.seminars.filter(s => s.up).sort((a, b) => a.date.localeCompare(b.date))[0];
    const so = socials(), disp = UP.waDisplay();
    $('#hdr').innerHTML = `<div class="cbar"><div class="w"><span>${w ? `<a href="${w}" target="_blank" rel="noopener">WhatsApp ${esc(disp)}</a>` : ''}<a href="mailto:${esc(C.email)}">${esc(C.email)}</a></span><span class="soc">${so.map(s => `<a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join('')}</span></div></div>` + (up ? `<div class="ann">Free seminar: <b>${esc(up.title)}</b>${isoOk(up.date) ? ' on ' + esc(fmtDate(up.date)) : ''}<a href="seminars.html">Reserve your seat &rarr;</a></div>` : '') +
      `<header><div class="w"><a class="logo" href="index.html">${logo}<span><b>${esc(C.brand)}</b><small>${esc(C.tagline)}</small></span></a>
      <nav id="nav">${nav.map(n => `<a href="${n.href}" class="${n.id === active ? 'on' : ''}">${esc(n.label)}</a>`).join('')}<a class="navcta" href="consultation.html">Book a consultation</a>${w ? `<a class="navwa" href="${w}" target="_blank" rel="noopener">Chat on WhatsApp</a>` : ''}</nav>
      ${w ? `<a class="btn sm wa hide-m" href="${w}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<a class="btn sm" href="consultation.html">Book a consultation</a><button id="menu" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button></div></header>`;
    $('#menu').onclick = e => { const o = $('#nav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
    $('#ftr').innerHTML = `<footer><div class="w"><div class="fg"><div><a class="flogo" href="index.html"><img src="images/logo-full.jpg" alt="UNIPILOT GLOBAL" width="120" height="96"></a><h4>${esc(C.brand)}</h4><p>${esc(C.tagline)}. We help students find scholarships abroad and prepare stronger applications.</p>
      ${true ? `<form id="subf" class="sub"><input type="email" name="e" required placeholder="Email for deadline alerts" aria-label="Email"><button class="btn sm" type="submit">Join</button></form><p id="subm" style="margin-top:8px"></p>` : ''}</div>
      <div><h4>Explore</h4>${nav.map(n => `<div><a href="${n.href}">${esc(n.label)}</a></div>`).join('')}<div><a href="consultation.html">Book a consultation</a></div><div><a href="reviews.html">Share your experience</a></div><div><a href="privacy.html">Privacy</a></div></div>
      <div><h4>Continents</h4>${REGIONS.map(r => `<div><a href="scholarships.html?region=${encodeURIComponent(r[0])}">${esc(r[0])}</a></div>`).join('')}</div>
      <div><h4>Contact</h4>${w ? `<div><a href="${w}" target="_blank" rel="noopener">WhatsApp: ${esc(disp)}</a></div>` : ''}<div><a href="mailto:${esc(C.email)}">${esc(C.email)}</a></div>${so.map(s => `<div><a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a></div>`).join('')}</div></div>
      <p class="fine">Scholarship details are compiled from official programme information and change from year to year. Always confirm deadlines, amounts and requirements on the official website before you apply. ${esc(C.brand)} is an advisory service. We do not award scholarships and cannot guarantee admission or funding. &copy; ${new Date().getFullYear()} ${esc(C.brand)}</p></div></footer>${w ? `<a class="wafab" href="${w}" target="_blank" rel="noopener">Chat on WhatsApp</a>` : ''}`;
    const sf = $('#subf'); if (sf) sf.onsubmit = async e => { e.preventDefault(); const m = $('#subm'); try { await send({ action: 'subscribe', Email: sf.e.value.trim() }); m.textContent = 'Thank you. Check your inbox for a confirmation.'; sf.reset(); } catch (x) { m.textContent = 'Could not subscribe right now. Please email us instead.'; } };
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
    const kind = obj.action === 'subscribe' ? 'New subscriber' : obj.action === 'review' ? 'New review to approve' : 'New request', subject = kind + ': ' + (obj.Name || obj.Email) + (obj.Service ? ' (' + obj.Service + ')' : '');
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
    const r = list.filter(o => (!ty.length || ty.includes(o.type)) && (!rg.length || rg.includes(o.region)) && (!co.length || co.some(c => o.countries.includes(c))) && (!lv0.length || lv0.some(l => o.levels.includes(l))) &&
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
    tag: [['', 'any applicant'], ['Women', 'Women applicants'], ['Need-based', 'Financial need'], ['Work experience', 'Work experience required'], ['Research', 'Research-focused'], ['Refugee / displaced', 'Refugee or displaced']],
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
    const where = o.countries.length ? o.countries.slice(0, 3).join(', ') + (o.countries.length > 3 ? ' +' + (o.countries.length - 3) : '') : 'Multiple countries';
    return `<a class="card" style="--c:${RCOL[o.region] || '#1F4E8C'}" href="opportunity.html?id=${encodeURIComponent(o.id)}"><div><span class="pill ${o.type}">${o.type}</span><span class="pill">${esc(o.levels.map(l => LV[l] || l).join(' / '))}</span>${o.funding === 'full' ? '<span class="pill ok">Fully funded</span>' : ''}${o.closed ? '<span class="pill bad">Closed</span>' : ''}</div>
      <h3>${esc(o.name)}</h3><p class="sp">${esc(o.sponsor)}</p><dl><div><dt>Covers</dt><dd>${esc(o.award)}</dd></div><div><dt>Deadline</dt><dd>${esc(o.deadline)}</dd></div><div><dt>Where</dt><dd>${esc(where)}</dd></div></dl>
      <div class="cf">${o.video ? '<span class="vtag">Video guide</span>' : '<span></span>'}<span class="go">View details &rarr;</span></div></a>`;
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
  UP.reviewCard = r => `<figure class="box rev"><div class="stars" aria-label="${r.rating} out of 5">${r.rating ? '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) : ''}</div><blockquote>${esc(r.text)}</blockquote><figcaption>${r.photo ? `<img src="${esc(r.photo)}" alt="" loading="lazy">` : av(r.name)}<span><b>${esc(r.name)}</b><br><span class="mute">${esc([r.country, r.result].filter(Boolean).join(' · '))}</span></span></figcaption></figure>`;
  UP.expertCard = e => `<div class="box rev"><figcaption style="margin-bottom:12px">${e.photo ? `<img src="${esc(e.photo)}" alt="" loading="lazy">` : av(e.name)}<span><b>${esc(e.name)}</b><br><span class="mute">${esc(e.role)}</span></span></figcaption><p><span class="pill">${esc(e.field)}</span></p><p class="mute" style="margin:0">${esc(e.about)}</p><a class="btn sm out" style="margin-top:14px" href="consultation.html?service=expert&subject=${encodeURIComponent(e.field)}&expert=${encodeURIComponent(e.name)}">Book with ${esc(e.name.split(' ')[0])}</a></div>`;
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
    if (key === 'country') { const n = {}; D.opps.forEach(o => o.countries.forEach(c => n[c] = 1)); return Object.keys(n).sort().concat(COUNTRIES.filter(c => !n[c])).map(c => [c, c]); }
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
  window.UP = UP;
})();
