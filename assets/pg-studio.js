/* UNIPILOT GLOBAL: Post Studio (team only). Draws Facebook posters from the live website data. */
(() => {
'use strict';
const MONO = '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';
const SITE = 'unipilotglobal.com';
const F = { d: '"Fraunces","Hind Siliguri",Georgia,serif', s: '"DM Sans","Hind Siliguri",system-ui,sans-serif', m: '"DM Mono","DM Sans",ui-monospace,monospace' };
const THEMES = {
  night: { bg: '#0A1A33', bg2: '#16386B', ink: '#FFFFFF', sub: '#B8C4DA', accent: '#E3A72F', accentInk: '#0A1A33', card: '#FBF7EE', cardInk: '#0A1A33', cardSub: '#5E6C84', cardAccent: '#B37A0C', line: 'rgba(255,255,255,.13)', soft: 'rgba(255,255,255,.07)' },
  day: { bg: '#F3F6FB', bg2: '#FFFFFF', ink: '#0A1A33', sub: '#5E6C84', accent: '#E3A72F', accentInk: '#0A1A33', card: '#0A1A33', cardInk: '#FFFFFF', cardSub: '#B8C4DA', cardAccent: '#E3A72F', line: 'rgba(10,26,51,.11)', soft: 'rgba(10,26,51,.05)' },
  gold: { bg: '#E3A72F', bg2: '#F3C766', ink: '#0A1A33', sub: '#3D2E07', accent: '#0A1A33', accentInk: '#FFFFFF', card: '#FFFDF7', cardInk: '#0A1A33', cardSub: '#5E6C84', cardAccent: '#B37A0C', line: 'rgba(10,26,51,.16)', soft: 'rgba(10,26,51,.07)' }
};
const CODES = { germany: 'GER', 'united kingdom': 'UK', uk: 'UK', 'united states': 'USA', usa: 'USA', canada: 'CAN', australia: 'AUS', japan: 'JPN', china: 'CHN', 'south korea': 'KOR', korea: 'KOR', france: 'FRA', italy: 'ITA', spain: 'ESP', netherlands: 'NLD', sweden: 'SWE', norway: 'NOR', finland: 'FIN', denmark: 'DNK', switzerland: 'CHE', austria: 'AUT', belgium: 'BEL', hungary: 'HUN', poland: 'POL', turkey: 'TUR', 'türkiye': 'TUR', malaysia: 'MYS', singapore: 'SGP', 'new zealand': 'NZL', ireland: 'IRL', 'saudi arabia': 'KSA', qatar: 'QAT', 'united arab emirates': 'UAE', uae: 'UAE', india: 'IND', bangladesh: 'BGD', europe: 'EUR', 'south africa': 'ZAF', brunei: 'BRN', thailand: 'THA', taiwan: 'TWN', 'hong kong': 'HKG', russia: 'RUS', portugal: 'PRT', 'czech republic': 'CZE', czechia: 'CZE', romania: 'ROU', worldwide: 'WORLD', global: 'WORLD', 'any country': 'WORLD' };
const code = t => { const s = String(t || '').split(/[,|/]/)[0].trim(); if (!s) return '···'; return CODES[s.toLowerCase()] || (s.length <= 5 ? s.toUpperCase() : s.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()); };

/* ---------- drawing helpers ---------- */
const setF = (c, w, size, fam) => { c.font = `${w} ${Math.round(size)}px ${fam}`; };
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function wrap(c, text, maxW) {
  const out = [];
  String(text || '').split('\n').forEach(par => {
    const words = par.trim().split(/\s+/).filter(Boolean); let line = '';
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (c.measureText(t).width <= maxW || !line) line = t; else { out.push(line); line = w; } });
    if (line) out.push(line);
  });
  return out;
}
/* Largest size at which the text fits the box; shortens with … only at the smallest size. */
function fitBox(c, text, w, fam, maxW, maxH, hi, lo, lh) {
  lh = lh || 1.16; let size = hi, lines = [];
  for (; size >= lo; size -= 2) { setF(c, w, size, fam); lines = wrap(c, text, maxW); if (lines.length * size * lh <= maxH && lines.every(l => c.measureText(l).width <= maxW)) return { size, lines, lh: size * lh, h: lines.length * size * lh }; }
  size = lo; setF(c, w, size, fam); lines = wrap(c, text, maxW); const max = Math.max(1, Math.floor(maxH / (size * lh)));
  if (lines.length > max) { lines = lines.slice(0, max); let l = lines[max - 1]; while (l && c.measureText(l + '…').width > maxW) l = l.slice(0, -1); lines[max - 1] = l.replace(/[\s,.;:]+$/, '') + '…'; }
  lines = lines.map(l => { while (l.length > 1 && c.measureText(l).width > maxW) l = l.slice(0, -2) + '…'; return l; });
  return { size, lines, lh: size * lh, h: lines.length * size * lh };
}
function put(c, fb, w, fam, x, y, color, align) { setF(c, w, fb.size, fam); c.fillStyle = color; c.textAlign = align || 'left'; fb.lines.forEach((l, i) => c.fillText(l, x, y + i * fb.lh)); c.textAlign = 'left'; return y + fb.h; }
function label(c, t, x, y, size, color, align, sp) {
  sp = sp == null ? size * 0.16 : sp; t = String(t).toUpperCase(); setF(c, 500, size, F.m); c.fillStyle = color;
  let w = 0; for (const ch of t) w += c.measureText(ch).width + sp; w -= sp;
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  for (const ch of t) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + sp; }
  return w;
}
function plane(c, x, y, s, ang, color) {
  const p = [[0, -1], [.13, -.62], [.13, -.2], [1, .28], [1, .46], [.13, .22], [.1, .7], [.36, .9], [.36, 1.02], [0, .93]];
  c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); p.forEach(([a, b], i) => i ? c.lineTo(a * s, b * s) : c.moveTo(a * s, b * s)); p.slice().reverse().forEach(([a, b]) => c.lineTo(-a * s, b * s)); c.closePath(); c.fillStyle = color; c.fill(); c.restore();
}
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function barcode(c, x, y, w, h, seed, color) { let r = hash(seed) || 1, cx = x; c.fillStyle = color; while (cx < x + w - 2) { r = (Math.imul(r, 1103515245) + 12345) >>> 0; const bw = 2 + (r >>> 28) % 5, gap = 3 + (r >>> 24) % 4; if (cx + bw > x + w) break; c.fillRect(cx, y, bw, h); cx += bw + gap; } }
function check(c, x, y, r, bg, fg) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = bg; c.fill(); c.strokeStyle = fg; c.lineWidth = r * .22; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - r * .42, y + r * .02); c.lineTo(x - r * .1, y + r * .34); c.lineTo(x + r * .46, y - r * .3); c.stroke(); }
function shadowCard(c, x, y, w, h, r, fill) { c.save(); c.shadowColor = 'rgba(4,12,28,.35)'; c.shadowBlur = 50; c.shadowOffsetY = 22; rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); c.restore(); }
const lines = t => String(t || '').split('\n').map(s => s.trim()).filter(Boolean);

/* ---------- shared frame: sky chart, header, address bar ---------- */
let logoImg = null;
function frameBg(c, P, W, H) {
  c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W * .9, H * .06, 40, W * .9, H * .06, H * .95); g.addColorStop(0, P.bg2); g.addColorStop(1, P.bg); c.globalAlpha = .75; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
  /* a navigation chart: range rings round a far beacon, and one dotted route */
  c.strokeStyle = P.line; c.lineWidth = 2;
  for (let i = 1; i <= 7; i++) { c.beginPath(); c.arc(W * .93, H * .1, i * 165, 0, 7); c.stroke(); }
  c.save(); c.translate(W * .93, H * .1); for (let a = 0; a < 72; a++) { c.rotate(Math.PI / 36); c.beginPath(); c.moveTo(0, 825); c.lineTo(0, a % 2 ? 838 : 850); c.stroke(); } c.restore();
  c.setLineDash([3, 15]); c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-30, H * .86); c.bezierCurveTo(W * .3, H * .6, W * .55, H * .92, W + 30, H * .52); c.stroke(); c.setLineDash([]); c.lineCap = 'butt';
}
function header(c, P, W, o) {
  rr(c, 64, 54, 92, 92, 22); c.fillStyle = '#FFFFFF'; c.fill();
  if (logoImg) { const s = Math.min(78 / logoImg.width, 78 / logoImg.height), w = logoImg.width * s, h = logoImg.height * s; c.drawImage(logoImg, 64 + (92 - w) / 2, 54 + (92 - h) / 2, w, h); }
  setF(c, 700, 31, F.d); c.fillStyle = P.ink; c.fillText('UNIPILOT GLOBAL', 176, 66);
  label(c, 'Guide · Educate · Empower', 176, 110, 15, P.accent === '#0A1A33' ? '#3D2E07' : P.accent);
  if (o.stamp) { setF(c, 500, 16, F.m); const tw = label(c, 'Not an agency', -9999, -9999, 16, P.ink), bw = tw + 44; rr(c, W - 64 - bw, 78, bw, 44, 22); c.strokeStyle = P.ink; c.globalAlpha = .55; c.lineWidth = 2; c.stroke(); c.globalAlpha = 1; label(c, 'Not an agency', W - 64 - bw / 2, 92, 16, P.ink, 'center'); }
}
function footer(c, P, W, H, cta) {
  const y = H - 144, h = 88, bx = 64, bw = 474;
  rr(c, bx, y, bw, h, 44); c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = 'rgba(10,26,51,.16)'; c.lineWidth = 2; c.stroke();
  /* padlock */
  c.strokeStyle = '#5E6C84'; c.lineWidth = 4; c.beginPath(); c.arc(bx + 50, y + 39, 9, Math.PI, 0); c.stroke(); rr(c, bx + 37, y + 39, 26, 21, 5); c.fillStyle = '#5E6C84'; c.fill();
  setF(c, 600, 31, F.s); c.fillStyle = '#0A1A33'; c.fillText(SITE, bx + 82, y + 27); const uw = c.measureText(SITE).width;
  /* the pointer about to click */
  const px = bx + 82 + uw + 26, py = y + 30, s = 46, p = [[0, 0], [0, .95], [.27, .72], [.45, 1.15], [.62, 1.08], [.44, .66], [.78, .66]];
  c.beginPath(); p.forEach(([a, b], i) => i ? c.lineTo(px + a * s, py + b * s) : c.moveTo(px + a * s, py + b * s)); c.closePath(); c.fillStyle = '#0A1A33'; c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke(); c.fill();
  const cx = bx + bw + 20, cw = W - 64 - cx; rr(c, cx, y, cw, h, 44); c.fillStyle = P.accent; c.fill();
  const fb = fitBox(c, (cta || 'Book a session') + '  →', 700, F.s, cw - 48, 40, 29, 18, 1.2); put(c, fb, 700, F.s, cx + cw / 2, y + (h - fb.size) / 2 - 2, P.accentInk, 'center');
}

/* ---------- the designs ---------- */
const TPL = {
  boarding: {
    name: 'Boarding pass', use: 'One scholarship', cta: 'See details and apply', xlsx: true,
    fields: [['name', 'Scholarship name'], ['sponsor', 'Who gives it'], ['from', 'From (short, like YOU or BD)'], ['to', 'Country it takes you to'], ['level', 'Level'], ['funding', 'Funding'], ['field', 'Subjects'], ['deadline', 'Deadline'], ['cta', 'Button text']],
    sample: { name: 'DAAD EPOS Development-Related Postgraduate Courses', sponsor: 'German Academic Exchange Service (DAAD)', from: 'YOU', to: 'Germany', level: 'Master, PhD', funding: 'Fully funded', field: 'Many fields', deadline: 'Check each course on the official page', cta: 'See details and apply' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g; label(c, 'Scholarship boarding pass', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      const x = M, y = T + 50, w = W - 2 * M, h = B - y - 26, sy = y + Math.round(h * .71), ix = x + 50, iw = w - 100;
      shadowCard(c, x, y, w, h, 34, P.card);
      c.fillStyle = P.bg; c.beginPath(); c.arc(x, sy, 24, 0, 7); c.fill(); c.beginPath(); c.arc(x + w, sy, 24, 0, 7); c.fill();
      c.strokeStyle = P.cardSub; c.globalAlpha = .55; c.lineWidth = 3; c.setLineDash([10, 12]); c.beginPath(); c.moveTo(x + 40, sy); c.lineTo(x + w - 40, sy); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      /* route */
      const from = String(d.from || 'YOU').toUpperCase().slice(0, 5), to = code(d.to), cs = 108 * k; let cy = y + 40 * k;
      setF(c, 700, cs, F.d); c.fillStyle = P.cardInk; c.fillText(from, ix, cy); const fw = c.measureText(from).width, tw = c.measureText(to).width; c.fillText(to, ix + iw - tw, cy);
      const x1 = ix + fw + 34, x2 = ix + iw - tw - 34, my = cy + cs * .55;
      if (x2 - x1 > 90) { c.strokeStyle = P.cardAccent; c.lineWidth = 5; c.lineCap = 'round'; c.setLineDash([2, 16]); c.beginPath(); c.moveTo(x1, my); c.quadraticCurveTo((x1 + x2) / 2, my - 74 * k, x2, my); c.stroke(); c.setLineDash([]); c.lineCap = 'butt'; plane(c, (x1 + x2) / 2, my - 37 * k, 30 * k, Math.PI / 2, P.cardAccent); }
      cy += cs * 1.12; setF(c, 500, 23 * k + 3, F.s); c.fillStyle = P.cardSub; c.fillText('where you are now', ix, cy); c.textAlign = 'right'; c.fillText(fitBox(c, String(d.to || ''), 500, F.s, iw * .55, 40, 23 * k + 3, 16).lines[0] || '', ix + iw, cy); c.textAlign = 'left';
      cy += 58 * k; c.fillStyle = P.cardSub; c.globalAlpha = .3; c.fillRect(ix, cy, iw, 2); c.globalAlpha = 1; cy += 26 * k;
      /* details row sits just above the tear line */
      const fh = 118 * k, fy = sy - fh - 16 * k, cols = [['Level', d.level], ['Funding', d.funding], ['Subjects', d.field]].filter(a => a[1]), cw = iw / Math.max(cols.length, 1);
      cols.forEach(([l, v], i) => { label(c, l, ix + i * cw, fy, 19, P.cardSub); const fb = fitBox(c, v, 700, F.s, cw - 24, fh - 38, 31, 19, 1.18); put(c, fb, 700, F.s, ix + i * cw, fy + 34, P.cardInk); });
      const nb = fitBox(c, d.name, 700, F.d, iw, fy - cy - 62 * k, 62 * k + 6, 30, 1.12); cy = put(c, nb, 700, F.d, ix, cy, P.cardInk) + 8;
      if (d.sponsor) put(c, fitBox(c, d.sponsor, 500, F.s, iw, 36, 25, 17), 500, F.s, ix, cy, P.cardSub);
      /* stub */
      const sh = y + h - sy, bwid = 210; label(c, 'Boarding closes', ix, sy + 32 * k, 20, P.cardAccent);
      put(c, fitBox(c, d.deadline || 'See the official page', 700, F.d, iw - bwid - 30, sh - 86 * k, 50 * k + 4, 24, 1.14), 700, F.d, ix, sy + 64 * k, P.cardInk);
      barcode(c, ix + iw - bwid, sy + 36 * k, bwid, sh - 72 * k, d.name, P.cardInk);
    },
    cap: d => `✈️ ${d.name}\n\n🌍 ${d.to || ''}${d.level ? '\n🎓 ' + d.level : ''}${d.funding ? '\n💰 ' + d.funding : ''}${d.deadline ? '\n⏰ Deadline: ' + d.deadline : ''}\n\nRead the details and the official link on our site. We are not an agency. We guide, you decide.\n👉 https://${SITE}/scholarships.html\n\n#UniPilotGlobal #Scholarships #StudyAbroad`
  },
  board: {
    name: 'Departures board', use: 'Several deadlines', cta: 'All deadlines in one place',
    fields: [['title', 'Heading'], ['sub', 'Small line under it'], ['rows', 'One line each: date | scholarship | country', 'area'], ['cta', 'Button text']],
    sample: { title: 'Closing soon', sub: 'Scholarship deadlines to watch this month', rows: '15 Nov | Mastercard Foundation Scholars | Canada\n20 Nov | Stipendium Hungaricum | Hungary\n25 Nov | Chevening Scholarships | United Kingdom\n30 Nov | MEXT Research Scholarship | Japan\n05 Dec | Erasmus Mundus Joint Masters | Europe', cta: 'All deadlines in one place' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M; let y = T;
      y = put(c, fitBox(c, d.title, 700, F.d, w, 150 * k, 82 * k + 6, 40), 700, F.d, M, y, P.ink) + 6;
      if (d.sub) y = put(c, fitBox(c, d.sub, 500, F.s, w, 40, 28, 20), 500, F.s, M, y, P.sub) + 10;
      y += 18 * k; const rows = lines(d.rows).slice(0, g.H < 1200 ? 5 : 6).map(r => r.split('|').map(s => s.trim())), bh = B - y - 26;
      shadowCard(c, M, y, w, bh, 28, '#0B1120'); rr(c, M, y, w, bh, 28); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; c.stroke();
      const px = M + 30, pw = w - 60, dw = 178, kw = 150; label(c, 'Closes', px + 6, y + 24, 18, '#8FA0BF'); label(c, 'Scholarship', px + dw + 22, y + 24, 18, '#8FA0BF'); label(c, 'To', px + pw - 6, y + 24, 18, '#8FA0BF', 'right');
      const top = y + 58, rh = Math.min(170, (bh - 58 - 24) / Math.max(rows.length, 1)), ch = rh - 14;
      rows.forEach((r, i) => {
        const ry = top + i * rh; const cell = (cx, cw) => { rr(c, cx, ry, cw, ch, 12); c.fillStyle = '#18233B'; c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(cx, ry + ch / 2 - 1, cw, 2); };
        cell(px, dw); cell(px + dw + 12, pw - dw - kw - 24); cell(px + pw - kw, kw);
        put(c, fitBox(c, (r[0] || '').toUpperCase(), 500, F.m, dw - 24, ch, 36, 20, 1.1), 500, F.m, px + dw / 2, ry + ch / 2 - 19, '#FFD25E', 'center');
        const nb = fitBox(c, r[1] || '', 600, F.s, pw - dw - kw - 60, ch - 16, 34, 19, 1.18); put(c, nb, 600, F.s, px + dw + 30, ry + (ch - nb.h) / 2 + 2, '#F5F7FB');
        const kb = fitBox(c, code(r[2]), 500, F.m, kw - 20, ch, 34, 20, 1.1); put(c, kb, 500, F.m, px + pw - kw / 2, ry + ch / 2 - kb.size / 2 - 1, '#FFD25E', 'center');
      });
    },
    cap: d => `🛫 ${d.title}\n\n${lines(d.rows).map(r => { const a = r.split('|').map(s => s.trim()); return `⏰ ${a[0]}: ${a[1]}${a[2] ? ' (' + a[2] + ')' : ''}`; }).join('\n')}\n\nAlways check the official page before you apply. Details and links:\n👉 https://${SITE}/scholarships.html\n\n#UniPilotGlobal #ScholarshipDeadlines #StudyAbroad`
  },
  plan: {
    name: 'Flight plan', use: 'Steps or a checklist', cta: 'Free guides and templates',
    fields: [['kicker', 'Small label'], ['title', 'Heading'], ['steps', 'One step per line (up to 6)', 'area'], ['cta', 'Button text']],
    sample: { kicker: 'Flight plan', title: 'Apply for a scholarship in 5 steps', steps: 'Shortlist 5 to 8 programmes\nCheck eligibility on the official page\nCollect your documents early\nWrite and polish your SOP\nSubmit before the deadline', cta: 'Free guides and templates' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M; label(c, d.kicker || 'Flight plan', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      let y = put(c, fitBox(c, d.title, 700, F.d, w, 190 * k, 74 * k + 6, 38), 700, F.d, M, T + 44, P.ink) + 34 * k;
      const st = lines(d.steps).slice(0, 6), n = Math.max(st.length, 1), gap = (B - y - 30) / n, rx = M + 40, r = Math.min(34, gap * .3);
      c.strokeStyle = P.accent; c.lineWidth = 5; c.lineCap = 'round'; c.setLineDash([2, 15]); c.beginPath(); c.moveTo(rx, y + gap / 2); c.lineTo(rx, y + gap * (n - .5)); c.stroke(); c.setLineDash([]); c.lineCap = 'butt';
      st.forEach((s, i) => {
        const cy = y + gap * (i + .5), last = i === n - 1;
        if (last && n > 1) { c.beginPath(); c.arc(rx, cy, r + 10, 0, 7); c.strokeStyle = P.accent; c.lineWidth = 3; c.stroke(); }
        c.beginPath(); c.arc(rx, cy, r, 0, 7); c.fillStyle = P.accent; c.fill();
        if (last && n > 1) plane(c, rx, cy, r * .62, 0, P.accentInk); else { setF(c, 500, r * .95, F.m); c.fillStyle = P.accentInk; c.textAlign = 'center'; c.fillText(String(i + 1), rx, cy - r * .5); c.textAlign = 'left'; }
        const fb = fitBox(c, s, 600, F.s, w - 130, gap - 18, 40, 22, 1.2); put(c, fb, 600, F.s, M + 116, cy - fb.h / 2 + 2, P.ink);
      });
    },
    cap: d => `🧭 ${d.title}\n\n${lines(d.steps).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nFree guides and templates are on our site.\n👉 https://${SITE}/materials.html\n\n#UniPilotGlobal #ScholarshipTips #StudyAbroad`
  },
  crew: {
    name: 'Crew ID', use: 'Introduce a pilot', cta: 'Book a session', photo: true,
    fields: [['name', 'Pilot name'], ['headline', 'One line about them'], ['studied', 'Studied in'], ['helps', 'Helps with (separate with commas)'], ['cta', 'Button text']],
    sample: { name: 'Pilot name', headline: 'PhD researcher and scholarship winner', studied: 'Germany · Poland · Italy', helps: 'SOP review, CV review, Scholarship shortlist, Interview practice', cta: 'Book a session' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g; label(c, 'Meet your pilot', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      const w = W - 2 * M - 110, x = (W - w) / 2, y = T + 96 * k, h = B - y - 26;
      c.fillStyle = P.accent; c.beginPath(); c.moveTo(W / 2 - 150, T - 44); c.lineTo(W / 2 - 96, T - 44); c.lineTo(W / 2 + 24, y + 34); c.lineTo(W / 2 - 24, y + 34); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(W / 2 + 150, T - 44); c.lineTo(W / 2 + 96, T - 44); c.lineTo(W / 2 - 24, y + 34); c.lineTo(W / 2 + 24, y + 34); c.closePath(); c.globalAlpha = .8; c.fill(); c.globalAlpha = 1;
      shadowCard(c, x, y, w, h, 36, P.card); rr(c, W / 2 - 60, y + 22, 120, 22, 11); c.fillStyle = P.bg; c.fill();
      const ph = Math.min(300 * k, h * .34), px = W / 2 - ph / 2, py = y + 72 * k;
      c.save(); rr(c, px, py, ph, ph, 30); c.clip();
      if (g.photo) { const s = Math.max(ph / g.photo.width, ph / g.photo.height), iw = g.photo.width * s, ih = g.photo.height * s; c.drawImage(g.photo, px + (ph - iw) / 2, py + (ph - ih) / 2, iw, ih); }
      else { c.fillStyle = P.cardAccent; c.fillRect(px, py, ph, ph); setF(c, 700, ph * .5, F.d); c.fillStyle = P.card; c.textAlign = 'center'; c.fillText((String(d.name || 'P').trim()[0] || 'P').toUpperCase(), W / 2, py + ph * .22); c.textAlign = 'left'; }
      c.restore();
      let cy = py + ph + 30 * k; const iw = w - 96;
      cy = put(c, fitBox(c, d.name, 700, F.d, iw, 130 * k, 58 * k + 6, 30, 1.1), 700, F.d, W / 2, cy, P.cardInk, 'center') + 8;
      if (d.headline) cy = put(c, fitBox(c, d.headline, 500, F.s, iw, 84, 30, 19, 1.25), 500, F.s, W / 2, cy, P.cardSub, 'center') + 20 * k;
      if (d.studied) { label(c, 'Studied in', W / 2, cy, 18, P.cardAccent, 'center'); cy = put(c, fitBox(c, d.studied, 700, F.s, iw, 44, 31, 18), 700, F.s, W / 2, cy + 30, P.cardInk, 'center') + 20 * k; }
      const chips = String(d.helps || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 6), foot = y + h - 92 * k;
      if (chips.length && cy + 80 < foot) {
        label(c, 'Can help you with', W / 2, cy, 18, P.cardAccent, 'center'); cy += 34; const cs = g.H < 1200 ? 22 : 26, chh = cs + 24; setF(c, 600, cs, F.s);
        const rows = [[]]; let rw = 0; chips.forEach(t => { const cw = c.measureText(t).width + 40; if (rw + cw > iw && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push([t, cw]); rw += cw + 10; });
        rows.forEach(row => { if (cy + chh > foot) return; let cx = W / 2 - (row.reduce((a, b) => a + b[1] + 10, -10)) / 2; row.forEach(([t, cw]) => { rr(c, cx, cy, cw, chh, chh / 2); c.strokeStyle = P.cardSub; c.lineWidth = 2; c.stroke(); setF(c, 600, cs, F.s); c.fillStyle = P.cardInk; c.fillText(t, cx + 20, cy + 11); cx += cw + 10; }); cy += chh + 10; });
      }
      c.fillStyle = P.cardSub; c.globalAlpha = .3; c.fillRect(x + 48, foot, w - 96, 2); c.globalAlpha = 1;
      label(c, 'UniPilot crew', x + 48, foot + 30 * k, 18, P.cardSub); barcode(c, x + w - 48 - 230, foot + 20 * k, 230, 44 * k, d.name, P.cardInk);
    },
    cap: d => `✈️ Meet your pilot: ${d.name}\n\n${d.headline || ''}${d.studied ? '\n🌍 Studied in: ' + d.studied : ''}${d.helps ? '\n🤝 Can help with: ' + d.helps : ''}\n\nPilots are real mentors who walked this path themselves. Read the profile and book a session.\n👉 https://${SITE}/pilots.html\n\n#UniPilotGlobal #StudyAbroad #Mentor`
  },
  tip: {
    name: "Captain's tip", use: 'One tip or a quote', cta: 'More free tips',
    fields: [['kicker', 'Small label'], ['text', 'The tip', 'area'], ['sub', 'Small line under it'], ['cta', 'Button text']],
    sample: { kicker: "Captain's tip", text: 'Start your SOP five months before the deadline.', sub: 'Time for feedback turns a draft into a winning story. Ask two people to read it.', cta: 'More free tips' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M;
      /* an altimeter dial, half off the page */
      const ax = W - 120, ay = B - 130 * k, ar = 330 * k; c.save(); c.translate(ax, ay); c.strokeStyle = P.line; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, ar, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, ar * .72, 0, 7); c.stroke();
      for (let i = 0; i < 60; i++) { c.rotate(Math.PI / 30); c.beginPath(); c.moveTo(0, -ar); c.lineTo(0, -ar + (i % 5 === 4 ? 34 : 16)); c.stroke(); } c.rotate(-.9); c.strokeStyle = P.accent; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -ar * .62); c.stroke(); c.lineCap = 'butt'; c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fillStyle = P.accent; c.fill(); c.restore();
      label(c, d.kicker || "Captain's tip", M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      const sb = d.sub ? fitBox(c, d.sub, 500, F.s, w - 60, 150 * k, 31, 21, 1.32) : null, avail = B - T - 80 - (sb ? sb.h + 50 : 0) - 30;
      const tb = fitBox(c, d.text, 700, F.d, w, avail, 104 * k + 8, 40, 1.1); let y = T + 70 + Math.max(0, (avail - tb.h) * .28);
      y = put(c, tb, 700, F.d, M, y, P.ink) + 34 * k;
      if (sb) { c.fillStyle = P.accent; c.fillRect(M, y, 96, 6); put(c, sb, 500, F.s, M, y + 30, P.sub); }
    },
    cap: d => `💡 ${d.text}\n\n${d.sub || ''}\n\nMore free tips and guides:\n👉 https://${SITE}/materials.html\n\n#UniPilotGlobal #ScholarshipTips #StudyAbroad`
  },
  myth: {
    name: 'Myth or fact', use: 'Correct a wrong belief', cta: 'More free tips',
    fields: [['title', 'The question'], ['myth', 'The myth', 'area'], ['fact', 'The fact', 'area'], ['cta', 'Button text']],
    sample: { title: 'Do you need a perfect GPA?', myth: 'Only students with the highest grades win scholarships.', fact: 'Panels also weigh motivation, leadership and a clear plan. A strong story can balance an average GPA.', cta: 'More free tips' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M; label(c, 'Myth or fact', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      let y = put(c, fitBox(c, d.title, 700, F.d, w, 170 * k, 72 * k + 6, 36), 700, F.d, M, T + 44, P.ink) + 30 * k;
      const ph = (B - y - 26 - 24) / 2, panel = (py, isFact) => {
        if (isFact) shadowCard(c, M, py, w, ph, 30, P.card); else { rr(c, M, py, w, ph, 30); c.fillStyle = P.soft; c.fill(); c.strokeStyle = P.line; c.lineWidth = 2; c.setLineDash([12, 10]); c.stroke(); c.setLineDash([]); }
        const col = isFact ? '#1E8E5A' : '#D6453D', tw = label(c, isFact ? 'Clear sky · fact' : 'Turbulence · myth', -9999, -9999, 17, col), pw = tw + 40;
        rr(c, M + 36, py + 30, pw, 42, 21); c.fillStyle = col; c.fill(); label(c, isFact ? 'Clear sky · fact' : 'Turbulence · myth', M + 56, py + 43, 17, '#FFFFFF');
        const fb = fitBox(c, isFact ? d.fact : d.myth, isFact ? 600 : 500, F.s, w - 72, ph - 110, 46, 22, 1.28); put(c, fb, isFact ? 600 : 500, F.s, M + 36, py + 92, isFact ? P.cardInk : P.ink);
        if (!isFact) { c.strokeStyle = col; c.lineWidth = 3; c.globalAlpha = .7; fb.lines.forEach((l, i) => { setF(c, 500, fb.size, F.s); c.beginPath(); c.moveTo(M + 36, py + 92 + i * fb.lh + fb.size * .56); c.lineTo(M + 36 + c.measureText(l).width, py + 92 + i * fb.lh + fb.size * .56); c.stroke(); }); c.globalAlpha = 1; }
      };
      panel(y, false); panel(y + ph + 24, true);
    },
    cap: d => `❓ ${d.title}\n\n❌ Myth: ${d.myth}\n\n✅ Fact: ${d.fact}\n\nMore honest answers on our site.\n👉 https://${SITE}\n\n#UniPilotGlobal #MythOrFact #Scholarships`
  },
  call: {
    name: 'Boarding call', use: 'News or a seminar', cta: 'Reserve your free seat',
    fields: [['kicker', 'Small label'], ['title', 'Big headline', 'area'], ['body', 'Short text', 'area'], ['when', 'When (leave empty for news)'], ['where', 'Where'], ['seal', 'Round stamp (short, or leave empty)'], ['cta', 'Button text']],
    sample: { kicker: 'Free live seminar', title: 'Higher study abroad: where to start', body: 'An honest walk through scholarships, documents and timelines, with live questions.', when: '21 November 2026 · 7:00 PM (BD time)', where: 'Live online', seal: 'Free', cta: 'Reserve your free seat' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M; label(c, d.kicker || 'Announcement', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      const info = [['When', d.when], ['Where', d.where]].filter(a => a[1]), ih = info.length ? 150 * k + 10 : 0;
      const bb = d.body ? fitBox(c, d.body, 500, F.s, w - 40, 190 * k, 33, 21, 1.34) : null, avail = B - T - 60 - ih - (bb ? bb.h + 40 : 0) - 50;
      const tb = fitBox(c, d.title, 700, F.d, w - (d.seal ? 40 : 0), avail, 112 * k + 8, 40, 1.07); let y = put(c, tb, 700, F.d, M, T + 56, P.ink) + 30 * k;
      if (bb) y = put(c, bb, 500, F.s, M, y, P.sub);
      if (info.length) { const iy = B - ih - 26; shadowCard(c, M, iy, w, ih, 28, P.card); const cw = (w - 72) / info.length; info.forEach(([l, v], i) => { const cx = M + 36 + i * cw; if (i) { c.strokeStyle = P.cardSub; c.globalAlpha = .5; c.lineWidth = 3; c.setLineDash([8, 10]); c.beginPath(); c.moveTo(cx - 14, iy + 22); c.lineTo(cx - 14, iy + ih - 22); c.stroke(); c.setLineDash([]); c.globalAlpha = 1; } label(c, l, cx, iy + 28 * k + 2, 19, P.cardAccent); put(c, fitBox(c, v, 700, F.s, cw - 36, ih - 74 * k - 8, 31, 19, 1.2), 700, F.s, cx, iy + 60 * k + 4, P.cardInk); }); }
      if (d.seal) { const r = 92 * k + 8, sx = W - M - r - 6, sy = (info.length ? B - ih - 26 : B - 30) - r - 26; c.save(); c.translate(sx, sy); c.rotate(-.21); c.strokeStyle = P.accent; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r - 12, 0, 7); c.stroke(); const sb = fitBox(c, String(d.seal).toUpperCase(), 700, F.d, r * 1.5, r, 46, 18, 1.05); put(c, sb, 700, F.d, 0, -sb.h / 2, P.accent, 'center'); c.restore(); }
    },
    cap: d => `📣 ${String(d.title).replace(/\n/g, ' ')}\n\n${d.body || ''}${d.when ? '\n\n🗓 ' + d.when : ''}${d.where ? '\n📍 ' + d.where : ''}\n\n👉 https://${SITE}${d.when ? '/materials.html#seminars' : ''}\n\n#UniPilotGlobal #StudyAbroad #Scholarships`
  },
  kit: {
    name: 'Carry-on kit', use: 'A free material', cta: 'Get it free',
    fields: [['kicker', 'Small label'], ['title', 'Material name'], ['sub', 'One line about it'], ['points', 'What is inside, one per line (up to 5)', 'area'], ['note', 'Small note at the bottom'], ['cta', 'Button text']],
    sample: { kicker: 'Free download', title: 'SOP template for scholarships', sub: 'A simple structure with sample paragraphs.', points: 'An opening that grabs attention\nYour story in three parts\nA closing with a clear goal', note: 'Free account needed to open', cta: 'Get it free' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M; label(c, d.kicker || 'Free download', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      /* the sheet of paper, tilted, top right */
      const sw = 230 * k + 20, sh = sw * 1.3, sx = W - M - sw - 6, sy = T + 26; c.save(); c.translate(sx + sw / 2, sy + sh / 2); c.rotate(.11); c.shadowColor = 'rgba(4,12,28,.35)'; c.shadowBlur = 40; c.shadowOffsetY = 18;
      c.beginPath(); c.moveTo(-sw / 2, -sh / 2); c.lineTo(sw / 2 - 46, -sh / 2); c.lineTo(sw / 2, -sh / 2 + 46); c.lineTo(sw / 2, sh / 2); c.lineTo(-sw / 2, sh / 2); c.closePath(); c.fillStyle = '#FFFDF7'; c.fill(); c.shadowColor = 'transparent';
      c.beginPath(); c.moveTo(sw / 2 - 46, -sh / 2); c.lineTo(sw / 2 - 46, -sh / 2 + 46); c.lineTo(sw / 2, -sh / 2 + 46); c.closePath(); c.fillStyle = '#E3D9C2'; c.fill();
      c.fillStyle = '#0A1A33'; c.fillRect(-sw / 2 + 26, -sh / 2 + 38, sw * .45, 12); c.fillStyle = '#C9CFDA'; for (let i = 0; i < 7; i++) c.fillRect(-sw / 2 + 26, -sh / 2 + 78 + i * 28 * k, (sw - 52) * (i % 3 === 2 ? .62 : 1), 8);
      check(c, sw / 2 - 40, sh / 2 - 40, 26, '#E3A72F', '#0A1A33'); c.restore();
      const tw = w - sw - 40; let y = put(c, fitBox(c, d.title, 700, F.d, tw, sh - 10, 68 * k + 6, 34, 1.1), 700, F.d, M, T + 50, P.ink) + 14;
      if (d.sub) y = put(c, fitBox(c, d.sub, 500, F.s, tw, 120, 28, 20, 1.3), 500, F.s, M, y, P.sub);
      y = Math.max(y + 34 * k, sy + sh + 34 * k); const pts = lines(d.points).slice(0, 5), nh = d.note ? 60 : 0, gap = Math.min(140, (B - y - 30 - nh) / Math.max(pts.length, 1));
      pts.forEach((p, i) => { const cy = y + gap * (i + .5); check(c, M + 26, cy, Math.min(26, gap * .3), P.accent, P.accentInk); const fb = fitBox(c, p, 600, F.s, w - 90, gap - 14, 44, 22, 1.2); put(c, fb, 600, F.s, M + 76, cy - fb.h / 2 + 2, P.ink); });
      if (d.note) { const ny = B - 62; c.strokeStyle = P.sub; c.lineWidth = 3; c.beginPath(); c.arc(M + 13, ny + 12, 8, Math.PI, 0); c.stroke(); rr(c, M + 1, ny + 12, 24, 19, 4); c.fillStyle = P.sub; c.fill(); setF(c, 500, 27, F.s); c.fillText(d.note, M + 40, ny + 3); }
    },
    cap: d => `📄 ${d.title}\n\n${d.sub || ''}\n\n${lines(d.points).map(p => '✅ ' + p).join('\n')}\n\nFree on our site${d.note ? ' (' + d.note.toLowerCase() + ')' : ''}.\n👉 https://${SITE}/materials.html\n\n#UniPilotGlobal #FreeResources #StudyAbroad`
  }
};

function draw(cv, id, d, o) {
  const W = 1080, H = o.size === 'sq' ? 1080 : 1350; if (cv.width !== W) cv.width = W; if (cv.height !== H) cv.height = H;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.textBaseline = 'top'; c.textAlign = 'left'; c.globalAlpha = 1; c.setLineDash([]);
  const P = THEMES[o.theme] || THEMES.night; frameBg(c, P, W, H); header(c, P, W, o);
  TPL[id].draw(c, P, d, { W, H, T: 196, B: H - 170, k: H / 1350, M: 64, photo: o.photo });
  footer(c, P, W, H, d.cta || TPL[id].cta);
}


/* ---------- more colours ---------- */
Object.assign(THEMES, {
  sky: { bg: '#1F4E8C', bg2: '#4C86D0', ink: '#FFFFFF', sub: '#D6E2F4', accent: '#E3A72F', accentInk: '#0A1A33', card: '#FFFFFF', cardInk: '#0A1A33', cardSub: '#5E6C84', cardAccent: '#B37A0C', line: 'rgba(255,255,255,.16)', soft: 'rgba(255,255,255,.09)' },
  paper: { bg: '#FBF7EE', bg2: '#FFFFFF', ink: '#0A1A33', sub: '#5E6C84', accent: '#1F4E8C', accentInk: '#FFFFFF', card: '#0A1A33', cardInk: '#FFFFFF', cardSub: '#B8C4DA', cardAccent: '#E3A72F', line: 'rgba(10,26,51,.10)', soft: 'rgba(10,26,51,.05)' },
  sunset: { bg: '#0A1A33', bg2: '#C2611A', ink: '#FFFFFF', sub: '#D9CFC4', accent: '#F3C766', accentInk: '#0A1A33', card: '#FFF8EA', cardInk: '#0A1A33', cardSub: '#6B5E4C', cardAccent: '#B3540C', line: 'rgba(255,255,255,.13)', soft: 'rgba(255,255,255,.07)' }
});
const THEME_NAMES = { night: 'Night', day: 'Day', gold: 'Sunrise', sky: 'Sky', paper: 'Paper', sunset: 'Sunset' };
const BG_NAMES = ['Radar', 'Air currents', 'Star route', 'Runway'];

/* ---------- four backgrounds ---------- */
function frameBgV(c, P, W, H, v) {
  if (!v) return frameBg(c, P, W, H);
  c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
  const gx = v === 1 ? W * .1 : v === 2 ? W * .5 : W * .95, gy = v === 3 ? H * .98 : H * .04, g = c.createRadialGradient(gx, gy, 40, gx, gy, H * .9); g.addColorStop(0, P.bg2); g.addColorStop(1, P.bg); c.globalAlpha = .7; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
  c.strokeStyle = P.line; c.fillStyle = P.line; c.lineWidth = 2;
  if (v === 1) { for (let i = 0; i < 16; i++) { c.beginPath(); for (let x = -20; x <= W + 20; x += 20) { const y = H * .08 + i * H * .062 + Math.sin(x / 150 + i * .55) * 34 + Math.sin(x / 61 + i) * 9; x < 0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); } }
  else if (v === 2) { for (let y = 40; y < H; y += 54) for (let x = 40 + (y / 54 % 2) * 27; x < W; x += 54) { c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); } const pts = [[.08, .9], [.3, .7], [.52, .78], [.74, .52], [.94, .3]]; c.lineWidth = 3; c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(W * a, H * b) : c.moveTo(W * a, H * b)); c.stroke(); pts.forEach(([a, b]) => { c.beginPath(); c.arc(W * a, H * b, 9, 0, 7); c.fill(); }); }
  else { c.save(); c.translate(W * .78, H * .5); c.rotate(-.5); c.lineWidth = 3; c.strokeRect(-150, -H, 300, H * 2); c.setLineDash([70, 60]); c.lineWidth = 12; c.beginPath(); c.moveTo(0, -H); c.lineTo(0, H); c.stroke(); c.setLineDash([]); for (let i = -4; i <= 4; i++) { if (i) c.fillRect(i * 30 - 8, H * .32, 16, 110); } c.restore(); }
}

/* ---------- four more designs ---------- */
Object.assign(TPL, {
  tag: {
    name: 'Luggage tag', use: 'A countdown', cta: 'See details and apply',
    fields: [['kicker', 'Small label'], ['big', 'Big number or word'], ['unit', 'Words beside it'], ['title', 'Scholarship or event'], ['sub', 'Line under it'], ['cta', 'Button text']],
    sample: { kicker: 'Last call', big: '7', unit: 'days left to apply', title: 'Stipendium Hungaricum Scholarship', sub: 'Closes 20 November 2026. Check the official page.', cta: 'See details and apply' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g; label(c, d.kicker || 'Last call', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      const w = W - 2 * M - 90, h = B - T - 110, x = (W - w) / 2, y = T + 84, cut = 110 * k;
      c.strokeStyle = P.accent; c.lineWidth = 7; c.beginPath(); c.moveTo(W / 2 + 10, y + 62 * k); c.bezierCurveTo(W / 2 + 190, T - 40, W / 2 + 330, T + 40, W + 20, T - 70); c.stroke();
      c.save(); c.translate(W / 2, y + h / 2); c.rotate(-.035); c.translate(-W / 2, -(y + h / 2)); c.shadowColor = 'rgba(4,12,28,.35)'; c.shadowBlur = 50; c.shadowOffsetY = 22;
      c.beginPath(); c.moveTo(x + cut, y); c.lineTo(x + w - cut, y); c.lineTo(x + w, y + cut); c.lineTo(x + w, y + h - 34); c.quadraticCurveTo(x + w, y + h, x + w - 34, y + h); c.lineTo(x + 34, y + h); c.quadraticCurveTo(x, y + h, x, y + h - 34); c.lineTo(x, y + cut); c.closePath(); c.fillStyle = P.card; c.fill(); c.shadowColor = 'transparent';
      c.beginPath(); c.arc(W / 2, y + 62 * k, 24 * k + 4, 0, 7); c.fillStyle = P.bg; c.fill(); c.lineWidth = 6; c.strokeStyle = P.cardAccent; c.stroke();
      const ix = x + 56, iw = w - 112, big = String(d.big || ''), bs = Math.min(h * .36, 330 * k);
      const bb = fitBox(c, big, 700, F.d, iw * (d.unit ? .62 : 1), bs * 1.1, bs, 60, 1.0); let cy = y + 120 * k; put(c, bb, 700, F.d, ix, cy, P.cardAccent); setF(c, 700, bb.size, F.d); const bw = c.measureText(bb.lines[0] || '').width;
      if (d.unit) { const ub = fitBox(c, d.unit, 700, F.s, iw - bw - 30, bb.size * .8, 46 * k + 6, 22, 1.12); put(c, ub, 700, F.s, ix + bw + 28, cy + bb.size * .56 - ub.h / 2, P.cardInk); }
      cy += bb.size * 1.06 + 10; c.strokeStyle = P.cardSub; c.globalAlpha = .5; c.lineWidth = 3; c.setLineDash([10, 12]); c.beginPath(); c.moveTo(ix, cy); c.lineTo(ix + iw, cy); c.stroke(); c.setLineDash([]); c.globalAlpha = 1; cy += 30 * k;
      const sb = d.sub ? fitBox(c, d.sub, 500, F.s, iw, 110 * k, 29, 19, 1.3) : null, tb = fitBox(c, d.title, 700, F.d, iw, y + h - cy - (sb ? sb.h + 24 : 0) - 44 * k, 60 * k + 4, 28, 1.12);
      cy = put(c, tb, 700, F.d, ix, cy, P.cardInk) + 14; if (sb) put(c, sb, 500, F.s, ix, cy, P.cardSub); c.restore();
    },
    cap: d => `⏳ ${d.big} ${d.unit || ''}\n\n${d.title}\n${d.sub || ''}\n\nRead the details and the official link on our site.\n👉 https://${SITE}/scholarships.html\n\n#UniPilotGlobal #ScholarshipDeadline #StudyAbroad`
  },
  seat: {
    name: 'Window seat', use: 'A quote or a student story', cta: 'Read more stories',
    fields: [['kicker', 'Small label'], ['text', 'The words', 'area'], ['who', 'Who said it'], ['role', 'Their line (for example: Master student, Germany)'], ['cta', 'Button text']],
    sample: { kicker: 'View from the window seat', text: 'A scholarship is rarely won by luck. It is won by preparation.', who: 'UniPilot Global', role: '', cta: 'Start preparing' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M; label(c, d.kicker || 'Window seat', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      const wh = (B - T) * .4, ww = Math.min(w, wh * 1.5), wx = W - M - ww, wy = T + 52; shadowCard(c, wx, wy, ww, wh, wh * .42, P.card);
      c.save(); rr(c, wx + 26, wy + 26, ww - 52, wh - 52, wh * .36); c.clip(); const sg = c.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, '#16386B'); sg.addColorStop(.62, '#4C86D0'); sg.addColorStop(1, '#F3C766'); c.fillStyle = sg; c.fillRect(wx, wy, ww, wh);
      c.fillStyle = '#FFE9B0'; c.beginPath(); c.arc(wx + ww * .7, wy + wh * .8, wh * .13, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; [[.22, .6, .2], [.36, .66, .16], [.56, .5, .13], [.84, .58, .12]].forEach(([a, b, r]) => { c.beginPath(); c.ellipse(wx + ww * a, wy + wh * b, ww * r, wh * .05, 0, 0, 7); c.fill(); });
      c.fillStyle = '#0A1A33'; c.beginPath(); c.moveTo(wx, wy + wh * .98); c.lineTo(wx + ww * .62, wy + wh * .8); c.lineTo(wx + ww * .66, wy + wh * .84); c.lineTo(wx + ww * .3, wy + wh); c.closePath(); c.fill(); c.restore();
      rr(c, wx + 26, wy + 26, ww - 52, wh * .16, wh * .08); c.fillStyle = P.card; c.globalAlpha = .9; c.fill(); c.globalAlpha = 1;
      const y0 = wy + wh + 40 * k, wb = d.who ? 86 : 0, tb = fitBox(c, '“' + String(d.text || '') + '”', 700, F.d, w, B - y0 - wb - 40, 74 * k + 6, 30, 1.14); let y = put(c, tb, 700, F.d, M, y0, P.ink) + 22;
      if (d.who) { c.fillStyle = P.accent; c.fillRect(M, y + 4, 70, 6); setF(c, 700, 29, F.s); c.fillStyle = P.ink; c.fillText(d.who, M + 90, y - 10); if (d.role) { setF(c, 500, 23, F.s); c.fillStyle = P.sub; c.fillText(d.role, M + 90, y + 26); } }
    },
    cap: d => `💬 “${d.text}”${d.who ? '\n— ' + d.who + (d.role ? ', ' + d.role : '') : ''}\n\n👉 https://${SITE}\n\n#UniPilotGlobal #StudyAbroad #Motivation`
  },
  stampd: {
    name: 'Passport stamp', use: 'A country', cta: 'Find scholarships',
    fields: [['kicker', 'Small label'], ['country', 'Country'], ['line', 'One line about it'], ['points', 'Facts, one per line (up to 4)', 'area'], ['cta', 'Button text']],
    sample: { kicker: 'Destination', country: 'Germany', line: 'Scholarships listed on UniPilot for this country', points: 'Bachelor, Master and PhD programmes\nMany courses taught in English\nAlways check the official page', cta: 'Find scholarships' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M, cd = code(d.country); label(c, d.kicker || 'Destination', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      setF(c, 700, 430 * k, F.d); c.strokeStyle = P.line; c.lineWidth = 4; c.textAlign = 'right'; c.strokeText(cd, W - M + 14, T + 40); c.textAlign = 'left';
      let y = put(c, fitBox(c, d.country, 700, F.d, w, 250 * k, 130 * k + 8, 50, 1.02), 700, F.d, M, T + 52, P.ink) + 6;
      if (d.line) y = put(c, fitBox(c, d.line, 500, F.s, w * .78, 120, 30, 20, 1.3), 500, F.s, M, y, P.sub);
      const r = 118 * k + 8, sx = W - M - r - 10, sy = B - r - 44; c.save(); c.translate(sx, sy); c.rotate(-.24); c.strokeStyle = P.accent; c.fillStyle = P.accent; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r - 14, 0, 7); c.stroke();
      label(c, 'UniPilot', 0, -r * .56, 17, P.accent, 'center'); const sb = fitBox(c, cd, 700, F.d, r * 1.4, r * .6, 70 * k + 6, 22, 1); put(c, sb, 700, F.d, 0, -sb.size * .5, P.accent, 'center'); plane(c, 0, r * .5, 20, Math.PI / 2, P.accent); c.restore();
      const pts = lines(d.points).slice(0, 4); y += 40 * k; const gap = Math.min(120, (B - y - 30) / Math.max(pts.length, 1));
      pts.forEach((p, i) => { const cy = y + gap * (i + .5); check(c, M + 26, cy, Math.min(26, gap * .3), P.accent, P.accentInk); const fb = fitBox(c, p, 600, F.s, w - 90 - (cy > sy - r - 20 ? r * 2 + 30 : 0), gap - 14, 40, 22, 1.2); put(c, fb, 600, F.s, M + 76, cy - fb.h / 2 + 2, P.ink); });
    },
    cap: d => `🌍 ${d.country}\n\n${d.line || ''}\n\n${lines(d.points).map(p => '✅ ' + p).join('\n')}\n\n👉 https://${SITE}/scholarships.html\n\n#UniPilotGlobal #StudyAbroad #StudyIn${String(d.country || '').replace(/[^A-Za-z]/g, '')}`
  },
  gates: {
    name: 'Choose your gate', use: 'A question for comments', cta: 'Comment your gate',
    fields: [['kicker', 'Small label'], ['q', 'Question'], ['opts', 'Answers, one per line (up to 4)', 'area'], ['cta', 'Button text']],
    sample: { kicker: 'You decide', q: 'Which part of the application is hardest for you?', opts: 'Writing the SOP\nReference letters\nLanguage test\nFinding scholarships', cta: 'Comment your gate' },
    draw(c, P, d, g) {
      const { W, T, B, k, M } = g, w = W - 2 * M; label(c, d.kicker || 'You decide', M, T, 21, P.ink === '#FFFFFF' ? P.accent : P.ink);
      let y = put(c, fitBox(c, d.q, 700, F.d, w, 230 * k, 70 * k + 6, 34), 700, F.d, M, T + 44, P.ink) + 36 * k;
      const op = lines(d.opts).slice(0, 4), gap = Math.min(170, (B - y - 26) / Math.max(op.length, 1)), rh = gap - 20;
      op.forEach((t, i) => { const ry = y + i * gap; shadowCard(c, M, ry, w, rh, 24, P.card); rr(c, M, ry, rh * 1.15, rh, 24); c.fillStyle = P.cardAccent; c.fill(); c.fillRect(M + rh * .7, ry, rh * .45, rh); label(c, 'Gate', M + rh * .575, ry + rh * .16, 16, P.card, 'center'); setF(c, 700, rh * .5, F.d); c.fillStyle = P.card; c.textAlign = 'center'; c.fillText('ABCD'[i], M + rh * .575, ry + rh * .36); c.textAlign = 'left'; const fb = fitBox(c, t, 700, F.s, w - rh * 1.15 - 60, rh - 20, 40, 22, 1.18); put(c, fb, 700, F.s, M + rh * 1.15 + 30, ry + (rh - fb.h) / 2 + 2, P.cardInk); });
    },
    cap: d => `🛫 ${d.q}\n\n${lines(d.opts).map((t, i) => `Gate ${'ABCD'[i]}: ${t}`).join('\n')}\n\nComment your gate below. We read every answer.\n\n👉 https://${SITE}\n\n#UniPilotGlobal #StudyAbroad #Scholarships`
  }
});

/* ---------- ready-made ideas that are not about one scholarship ---------- */
const LIB = {"tips": [{"title": "Start your SOP five months before the deadline", "subtitle": "Time for feedback turns a draft into a winning story. Ask two people to read it."}, {"title": "Ask your referees early and brief them well", "subtitle": "Give them your CV, your goals and the deadline at least a month ahead."}, {"title": "Read the eligibility twice before you apply", "subtitle": "Many applications fail on a rule that was written clearly on the official page."}, {"title": "One strong story beats a long list", "subtitle": "In your SOP, choose two or three moments and explain what you learned from each."}, {"title": "Check every scholarship on its official page", "subtitle": "Deadlines and rules change every year. Always confirm before you apply."}, {"title": "Prepare your documents before the call opens", "subtitle": "Transcripts, language tests and translations can take weeks to arrange."}, {"title": "Never pay to apply for a scholarship", "subtitle": "Real scholarship providers do not charge application fees. Be careful with fake offers."}, {"title": "Match your CV to the scholarship", "subtitle": "Move the most relevant experience to the top and cut the rest."}, {"title": "Apply to more than one programme", "subtitle": "Shortlist five to eight scholarships and track their deadlines in one list."}, {"title": "Practise your interview answers out loud", "subtitle": "Record yourself. Clear, calm answers are easier to remember than perfect ones."}], "checklists": [{"title": "Documents for a scholarship application", "items": ["Passport copy", "Academic transcripts and certificates", "Language test score or proof", "Two reference letters", "CV and motivation letter", "Official translations if needed"]}, {"title": "Before you press Submit", "items": ["Name and passport details match everywhere", "All files open and are the right version", "SOP checked for spelling by a second person", "Referees confirmed their letters", "Official page checked for the final deadline", "Confirmation email saved"]}, {"title": "What to put in a strong CV", "items": ["Education with grades or rank", "Research, projects or internships", "Awards and scholarships", "Volunteering and leadership", "Skills and languages", "One clean page or two"]}, {"title": "Preparing for a visa interview", "items": ["Admission or scholarship letter", "Proof of funds", "Accommodation plan", "Study plan in two sentences", "Original documents in order", "Calm, honest answers"]}, {"title": "Questions to ask a pilot", "items": ["How did you choose your programme?", "What did your SOP focus on?", "What would you change in your application?", "How was the interview?", "What did you not expect abroad?", "What should I do this month?"]}], "mythfacts": [{"title": "Do you need a perfect GPA?", "myth": "Only students with the highest grades win scholarships.", "fact": "Panels also weigh motivation, leadership and a clear plan. A strong story can balance an average GPA."}, {"title": "Is IELTS always required?", "myth": "Every scholarship needs an IELTS score.", "fact": "Many programmes accept other proofs of English, such as a medium-of-instruction letter. Always check each programme's rules."}, {"title": "Can an agent guarantee a scholarship?", "myth": "If you pay a consultant, a scholarship is guaranteed.", "fact": "Nobody can guarantee a scholarship. The decision belongs to the scholarship provider."}, {"title": "Does fully funded mean everything is paid?", "myth": "Fully funded always covers every single cost.", "fact": "Coverage differs. Check tuition, living allowance, travel and insurance in the official call."}, {"title": "Is the last day a safe day to apply?", "myth": "Submitting on deadline day is fine.", "fact": "Portals slow down and small mistakes cannot be fixed. Aim to submit at least a week early."}, {"title": "Are scholarships only for science students?", "myth": "Scholarships are only for engineering and science.", "fact": "There are programmes in social sciences, business, arts, education and more."}], "polls": [{"question": "Which part of the application is hardest for you?", "options": ["Writing the SOP", "Reference letters", "Language test", "Finding scholarships"]}, {"question": "Which level are you applying for?", "options": ["Bachelor", "Master", "PhD", "Internship"]}, {"question": "How early do you start preparing?", "options": ["12 months before", "6 months before", "3 months before", "Last minute"]}, {"question": "Which continent do you dream of studying in?", "options": ["Europe", "Asia", "North America", "Oceania"]}, {"question": "What would help you most this week?", "options": ["SOP feedback", "CV review", "Scholarship shortlist", "Visa guidance"]}, {"question": "What matters most when you choose a country?", "options": ["Funding", "Language", "Career chances", "Safety and life"]}], "faqs": [{"question": "Can I apply to more than one scholarship?", "answer": "Yes. Shortlist several programmes and track every deadline in one list. Just make sure each application is tailored."}, {"question": "What is an SOP?", "answer": "A Statement of Purpose explains who you are, what you want to study and why. It connects your past, your plan and the programme."}, {"question": "When should I start my application?", "answer": "Many students start six to twelve months before the deadline. Documents and reference letters take longer than expected."}, {"question": "Do I need work experience for a Master's scholarship?", "answer": "It depends on the programme. Some require it and many do not. Read the eligibility section on the official page."}, {"question": "Can I win with an average GPA?", "answer": "It is possible. Strong motivation, relevant experience and a clear plan can balance grades, but each programme sets its own rules."}, {"question": "Who should write my reference letters?", "answer": "Choose people who know your work well, such as a professor or a supervisor. Ask early and give them your CV and goals."}], "steps": [{"title": "Apply for a scholarship in 5 steps", "items": ["Shortlist 5 to 8 programmes", "Check eligibility on the official page", "Prepare documents early", "Write and polish your SOP", "Submit before the deadline"]}, {"title": "Write your SOP in 5 steps", "items": ["Read what the programme values", "List your key moments", "Write a clear opening", "Link your past to your plan", "Edit, then ask for feedback"]}, {"title": "Prepare for an interview in 4 steps", "items": ["Re-read your application", "Practise common questions aloud", "Prepare two questions to ask", "Test your internet and camera"]}, {"title": "Plan your study abroad year in 5 steps", "items": ["Choose your field and level", "Shortlist countries and programmes", "Build a deadline calendar", "Prepare tests and documents", "Apply, then plan your visa"]}], "quotes": [{"title": "A scholarship is rarely won by luck. It is won by preparation."}, {"title": "Your story is your strongest document. Tell it clearly."}, {"title": "Every funded student once sent an application that felt impossible."}, {"title": "Small steps every week beat one big rush on the last day."}, {"title": "Ask for feedback early. It is the cheapest way to get better."}, {"title": "The right programme for you may not be the most famous one."}, {"title": "Rejection is information. Improve, then apply again."}, {"title": "Dream big, then plan in small, honest steps."}]};

function drawAll(cv, id, d, o) {
  const W = 1080, H = o.size === 'sq' ? 1080 : 1350; if (cv.width !== W) cv.width = W; if (cv.height !== H) cv.height = H;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.textBaseline = 'top'; c.textAlign = 'left'; c.globalAlpha = 1; c.setLineDash([]); c.shadowColor = 'transparent';
  const P = THEMES[o.theme] || THEMES.night; frameBgV(c, P, W, H, o.bgv | 0); header(c, P, W, o);
  TPL[id].draw(c, P, d, { W, H, T: 196, B: H - 170, k: H / 1350, M: 64, photo: o.photo });
  footer(c, P, W, H, d.cta || TPL[id].cta);
}

/* ---------- today's ideas, from the live website data ---------- */
const DAY = 864e5, today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const fmtD = iso => { try { return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return iso; } };
const shortD = iso => { try { return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); } catch (e) { return iso; } };
const daysTo = iso => Math.round((new Date(iso + 'T00:00:00') - today0()) / DAY);
const clip = (t, n) => { t = String(t || '').split('(')[0].trim(); return t.length > n ? t.slice(0, n - 1).trim() + '…' : t; };
function passData(o, extra) { return Object.assign({ name: o.name, sponsor: clip(String(o.sponsor).split(':')[0], 70), from: 'YOU', to: o.countries[0] || o.region || '', level: o.levels.join(', '), funding: o.funding === 'full' ? 'Fully funded' : o.funding === 'stipend' ? 'Stipend' : 'Partly funded', field: clip(o.subjects.slice(0, 2).join(', '), 34), deadline: o.dl ? fmtD(o.dl) : clip(o.deadline, 60) || 'See the official page', cta: 'See details and apply' }, extra || {}); }
function ideas(D, seedExtra) {
  const out = [], now = today0(), doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / DAY) + (seedExtra | 0), pick = (a, off) => a.length ? a[(doy + (off | 0)) % a.length] : null;
  const open = D.opps.filter(o => !o.closed).map(o => Object.assign({}, o, { dl: oneDate(o) })), dated = open.filter(o => o.dl && daysTo(o.dl) >= 0).sort((a, b) => a.dl.localeCompare(b.dl));
  dated.filter(o => daysTo(o.dl) <= 21).slice(0, 3).forEach((o, i) => { const n = daysTo(o.dl); out.push(i % 2 === 0 ? { tpl: 'tag', why: n === 0 ? 'Closes today' : 'Closes in ' + n + (n === 1 ? ' day' : ' days'), d: { kicker: 'Last call', big: n === 0 ? 'Today' : String(n), unit: n === 0 ? 'is the last day' : (n === 1 ? 'day' : 'days') + ' left to apply', title: o.name, sub: 'Closes ' + fmtD(o.dl) + '. Check the official page.', cta: 'See details and apply' } } : { tpl: 'boarding', why: 'Closes in ' + n + (n === 1 ? ' day' : ' days'), d: passData(o) }); });
  const soon = dated.filter(o => daysTo(o.dl) <= 45).slice(0, 6); if (soon.length >= 3) out.push({ tpl: 'board', why: soon.length + ' deadlines in the next 45 days', d: { title: 'Closing soon', sub: 'Scholarship deadlines to watch', rows: soon.map(o => `${shortD(o.dl)} | ${clip(o.name, 46)} | ${o.countries[0] || o.region || ''}`).join('\n'), cta: 'All deadlines in one place' } });
  const fresh = open.filter(o => o.added && /^\d{4}-\d{2}-\d{2}/.test(nd10(o.added)) && (now - new Date(nd10(o.added) + 'T00:00:00')) / DAY <= 14); const nw = pick(fresh.length ? fresh : open.filter(o => o.featured), 0) || pick(open, 3);
  if (nw) out.push({ tpl: 'boarding', why: fresh.includes(nw) ? 'New on the website' : 'Scholarship spotlight', d: passData(nw) });
  const sem = D.seminars.filter(s => s.up).sort((a, b) => a.date.localeCompare(b.date))[0]; if (sem) out.push({ tpl: 'call', why: 'Your next seminar', d: { kicker: 'Free live seminar', title: sem.title, body: sem.topic && sem.topic !== sem.title ? sem.topic : 'Join live and bring your questions.', when: (sem.date ? fmtD(sem.date) : '') + (sem.time ? ' · ' + sem.time : ''), where: 'Live online', seal: 'Free', cta: 'Reserve your free seat' } });
  const pl = pick(D.experts.filter(e => e.name), 0); if (pl) out.push({ tpl: 'crew', why: 'Pilot of the day', photoUrl: pl.photo, d: { name: pl.name, headline: pl.role || pl.tagline || '', studied: (pl.studied || []).slice(0, 3).join(' · '), helps: (pl.helps || []).slice(0, 4).join(', '), cta: pl.free ? 'Book a free session' : 'Book a session' } });
  const mt = pick(D.materials, 0); if (mt) out.push({ tpl: 'kit', why: 'A free material', d: { kicker: 'Free ' + String(mt.type || 'download').toLowerCase(), title: mt.title, sub: clip(mt.text, 120), points: '', note: mt.access === 'email' ? 'Free account needed to open' : '', cta: 'Get it free' } });
  const cc = {}; open.forEach(o => o.countries.forEach(n => { cc[n] = (cc[n] || 0) + 1; })); const top = Object.keys(cc).filter(n => cc[n] >= 3).sort((a, b) => cc[b] - cc[a]).slice(0, 12), cn = pick(top, 0);
  if (cn) { const lv = Array.from(new Set(open.filter(o => o.countries.includes(cn)).flatMap(o => o.levels))), full = open.filter(o => o.countries.includes(cn) && o.funding === 'full').length; out.push({ tpl: 'stampd', why: 'Country of the day', d: { kicker: 'Destination', country: cn, line: cc[cn] + ' opportunities listed on UniPilot for ' + cn, points: [lv.length ? 'Levels: ' + lv.join(', ') : '', full ? full + ' of them are fully funded' : '', 'Always check the official page'].filter(Boolean).join('\n'), cta: 'Find scholarships' } }); }
  const wd = now.getDay(), learn = [
    () => { const x = pick(LIB.checklists, 0); return { tpl: 'plan', why: 'Sunday checklist', d: { kicker: 'Pre-flight checklist', title: x.title, steps: x.items.join('\n'), cta: 'Free guides and templates' } }; },
    () => { const x = pick(LIB.steps, 0); return { tpl: 'plan', why: 'Monday steps', d: { kicker: 'Flight plan', title: x.title, steps: x.items.join('\n'), cta: 'Free guides and templates' } }; },
    () => { const x = pick(LIB.tips, 0); return { tpl: 'tip', why: 'Tuesday tip', d: { kicker: "Captain's tip", text: x.title, sub: x.subtitle, cta: 'More free tips' } }; },
    () => { const x = pick(LIB.checklists, 2); return { tpl: 'plan', why: 'Wednesday checklist', d: { kicker: 'Pre-flight checklist', title: x.title, steps: x.items.join('\n'), cta: 'Free guides and templates' } }; },
    () => { const x = pick(LIB.mythfacts, 0); return { tpl: 'myth', why: 'Thursday myth or fact', d: { title: x.title, myth: x.myth, fact: x.fact, cta: 'More free tips' } }; },
    () => { const x = pick(LIB.faqs, 0); return { tpl: 'tip', why: 'Friday question', d: { kicker: 'Passengers ask', text: x.question, sub: x.answer, cta: 'Ask a pilot' } }; },
    () => { const x = pick(LIB.tips, 5); return { tpl: 'tip', why: 'Saturday tip', d: { kicker: "Captain's tip", text: x.title, sub: x.subtitle, cta: 'More free tips' } }; }
  ]; out.push(learn[wd]());
  const pq = pick(LIB.polls, 0); out.push({ tpl: 'gates', why: 'A question to get comments', d: { kicker: 'You decide', q: pq.question, opts: pq.options.join('\n'), cta: 'Comment your gate' } });
  const qt = pick(LIB.quotes, 0); out.push({ tpl: 'seat', why: 'A thought for the day', d: { kicker: 'View from the window seat', text: qt.title, who: 'UniPilot Global', role: '', cta: 'Start preparing' } });
  out.push({ tpl: 'call', why: 'Who we are', d: { kicker: 'Good to know', title: 'We are not an agency.', body: 'We do not sell admissions, visas or guaranteed scholarships. We share honest information and connect you with real mentors. You decide.', when: '', where: '', seal: 'You decide', cta: 'See how it works' } });
  /* a different colour, background and shape for each idea, changing every day */
  const th = Object.keys(THEMES); out.forEach((it, i) => { const h = hash(doy + ':' + i + ':' + it.tpl); it.theme = th[(h + i) % th.length]; it.bgv = (h >>> 5) % 4; });
  return out;
}
const nd10 = v => String(v || '').trim().slice(0, 10);
/* A deadline we can count down to: the sheet's date column if it has one, otherwise the Deadline text, but only when it names exactly one clear date. */
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function oneDate(o) {
  if (o.dl) return o.dl; const t = String(o.deadline || ''); if (!t || /varies|rolling|–|—| to | - |\/|or /i.test(t)) return '';
  const hits = []; let m; const a = /\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})[a-z]*\.?,?\s+(20\d\d)\b/g, b = /\b([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d\d)\b/g, c = /\b(20\d\d)-(\d{2})-(\d{2})\b/g;
  while ((m = a.exec(t))) if (MON[m[2].toLowerCase()]) hits.push([+m[3], MON[m[2].toLowerCase()], +m[1]]);
  while ((m = b.exec(t))) if (MON[m[1].toLowerCase()]) hits.push([+m[3], MON[m[1].toLowerCase()], +m[2]]);
  while ((m = c.exec(t))) hits.push([+m[1], +m[2], +m[3]]);
  if (hits.length !== 1) return ''; const [y, mo, d] = hits[0]; if (d < 1 || d > 31) return ''; return y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

/* ---------- the page ---------- */
function start(U) {
  const D = U.D, $ = s => document.querySelector(s), cv = $('#ps-cv'), form = $('#ps-form');
  const st = { tpl: 'boarding', size: 'pt', theme: 'night', bgv: 0, stamp: true }, data = {}; Object.keys(TPL).forEach(k => data[k] = Object.assign({}, TPL[k].sample));
  let photo = null, capTouched = false, list = [], shuffle = 0; const photos = {};
  const say = (t, bad) => { const m = $('#ps-msg'); m.textContent = t; m.style.color = bad ? '#D6453D' : ''; };
  const render = () => { drawAll(cv, st.tpl, data[st.tpl], { size: st.size, theme: st.theme, bgv: st.bgv, stamp: st.stamp, photo }); if (!capTouched) $('#ps-cap').value = TPL[st.tpl].cap(data[st.tpl]).replace(/\n{3,}/g, '\n\n').trim(); };
  const press = (sel, v) => document.querySelectorAll(sel + ' button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v))));
  function buildForm() { const t = TPL[st.tpl], d = data[st.tpl]; form.innerHTML = t.fields.map(([k, l, type]) => `<label class="ps-f" for="psf_${k}">${l}${type === 'area' ? `<textarea id="psf_${k}" data-k="${k}"></textarea>` : `<input type="text" id="psf_${k}" data-k="${k}">`}</label>`).join(''); t.fields.forEach(([k]) => { form.querySelector('#psf_' + k).value = d[k] || ''; }); $('#ps-pbox').hidden = !t.photo; }
  function thumbs(sel, items) { const off = document.createElement('canvas'); document.querySelectorAll(sel + ' canvas').forEach((t, i) => { const it = items[i]; drawAll(off, it.tpl, it.d, { size: 'pt', theme: it.theme, bgv: it.bgv, stamp: st.stamp, photo: it.photoUrl ? photos[it.photoUrl] : null }); const x = t.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(off, 0, 0, t.width, t.height); }); }
  const galItems = () => Object.keys(TPL).map(k => ({ tpl: k, d: TPL[k].sample, theme: st.theme, bgv: st.bgv }));
  function loadPhoto(url, done) { if (!url) return done(null); if (photos[url] !== undefined) return done(photos[url]); const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { try { const t = document.createElement('canvas'); t.width = t.height = 4; t.getContext('2d').drawImage(im, 0, 0, 4, 4); t.toDataURL(); photos[url] = im; } catch (e) { photos[url] = null; } done(photos[url]); }; im.onerror = () => { photos[url] = null; done(null); }; im.src = url; }
  function buildIdeas() {
    list = ideas(D, shuffle * 7);
    $('#ps-ideas').innerHTML = list.map((it, i) => `<button type="button" data-i="${i}"><canvas width="216" height="270"></canvas><b>${U.esc(it.why)}</b><small>${U.esc(TPL[it.tpl].name)}</small></button>`).join('');
    thumbs('#ps-ideas', list); list.forEach(it => { if (it.photoUrl) loadPhoto(it.photoUrl, im => { if (im) thumbs('#ps-ideas', list); }); });
  }
  function useIdea(it) { st.tpl = it.tpl; st.theme = it.theme; st.bgv = it.bgv; data[it.tpl] = Object.assign({}, it.d); photo = null; capTouched = false; press('#ps-theme', st.theme); press('#ps-bg', st.bgv); document.querySelectorAll('#ps-gal button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.t === st.tpl))); buildForm(); render(); thumbs('#ps-gal', galItems()); if (it.photoUrl) loadPhoto(it.photoUrl, im => { if (im && st.tpl === 'crew') { photo = im; render(); } else if (!im) say('The pilot photo could not be used from here. Add it with “Pilot photo” if you want it.', true); }); $('#ps-edit').scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  $('#ps-theme').innerHTML = Object.keys(THEMES).map(k => `<button type="button" data-v="${k}" aria-pressed="false"><span class="ps-sw" style="background:${THEMES[k].bg}"></span>${THEME_NAMES[k]}</button>`).join('');
  $('#ps-bg').innerHTML = BG_NAMES.map((n, i) => `<button type="button" data-v="${i}" aria-pressed="false">${n}</button>`).join('');
  $('#ps-gal').innerHTML = Object.keys(TPL).map(k => `<button type="button" data-t="${k}" aria-pressed="${k === st.tpl}" title="${TPL[k].use}"><canvas width="216" height="270"></canvas>${TPL[k].name}</button>`).join('');
  press('#ps-size', st.size); press('#ps-theme', st.theme); press('#ps-bg', st.bgv); buildForm(); buildIdeas(); render(); thumbs('#ps-gal', galItems());
  $('#ps-today').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  $('#ps-ideas').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) useIdea(list[+b.dataset.i]); });
  $('#ps-more').addEventListener('click', () => { shuffle++; buildIdeas(); });
  $('#ps-gal').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (!b) return; st.tpl = b.dataset.t; capTouched = false; photo = null; document.querySelectorAll('#ps-gal button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); buildForm(); render(); });
  const seg = (sel, key, num) => $(sel).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; st[key] = num ? +b.dataset.v : b.dataset.v; press(sel, st[key]); render(); if (key !== 'size') thumbs('#ps-gal', galItems()); });
  seg('#ps-size', 'size'); seg('#ps-theme', 'theme'); seg('#ps-bg', 'bgv', true);
  $('#ps-look').addEventListener('click', () => { const th = Object.keys(THEMES); let t, b; do { t = th[Math.floor(Math.random() * th.length)]; b = Math.floor(Math.random() * 4); } while (t === st.theme && b === st.bgv); st.theme = t; st.bgv = b; press('#ps-theme', t); press('#ps-bg', b); render(); thumbs('#ps-gal', galItems()); });
  $('#ps-stamp').addEventListener('change', e => { st.stamp = e.target.checked; render(); thumbs('#ps-gal', galItems()); thumbs('#ps-ideas', list); });
  form.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; data[st.tpl][k] = e.target.value; render(); });
  form.addEventListener('submit', e => e.preventDefault());
  $('#ps-cap').addEventListener('input', () => { capTouched = true; });
  $('#ps-pfile').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { photo = im; render(); }; im.src = r.result; }; r.readAsDataURL(f); });
  $('#ps-save').addEventListener('click', () => { render(); const name = `unipilot-${st.tpl}-${new Date().toISOString().slice(0, 10)}.png`; try { cv.toBlob(b => { if (!b) return say('The picture could not be made. Remove the photo and try again.', true); const a = document.createElement('a'), u = URL.createObjectURL(b); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); say('Saved as ' + name + ' in your Downloads folder.'); }, 'image/png'); } catch (x) { say('The picture could not be made. Remove the photo and try again.', true); } });
  $('#ps-copy').addEventListener('click', () => { const t = $('#ps-cap'), done = () => say('Caption copied.'); try { navigator.clipboard.writeText(t.value).then(done).catch(() => { t.select(); say('Press Ctrl+C to copy the selected caption.'); }); } catch (e) { t.select(); say('Press Ctrl+C to copy the selected caption.'); } });
  const again = () => { render(); thumbs('#ps-gal', galItems()); thumbs('#ps-ideas', list); evRedraw(); };
  const lg = new Image(); lg.onload = () => { logoImg = lg; again(); }; lg.src = 'images/logo-mark.jpg';
  try { const bin = atob(MONO), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); const ff = new FontFace('DM Mono', buf.buffer, { weight: '500' }); ff.load().then(f => { document.fonts.add(f); again(); }).catch(() => { }); } catch (e) { }
  if (document.fonts && document.fonts.load) Promise.all(['700 40px Fraunces', '500 20px "DM Sans"', '600 20px "DM Sans"', '700 20px "DM Sans"'].map(f => document.fonts.load(f).catch(() => { }))).then(again);
  window.__ups = { drawAll, TPL, THEMES, ideas, st, data, list: () => list };
}


/* =====================================================================
   EVENT KIT: one event form makes a whole set of banners in five shapes.
   ===================================================================== */
const FORMATS = { pt: [1080, 1350, 'Portrait 4:5'], sq: [1080, 1080, 'Square'], st: [1080, 1920, 'Story 9:16'], wd: [1920, 1080, 'Wide 16:9'], ev: [1920, 1005, 'Event cover'] };
const EV_BLANK = { kind: 'Free live seminar', title: 'Higher study abroad: where to start', tagline: 'An honest walk through scholarships, documents and timelines, with live questions.', date: '', time: '7:00 PM Bangladesh · 2:00 PM Germany', where: 'Live on Zoom', points: 'How to shortlist the right scholarships\nWhich documents to prepare first\nA timeline you can follow\nLive questions and answers', seal: 'Free', cta: 'Register free', speakers: [{ name: 'Speaker name', role: 'PhD researcher, Germany', img: '' }, { name: 'Second speaker', role: 'Scholarship winner, Italy', img: '' }], partners: [], teaser: 'Something new is landing soon', lastline: 'Registration closes soon', liveline: 'We are live now', thanks: 'Thank you for joining us', recap: 'The recording and the slides are on our website.' };
const evImgs = {}; let evRedraw = () => { };
function evImg(src) { if (!src) return null; const e = evImgs[src]; if (e) return e.ok ? e.im : null; const im = new Image(), rec = evImgs[src] = { im, ok: false }; if (/^https:/i.test(src)) im.crossOrigin = 'anonymous'; im.onload = () => { try { const t = document.createElement('canvas'); t.width = t.height = 2; t.getContext('2d').drawImage(im, 0, 0, 2, 2); t.toDataURL(); rec.ok = true; evRedraw(); } catch (x) { } }; im.src = src; return null; }
const evWhen = (E, short) => { if (!E.date) return ''; try { return new Date(E.date + 'T12:00:00').toLocaleDateString('en-GB', short ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return E.date; } };
const evLine = E => [evWhen(E, true), E.time, E.where].filter(Boolean).join('  ·  ');
const kick = P => P.ink === '#FFFFFF' ? P.accent : P.ink;

function evText(c, P, R, o) {
  let y = R.y; if (o.kicker) { label(c, o.kicker, o.center ? R.x + R.w / 2 : R.x, y, 21, kick(P), o.center ? 'center' : 'left'); y += 46; }
  const al = o.center ? 'center' : 'left', tx = o.center ? R.x + R.w / 2 : R.x, sb = o.sub ? fitBox(c, o.sub, 500, F.s, R.w, Math.max(40, R.h * .32), o.subHi || 34, 20, 1.32) : null;
  const tb = fitBox(c, o.title || '', 700, F.d, R.w, Math.max(50, R.h - (y - R.y) - (sb ? sb.h + 26 : 0)), o.hi || 104, 32, 1.07); y = put(c, tb, 700, F.d, tx, y, o.color || P.ink, al) + (sb ? 22 : 0);
  if (sb) y = put(c, sb, 500, F.s, tx, y, P.sub, al); return y;
}
function evInfo(c, P, R, E) {
  const cells = [['When', evWhen(E)], ['Time', E.time], ['Where', E.where]].filter(a => a[1]); if (!cells.length) return;
  shadowCard(c, R.x, R.y, R.w, R.h, 26, P.card); const cw = (R.w - 56) / cells.length;
  cells.forEach(([l, v], i) => { const cx = R.x + 28 + i * cw; if (i) { c.strokeStyle = P.cardSub; c.globalAlpha = .5; c.lineWidth = 3; c.setLineDash([8, 10]); c.beginPath(); c.moveTo(cx - 12, R.y + 20); c.lineTo(cx - 12, R.y + R.h - 20); c.stroke(); c.setLineDash([]); c.globalAlpha = 1; } label(c, l, cx, R.y + R.h * .16, 18, P.cardAccent); put(c, fitBox(c, v, 700, F.s, cw - 30, R.h * .58, 33, 17, 1.18), 700, F.s, cx, R.y + R.h * .16 + 30, P.cardInk); });
}
function avatar(c, P, cx, cy, d, sp, sq) {
  const im = evImg(sp.img); c.save(); if (sq) rr(c, cx - d / 2, cy - d / 2, d, d, d * .14); else { c.beginPath(); c.arc(cx, cy, d / 2, 0, 7); } c.clip();
  if (im) { const s = Math.max(d / im.width, d / im.height), w = im.width * s, h = im.height * s; c.drawImage(im, cx - w / 2, cy - h / 2, w, h); }
  else { c.fillStyle = P.cardAccent; c.fillRect(cx - d / 2, cy - d / 2, d, d); setF(c, 700, d * .46, F.d); c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.fillText((String(sp.name || 'S').trim()[0] || 'S').toUpperCase(), cx, cy - d * .27); c.textAlign = 'left'; }
  c.restore(); if (!sq) { c.beginPath(); c.arc(cx, cy, d / 2 + 5, 0, 7); c.strokeStyle = P.accent; c.lineWidth = 5; c.stroke(); }
}
function evSpeakers(c, P, R, list, cards) {
  const n = list.length; if (!n) return; const wide = R.w / R.h, cols = wide > 2.6 ? n : n === 1 ? 1 : n <= 4 ? (wide < .75 ? 1 : 2) : 3, rows = Math.ceil(n / cols), gap = 18, cw = (R.w - gap * (cols - 1)) / cols, ch = (R.h - gap * (rows - 1)) / rows;
  list.forEach((sp, i) => {
    const x = R.x + (i % cols) * (cw + gap), y = R.y + Math.floor(i / cols) * (ch + gap), side = cw > ch * 1.7;
    if (cards) shadowCard(c, x, y, cw, ch, 24, P.card); const ink = cards ? P.cardInk : P.ink, sub = cards ? P.cardSub : P.sub, pad = cards ? 20 : 4;
    if (side) { const d = Math.min(ch - pad * 2 - 6, cw * .32); avatar(c, P, x + pad + d / 2 + 5, y + ch / 2, d, sp); const tx = x + pad + d + 26, tw = cw - (tx - x) - pad, nb = fitBox(c, sp.name, 700, F.d, tw, ch * .5, 44, 18, 1.1), rb = sp.role ? fitBox(c, sp.role, 500, F.s, tw, ch * .34, 26, 15, 1.22) : null, th = nb.h + (rb ? rb.h + 6 : 0); let ty = y + (ch - th) / 2; ty = put(c, nb, 700, F.d, tx, ty, ink) + 6; if (rb) put(c, rb, 500, F.s, tx, ty, sub); }
    else { const d = Math.min(cw - pad * 2 - 20, ch * .52); avatar(c, P, x + cw / 2, y + pad + d / 2 + 6, d, sp); let ty = y + pad + d + 24; const nb = fitBox(c, sp.name, 700, F.d, cw - pad * 2, (y + ch - ty) * .52, 42, 17, 1.1); ty = put(c, nb, 700, F.d, x + cw / 2, ty, ink, 'center') + 6; if (sp.role) put(c, fitBox(c, sp.role, 500, F.s, cw - pad * 2, Math.max(20, y + ch - ty - pad), 25, 14, 1.22), 500, F.s, x + cw / 2, ty, sub, 'center'); }
  });
}
function logoTile(c, x, y, w, h, p) { rr(c, x, y, w, h, 18); c.fillStyle = '#FFFFFF'; c.fill(); c.strokeStyle = 'rgba(10,26,51,.14)'; c.lineWidth = 2; c.stroke(); const im = p.own ? logoImg : evImg(p.img); if (im) { const s = Math.min((w - 28) / im.width, (h - 24) / im.height), iw = im.width * s, ih = im.height * s; c.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); } else { const fb = fitBox(c, p.name || 'Partner', 700, F.s, w - 28, h - 20, 30, 14, 1.12); put(c, fb, 700, F.s, x + w / 2, y + (h - fb.h) / 2, '#0A1A33', 'center'); } }
function evPartners(c, P, R, list, text) {
  if (!list.length) return; label(c, text || 'In collaboration with', R.x, R.y, 17, P.sub); const y = R.y + 32, h = R.h - 32, gap = 14, w = Math.min(h * 2.4, (R.w - gap * (list.length - 1)) / list.length);
  list.forEach((p, i) => logoTile(c, R.x + i * (w + gap), y, w, h, p));
}
function bulletList(c, P, R, pts) { const n = Math.max(pts.length, 1), gap = Math.min(176, R.h / n); pts.forEach((p, i) => { const cy = R.y + gap * (i + .5); check(c, R.x + 26, cy, Math.min(26, gap * .3), P.accent, P.accentInk); const fb = fitBox(c, p, 600, F.s, R.w - 80, gap - 14, 50, 20, 1.2); put(c, fb, 600, F.s, R.x + 76, cy - fb.h / 2 + 2, P.ink); }); }
function sealAt(c, P, x, y, r, t) { if (!t) return; c.save(); c.translate(x, y); c.rotate(-.2); c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = P.bg; c.globalAlpha = .82; c.fill(); c.globalAlpha = 1; c.strokeStyle = P.accent; c.lineWidth = 6; c.stroke(); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r - 12, 0, 7); c.stroke(); const sb = fitBox(c, String(t).toUpperCase(), 700, F.d, r * 1.5, r * 1.1, r * .5, 14, 1.05); put(c, sb, 700, F.d, 0, -sb.h / 2, P.accent, 'center'); c.restore(); }
const cut = (R, a, b, land) => land ? [{ x: R.x, y: R.y, w: R.w * a - 24, h: R.h }, { x: R.x + R.w * a + 24, y: R.y, w: R.w * b - 24, h: R.h }] : null;
const dateStrip = (c, P, R, E) => { const t = evLine(E); if (!t) return 0; const h = 62; rr(c, R.x, R.y + R.h - h, R.w, h, 31); c.fillStyle = P.soft; c.fill(); c.strokeStyle = P.line; c.lineWidth = 2; c.stroke(); const fb = fitBox(c, t, 700, F.s, R.w - 50, 40, 27, 15, 1.2); put(c, fb, 700, F.s, R.x + R.w / 2, R.y + R.h - h + (h - fb.size) / 2 - 2, P.ink, 'center'); return h + 22; };

const EV = {
  teaser: { name: 'Surprise teaser', day: -21, draw(c, P, E, R, g) {
    const A = g.land ? cut(R, .56, .44, true) : null, T = A ? A[0] : { x: R.x, y: R.y, w: R.w, h: R.h * .5 }, V = A ? A[1] : { x: R.x, y: R.y + R.h * .5, w: R.w, h: R.h * .5 };
    evText(c, P, T, { kicker: 'Coming soon', title: E.teaser || 'Something new is landing soon', sub: E.date ? 'Save the date: ' + evWhen(E) : 'Stay tuned. Details in a few days.', hi: 108 });
    const r = Math.min(V.w, V.h) * .42, cx = V.x + V.w / 2, cy = V.y + V.h / 2; c.strokeStyle = P.accent; for (let i = 0; i < 3; i++) { c.globalAlpha = 1 - i * .3; c.lineWidth = 6 - i * 2; c.beginPath(); c.arc(cx, cy, r * (1 - i * .2), 0, 7); c.stroke(); } c.globalAlpha = 1; c.save(); c.translate(cx, cy); c.rotate(-.6); const sw = c.createLinearGradient(0, 0, r, 0); sw.addColorStop(0, P.accent); sw.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sw; c.globalAlpha = .35; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, 0, .9); c.closePath(); c.fill(); c.restore(); c.globalAlpha = 1;
    setF(c, 700, r * 1.05, F.d); c.fillStyle = P.ink; c.textAlign = 'center'; c.fillText('?', cx, cy - r * .62); c.textAlign = 'left';
  }, cap: E => `👀 ${E.teaser || 'Something new is landing soon'}\n\n${E.date ? 'Save the date: ' + evWhen(E) + '.' : 'Details in a few days.'} Can you guess what it is? Tell us in the comments.\n\n#UniPilotGlobal #ComingSoon #StudyAbroad` },

  announce: { name: 'Main announcement', day: -14, draw(c, P, E, R, g) {
    const sp = E.speakers.filter(s => s.name), pt = E.partners.filter(p => p.name || p.img);
    if (g.land) { const [L, V] = cut(R, .58, .42, true), ih = 140; evText(c, P, { x: L.x, y: L.y, w: L.w - (sp.length && E.seal ? 160 : 0), h: L.h - ih - 30 }, { kicker: E.kind, title: E.title, sub: E.tagline, hi: 92 }); evInfo(c, P, { x: L.x, y: L.y + L.h - ih, w: L.w, h: ih }, E); const ph = pt.length ? 120 : 0; if (sp.length) evSpeakers(c, P, { x: V.x, y: V.y, w: V.w, h: V.h - ph - (ph ? 24 : 0) }, sp.slice(0, 4), true); else sealAt(c, P, V.x + V.w / 2, V.y + (V.h - ph) / 2, Math.min(V.w, V.h - ph) * .3, E.seal || E.kind); if (ph) evPartners(c, P, { x: V.x, y: V.y + V.h - ph, w: V.w, h: ph }, pt.slice(0, 3)); if (sp.length && E.seal) sealAt(c, P, L.x + L.w - 72, L.y + 76, 70, E.seal); }
    else { const k = R.h / 990, ph = pt.length ? 118 : 0, ih = 136 * Math.max(.85, Math.min(k, 1.15)), sh = sp.length ? Math.min(300, R.h * .25) : 0, th = R.h - ph - ih - sh - (ph ? 22 : 0) - (sh ? 22 : 0) - 24; evText(c, P, { x: R.x, y: R.y, w: R.w - (E.seal ? 170 : 0), h: th }, { kicker: E.kind, title: E.title, sub: E.tagline, hi: 96 * Math.min(1.25, Math.max(k, .8)) }); let y = R.y + th + 24; if (sh) { evSpeakers(c, P, { x: R.x, y, w: R.w, h: sh }, sp.slice(0, 4), false); y += sh + 22; } evInfo(c, P, { x: R.x, y, w: R.w, h: ih }, E); y += ih + 22; if (ph) evPartners(c, P, { x: R.x, y, w: R.w, h: ph }, pt.slice(0, 4)); if (E.seal) sealAt(c, P, R.x + R.w - 76, R.y + 84, 74, E.seal); }
  }, cap: E => `📣 ${E.kind}: ${E.title}\n\n${E.tagline || ''}\n\n🗓 ${evWhen(E)}${E.time ? '\n⏰ ' + E.time : ''}${E.where ? '\n📍 ' + E.where : ''}${E.speakers.filter(s => s.name).length ? '\n🎤 ' + E.speakers.filter(s => s.name).map(s => s.name).join(', ') : ''}${E.partners.filter(p => p.name).length ? '\n🤝 With ' + E.partners.filter(p => p.name).map(p => p.name).join(', ') : ''}\n\nRegister here 👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #StudyAbroad #Scholarships` },

  collab: { name: 'Collaboration', day: -12, need: E => E.partners.some(p => p.name || p.img), draw(c, P, E, R, g) {
    const pt = [{ own: true, name: 'UniPilot Global' }].concat(E.partners.filter(p => p.name || p.img).slice(0, 3)), n = pt.length, th = Math.min(R.h * .26, 230), gap = 64, tw = Math.min(th * 1.5, (R.w - gap * (n - 1)) / n), tot = tw * n + gap * (n - 1); let x = R.x + (R.w - tot) / 2; const y = R.y + 50;
    label(c, 'Together', R.x + R.w / 2, R.y, 21, kick(P), 'center');
    pt.forEach((p, i) => { logoTile(c, x, y, tw, th, p); if (i < n - 1) { setF(c, 700, 54, F.d); c.fillStyle = P.accent === '#0A1A33' ? P.ink : P.accent; c.textAlign = 'center'; c.fillText('×', x + tw + gap / 2, y + th / 2 - 34); c.textAlign = 'left'; } x += tw + gap; });
    const names = E.partners.filter(p => p.name).map(p => p.name), ds = dateStrip(c, P, R, E), T = { x: R.x + (g.land ? R.w * .12 : 0), y: y + th + 44, w: R.w * (g.land ? .76 : 1), h: R.h - th - 94 - ds - 16 };
    evText(c, P, T, { kicker: 'UniPilot Global' + (names.length ? ' × ' + names.join(' × ') : '') + ' present', title: E.title, sub: T.h > 250 ? E.tagline : '', hi: 88, center: true });
  }, cap: E => `🤝 UniPilot Global × ${E.partners.filter(p => p.name).map(p => p.name).join(' × ')}\n\nWe are happy to work together on: ${E.title}\n\n🗓 ${evWhen(E)}${E.time ? '\n⏰ ' + E.time : ''}${E.where ? '\n📍 ' + E.where : ''}\n\nRegister here 👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #Collaboration #StudyAbroad` },

  agenda: { name: 'What you will learn', day: -10, need: E => lines(E.points).length > 0, draw(c, P, E, R, g) {
    const pts = lines(E.points).slice(0, 6);
    if (g.land) { const [L, V] = cut(R, .46, .54, true), ds = dateStrip(c, P, L, E); evText(c, P, { x: L.x, y: L.y, w: L.w, h: L.h - ds }, { kicker: 'What you will learn', title: E.title, sub: E.kind, hi: 78 }); bulletList(c, P, V, pts); }
    else { const ds = dateStrip(c, P, R, E), th = R.h * .3; const y = evText(c, P, { x: R.x, y: R.y, w: R.w, h: th }, { kicker: 'What you will learn', title: E.title, hi: 72 }) + 26; bulletList(c, P, { x: R.x, y, w: R.w, h: R.y + R.h - ds - y }, pts); }
  }, cap: E => `🧭 What you will learn in "${E.title}"\n\n${lines(E.points).map(p => '✅ ' + p).join('\n')}\n\n🗓 ${evWhen(E)}${E.time ? ' · ' + E.time : ''}\n\nRegister here 👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #StudyAbroad #Scholarships` },

  lineup: { name: 'Speaker line-up', day: -7, need: E => E.speakers.filter(s => s.name).length > 1, draw(c, P, E, R, g) {
    const sp = E.speakers.filter(s => s.name).slice(0, 6), ds = dateStrip(c, P, R, E);
    if (g.land) { const [L, V] = cut({ x: R.x, y: R.y, w: R.w, h: R.h - ds }, .36, .64, true); evText(c, P, L, { kicker: 'Meet your speakers', title: E.title, sub: E.kind, hi: 70 }); evSpeakers(c, P, V, sp, true); }
    else { const y = evText(c, P, { x: R.x, y: R.y, w: R.w, h: R.h * .2 }, { kicker: 'Meet your speakers', title: E.title, hi: 62 }) + 28; evSpeakers(c, P, { x: R.x, y, w: R.w, h: R.y + R.h - ds - y }, sp, true); }
  }, cap: E => `🎤 Meet your speakers for "${E.title}"\n\n${E.speakers.filter(s => s.name).map(s => '• ' + s.name + (s.role ? ', ' + s.role : '')).join('\n')}\n\n🗓 ${evWhen(E)}${E.time ? ' · ' + E.time : ''}\n\nRegister here 👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #StudyAbroad #Speakers` },

  speaker: { name: 'Speaker spotlight', day: -5, need: E => E.speakers.some(s => s.name), draw(c, P, E, R, g) {
    const list = E.speakers.filter(s => s.name), sp = list[Math.min(g.sel | 0, list.length - 1)] || { name: '' }, ds = dateStrip(c, P, R, E), H = R.h - ds;
    if (g.land) { const d = Math.min(H, R.w * .4); shadowCard(c, R.x, R.y + (H - d) / 2, d, d, d * .14, P.card); avatar(c, P, R.x + d / 2, R.y + H / 2, d - 28, sp, true); evText(c, P, { x: R.x + d + 56, y: R.y + H * .1, w: R.w - d - 56, h: H * .8 }, { kicker: 'Speaker', title: sp.name, sub: (sp.role ? sp.role + '\n' : '') + 'Speaking at: ' + E.title, hi: 100 }); }
    else { const d = Math.min(R.w * .72, H * .5); shadowCard(c, R.x + (R.w - d) / 2, R.y, d, d, d * .14, P.card); avatar(c, P, R.x + R.w / 2, R.y + d / 2, d - 28, sp, true); evText(c, P, { x: R.x, y: R.y + d + 34, w: R.w, h: H - d - 34 }, { kicker: 'Speaker', title: sp.name, sub: (sp.role ? sp.role + '\n' : '') + 'Speaking at: ' + E.title, hi: 84, center: true }); }
  }, cap: (E, g) => { const sp = E.speakers.filter(s => s.name)[g.sel | 0] || {}; return `🎤 Speaker spotlight: ${sp.name}\n\n${sp.role || ''}\n\n${sp.name} will speak at "${E.title}".\n🗓 ${evWhen(E)}${E.time ? ' · ' + E.time : ''}\n\nRegister here 👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #StudyAbroad #Speaker`; } },

  countdown: { name: 'Countdown', day: -3, draw(c, P, E, R, g) {
    const n = g.n, big = n > 1 ? String(n) : n === 1 ? 'Tomorrow' : 'Today', unit = n > 1 ? 'days to go' : n === 1 ? 'we take off' : 'is the day', ds = dateStrip(c, P, R, E), H = R.h - ds;
    const B = g.land ? { x: R.x, y: R.y, w: R.w * .44, h: H } : { x: R.x, y: R.y, w: R.w, h: H * .5 }, T = g.land ? { x: R.x + R.w * .48, y: R.y + H * .12, w: R.w * .52, h: H * .76 } : { x: R.x, y: R.y + H * .52, w: R.w, h: H * .48 };
    label(c, 'Countdown', B.x, B.y, 21, kick(P)); const bb = fitBox(c, big, 700, F.d, B.w, B.h - 110, n > 1 ? Math.min(B.h * .8, 520) : 190, 60, 1); put(c, bb, 700, F.d, B.x, B.y + 44, P.accent === '#0A1A33' ? P.ink : P.accent); put(c, fitBox(c, unit, 700, F.s, B.w, 60, 46, 24), 700, F.s, B.x + 6, B.y + 44 + bb.size * 1.02, P.ink);
    evText(c, P, T, { title: E.title, sub: E.kind + (E.seal ? ' · ' + E.seal : ''), hi: 100, subHi: 38 });
  }, cap: (E, g) => `⏳ ${g.n > 1 ? g.n + ' days to go' : g.n === 1 ? 'Tomorrow' : 'Today is the day'}: ${E.title}\n\n🗓 ${evWhen(E)}${E.time ? '\n⏰ ' + E.time : ''}${E.where ? '\n📍 ' + E.where : ''}\n\nHave you registered yet? 👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #Countdown #StudyAbroad` },

  lastcall: { name: 'Final boarding call', day: -2, draw(c, P, E, R, g) {
    const ds = dateStrip(c, P, R, E), H = R.h - ds, w = g.land ? R.w * .62 : R.w; evText(c, P, { x: R.x, y: R.y, w, h: H * (g.land ? 1 : .62) }, { kicker: 'Final boarding call', title: E.lastline || 'Registration closes soon', sub: E.title + (E.tagline ? '\n' + E.tagline : ''), hi: 104 });
    const r = Math.min(g.land ? R.w * .16 : R.w * .2, H * .22); sealAt(c, P, g.land ? R.x + R.w * .82 : R.x + R.w - r - 20, g.land ? R.y + H / 2 : R.y + H - r - 20, r, E.seal === 'Free' ? 'Last seats' : (E.seal || 'Last seats'));
    c.strokeStyle = P.accent; c.lineWidth = 5; c.lineCap = 'round'; c.setLineDash([2, 16]); c.beginPath(); c.moveTo(R.x, R.y + H - 30); c.lineTo(R.x + (g.land ? R.w * .6 : R.w * .5), R.y + H - 30); c.stroke(); c.setLineDash([]); c.lineCap = 'butt'; plane(c, R.x + (g.land ? R.w * .6 : R.w * .5) + 30, R.y + H - 30, 26, Math.PI / 2, P.accent === '#0A1A33' ? P.ink : P.accent);
  }, cap: E => `🛫 Final boarding call: ${E.title}\n\n${E.lastline || 'Registration closes soon'}. If you were planning to join, this is the moment.\n\n🗓 ${evWhen(E)}${E.time ? ' · ' + E.time : ''}\n\nRegister here 👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #LastCall #StudyAbroad` },

  live: { name: 'We are live', day: 0, draw(c, P, E, R, g) {
    const V = g.land ? { x: R.x + R.w * .62, y: R.y, w: R.w * .38, h: R.h } : { x: R.x, y: R.y + R.h * .56, w: R.w, h: R.h * .44 }, T = g.land ? { x: R.x, y: R.y, w: R.w * .58, h: R.h } : { x: R.x, y: R.y, w: R.w, h: R.h * .54 };
    evText(c, P, T, { kicker: 'On air', title: E.liveline || 'We are live now', sub: E.title + (E.where ? '\n' + E.where : ''), hi: 112 });
    const cx = V.x + V.w / 2, cy = V.y + V.h / 2, r = Math.min(V.w, V.h) * .2; for (let i = 3; i >= 1; i--) { c.beginPath(); c.arc(cx, cy, r * (1 + i * .62), 0, 7); c.strokeStyle = '#E5484D'; c.globalAlpha = .5 - i * .12; c.lineWidth = 6; c.stroke(); } c.globalAlpha = 1; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = '#E5484D'; c.fill(); label(c, 'Live', cx, cy - r * .2, r * .42, '#FFFFFF', 'center');
  }, cap: E => `🔴 ${E.liveline || 'We are live now'}: ${E.title}\n\n${E.where ? '📍 ' + E.where + '\n\n' : ''}Join us and bring your questions.\n👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #LiveNow #StudyAbroad` },

  thanks: { name: 'Thank you', day: 1, draw(c, P, E, R, g) {
    const sp = E.speakers.filter(s => s.name).slice(0, 6), pt = E.partners.filter(p => p.name || p.img).slice(0, 4), ph = pt.length ? 118 : 0, sh = sp.length ? (g.land ? R.h : Math.min(320, R.h * .28)) : 0;
    if (g.land) { const [L, V] = cut(R, .56, .44, true); evText(c, P, { x: L.x, y: L.y, w: L.w, h: L.h - ph - 24 }, { kicker: 'Mission complete', title: E.thanks || 'Thank you for joining us', sub: E.title + (E.recap ? '\n' + E.recap : ''), hi: 96 }); if (ph) evPartners(c, P, { x: L.x, y: L.y + L.h - ph, w: L.w, h: ph }, pt, 'With thanks to'); if (sp.length) evSpeakers(c, P, V, sp, true); }
    else { const th = R.h - ph - sh - (ph ? 24 : 0) - (sh ? 24 : 0); evText(c, P, { x: R.x, y: R.y, w: R.w, h: th }, { kicker: 'Mission complete', title: E.thanks || 'Thank you for joining us', sub: E.title + (E.recap ? '\n' + E.recap : ''), hi: 100 }); let y = R.y + th + 24; if (sh) { evSpeakers(c, P, { x: R.x, y, w: R.w, h: sh }, sp, false); y += sh + 24; } if (ph) evPartners(c, P, { x: R.x, y, w: R.w, h: ph }, pt, 'With thanks to'); }
  }, cap: E => `🙏 ${E.thanks || 'Thank you for joining us'}\n\n"${E.title}" is complete. ${E.recap || ''}${E.speakers.filter(s => s.name).length ? '\n\nThank you to our speakers: ' + E.speakers.filter(s => s.name).map(s => s.name).join(', ') + '.' : ''}${E.partners.filter(p => p.name).length ? '\nThank you to our partners: ' + E.partners.filter(p => p.name).map(p => p.name).join(', ') + '.' : ''}\n\n👉 https://${SITE}/materials.html#seminars\n\n#UniPilotGlobal #ThankYou #StudyAbroad` }
};

function evDraw(cv, it, E, o) {
  const [W, H] = FORMATS[o.fmt] || FORMATS.pt; if (cv.width !== W) cv.width = W; if (cv.height !== H) cv.height = H;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.textBaseline = 'top'; c.textAlign = 'left'; c.globalAlpha = 1; c.setLineDash([]); c.shadowColor = 'transparent';
  const P = THEMES[o.theme] || THEMES.night, top = o.fmt === 'st' ? 190 : 0, bot = o.fmt === 'st' ? 250 : 0, land = W > H;
  const S = land ? W / 1440 : 1, LW = W / S, LH = H / S; c.scale(S, S);      // wide shapes are drawn on a 1440-wide page and enlarged, so text stays readable on a small screen
  frameBgV(c, P, LW, LH, o.bgv | 0); c.save(); c.translate(0, top); header(c, P, LW, o); c.restore(); footer(c, P, land ? 1080 : LW, LH - bot, E.cta || 'Register free');
  EV[it.kind].draw(c, P, E, { x: 64, y: 200 + top, w: LW - 128, h: LH - bot - 176 - 200 - top }, { land, W: LW, H: LH, sel: it.sel, n: it.n });
}
/* The posting plan: which banner, how many days before or after the event. */
function evItems(E) {
  const out = [], sp = E.speakers.filter(s => s.name), add = (kind, day, name, extra) => { if (EV[kind].need && !EV[kind].need(E)) return; out.push(Object.assign({ kind, day, name: name || EV[kind].name }, extra || {})); };
  add('teaser', -21); add('announce', -14); add('collab', -12); add('agenda', -10); add('lineup', -7, sp.length > 1 ? 'Speaker line-up' : '');
  sp.slice(0, 6).forEach((s, i) => add('speaker', -6 + Math.min(i, 2), 'Speaker: ' + s.name, { sel: i }));
  add('countdown', -3, '3 days to go', { n: 3 }); add('lastcall', -2); add('countdown', -1, 'Tomorrow', { n: 1 }); add('countdown', 0, 'Today', { n: 0 }); add('live', 0); add('thanks', 1);
  return out;
}

/* ---------- a tiny zip writer, so the whole kit saves as one file ---------- */
function zipStore(files) {
  const tbl = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tbl[n] = c >>> 0; }
  const crc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = tbl[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }, enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  files.forEach(f => { const nm = enc.encode(f.name), cr = crc(f.data), head = new Uint8Array([0x50, 0x4b, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0].concat(u32(cr), u32(f.data.length), u32(f.data.length), u16(nm.length), [0, 0]));
    parts.push(head, nm, f.data); cen.push(new Uint8Array([0x50, 0x4b, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0].concat(u32(cr), u32(f.data.length), u32(f.data.length), u16(nm.length), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], u32(off))), nm); off += head.length + nm.length + f.data.length; });
  const csz = cen.reduce((a, b) => a + b.length, 0); return new Blob(parts.concat(cen, [new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0].concat(u16(files.length), u16(files.length), u32(csz), u32(off), [0, 0]))]), { type: 'application/zip' });
}

function startEvents(U) {
  const $ = s => document.querySelector(s), cv = $('#pe-cv'), KEY = 'ups_event';
  let E; try { E = Object.assign({}, EV_BLANK, JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (x) { E = Object.assign({}, EV_BLANK); }
  if (!E.date) { const d = new Date(Date.now() + 14 * DAY); E.date = d.toISOString().slice(0, 10); } E.speakers = (E.speakers || []).slice(0, 6); E.partners = (E.partners || []).slice(0, 4);
  const st = { fmt: 'pt', theme: 'night', bgv: 0, stamp: true, cur: 1 }; let items = [], capTouched = false, timer = 0;
  const say = (t, bad) => { const m = $('#pe-msg'); m.textContent = t; m.style.color = bad ? '#D6453D' : ''; };
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(E)); } catch (x) { say('Photos are too large to remember for next time. They still work now.', true); } };
  const press = (sel, v) => document.querySelectorAll(sel + ' button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v))));
  const opt = () => ({ fmt: st.fmt, theme: st.theme, bgv: st.bgv, stamp: st.stamp });
  const when = it => { if (!E.date) return ''; const d = new Date(new Date(E.date + 'T12:00:00').getTime() + it.day * DAY), past = d < today0(); return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + (past ? ' (passed)' : ''); };
  function big() { const it = items[st.cur] || items[0]; if (!it) return; evDraw(cv, it, E, opt()); $('#pe-name').textContent = it.name + ' · ' + FORMATS[st.fmt][2] + ' · ' + FORMATS[st.fmt][0] + '×' + FORMATS[st.fmt][1]; if (!capTouched) $('#pe-cap').value = EV[it.kind].cap(E, it).replace(/\n{3,}/g, '\n\n').trim(); }
  function grid() {
    items = evItems(E); if (st.cur >= items.length) st.cur = 0; const [W, H] = FORMATS[st.fmt], tw = 240, th = Math.round(tw * H / W);
    $('#pe-grid').innerHTML = items.map((it, i) => `<button type="button" data-i="${i}" aria-pressed="${i === st.cur}"><canvas width="${tw}" height="${th}"></canvas><b>${U.esc(it.name)}</b><small>${it.day === 0 ? 'Event day' : it.day < 0 ? -it.day + ' days before' : 'The day after'}${E.date ? ' · ' + U.esc(when(it)) : ''}</small></button>`).join('');
    const off = document.createElement('canvas'); document.querySelectorAll('#pe-grid canvas').forEach((t, i) => { evDraw(off, items[i], E, opt()); const x = t.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(off, 0, 0, t.width, t.height); });
  }
  const all = () => { grid(); big(); }; evRedraw = () => { clearTimeout(timer); timer = setTimeout(all, 60); };
  const soon = () => { clearTimeout(timer); timer = setTimeout(() => { keep(); all(); }, 250); };

  /* people and partner rows */
  function rows() {
    $('#pe-sp').innerHTML = E.speakers.map((s, i) => `<div class="pe-rowi"><input type="text" data-sp="${i}" data-k="name" placeholder="Name" aria-label="Speaker ${i + 1} name" value="${U.esc(s.name || '')}"><input type="text" data-sp="${i}" data-k="role" placeholder="Role, for example PhD researcher, Germany" aria-label="Speaker ${i + 1} role" value="${U.esc(s.role || '')}"><label class="btn out pe-up">${s.img ? 'Change photo' : 'Add photo'}<input type="file" accept="image/*" data-spf="${i}" hidden></label><button type="button" class="pe-x" data-spx="${i}" aria-label="Remove speaker ${i + 1}">&times;</button></div>`).join('');
    $('#pe-pt').innerHTML = E.partners.map((p, i) => `<div class="pe-rowi"><input type="text" data-pt="${i}" data-k="name" placeholder="Club, university or platform name" aria-label="Partner ${i + 1} name" value="${U.esc(p.name || '')}"><label class="btn out pe-up">${p.img ? 'Change logo' : 'Add logo'}<input type="file" accept="image/*" data-ptf="${i}" hidden></label><button type="button" class="pe-x" data-ptx="${i}" aria-label="Remove partner ${i + 1}">&times;</button></div>`).join('');
    $('#pe-addsp').disabled = E.speakers.length >= 6; $('#pe-addpt').disabled = E.partners.length >= 4;
    const ex = (U.D.experts || []).filter(e => e.name); $('#pe-pilot').innerHTML = '<option value="">Add one of your pilots…</option>' + ex.map((e, i) => `<option value="${i}">${U.esc(e.name)}</option>`).join(''); $('#pe-pilot').hidden = !ex.length;
  }
  const shrink = (file, max, png, done) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.width, im.height)), t = document.createElement('canvas'); t.width = Math.round(im.width * s); t.height = Math.round(im.height * s); const x = t.getContext('2d'); if (!png) { x.fillStyle = '#fff'; x.fillRect(0, 0, t.width, t.height); } x.drawImage(im, 0, 0, t.width, t.height); done(png ? t.toDataURL('image/png') : t.toDataURL('image/jpeg', .86)); }; im.src = r.result; }; r.readAsDataURL(file); };
  ['kind', 'title', 'tagline', 'date', 'time', 'where', 'points', 'seal', 'cta', 'teaser', 'lastline', 'liveline', 'thanks', 'recap'].forEach(k => { const el = $('#pe-' + k); if (!el) return; el.value = E[k] || ''; el.addEventListener('input', () => { E[k] = el.value; capTouched = false; soon(); }); });
  $('#pe-form').addEventListener('submit', e => e.preventDefault());
  $('#pe-form').addEventListener('input', e => { const t = e.target; if (t.dataset.sp != null) { E.speakers[+t.dataset.sp][t.dataset.k] = t.value; capTouched = false; soon(); } else if (t.dataset.pt != null) { E.partners[+t.dataset.pt][t.dataset.k] = t.value; capTouched = false; soon(); } });
  $('#pe-form').addEventListener('change', e => { const t = e.target, f = t.files && t.files[0]; if (!f) return; if (t.dataset.spf != null) shrink(f, 520, false, u => { E.speakers[+t.dataset.spf].img = u; keep(); rows(); all(); }); else if (t.dataset.ptf != null) shrink(f, 420, true, u => { E.partners[+t.dataset.ptf].img = u; keep(); rows(); all(); }); });
  $('#pe-form').addEventListener('click', e => { const a = e.target.closest('[data-spx]'), b = e.target.closest('[data-ptx]'); if (a) { E.speakers.splice(+a.dataset.spx, 1); keep(); rows(); all(); } else if (b) { E.partners.splice(+b.dataset.ptx, 1); keep(); rows(); all(); } });
  $('#pe-addsp').addEventListener('click', () => { if (E.speakers.length < 6) { E.speakers.push({ name: '', role: '', img: '' }); rows(); } });
  $('#pe-addpt').addEventListener('click', () => { if (E.partners.length < 4) { E.partners.push({ name: '', img: '' }); rows(); } });
  $('#pe-pilot').addEventListener('change', e => { const p = (U.D.experts || []).filter(x => x.name)[+e.target.value]; if (!p || e.target.value === '' || E.speakers.length >= 6) return; E.speakers.push({ name: p.name, role: p.role || p.tagline || '', img: p.photo || '' }); keep(); rows(); all(); });
  $('#pe-new').addEventListener('click', () => { if (!$('#pe-new').dataset.sure) { $('#pe-new').dataset.sure = '1'; $('#pe-new').textContent = 'Click again to clear this event'; return; } delete $('#pe-new').dataset.sure; $('#pe-new').textContent = 'Start a new event'; E = JSON.parse(JSON.stringify(EV_BLANK)); E.title = ''; E.tagline = ''; E.points = ''; E.speakers = []; E.date = new Date(Date.now() + 14 * DAY).toISOString().slice(0, 10); ['kind', 'title', 'tagline', 'date', 'time', 'where', 'points', 'seal', 'cta', 'teaser', 'lastline', 'liveline', 'thanks', 'recap'].forEach(k => { const el = $('#pe-' + k); if (el) el.value = E[k] || ''; }); keep(); rows(); all(); });

  $('#pe-fmt').innerHTML = Object.keys(FORMATS).map(k => `<button type="button" data-v="${k}" aria-pressed="false">${FORMATS[k][2]}</button>`).join('');
  $('#pe-theme').innerHTML = Object.keys(THEMES).map(k => `<button type="button" data-v="${k}" aria-pressed="false"><span class="ps-sw" style="background:${THEMES[k].bg}"></span>${THEME_NAMES[k]}</button>`).join('');
  $('#pe-bg').innerHTML = BG_NAMES.map((n, i) => `<button type="button" data-v="${i}" aria-pressed="false">${n}</button>`).join('');
  const seg = (sel, key, num) => $(sel).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; st[key] = num ? +b.dataset.v : b.dataset.v; press(sel, st[key]); all(); });
  seg('#pe-fmt', 'fmt'); seg('#pe-theme', 'theme'); seg('#pe-bg', 'bgv', true); press('#pe-fmt', st.fmt); press('#pe-theme', st.theme); press('#pe-bg', st.bgv);
  $('#pe-look').addEventListener('click', () => { const th = Object.keys(THEMES); st.theme = th[(th.indexOf(st.theme) + 1 + Math.floor(Math.random() * (th.length - 1))) % th.length]; st.bgv = (st.bgv + 1 + Math.floor(Math.random() * 3)) % 4; press('#pe-theme', st.theme); press('#pe-bg', st.bgv); all(); });
  $('#pe-stamp').addEventListener('change', e => { st.stamp = e.target.checked; all(); });
  $('#pe-grid').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; st.cur = +b.dataset.i; capTouched = false; document.querySelectorAll('#pe-grid button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); big(); $('#pe-stage').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#pe-cap').addEventListener('input', () => { capTouched = true; });
  const slug = t => String(t || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'event';
  const dl = (blob, name) => { const a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); };
  const blobOf = c2 => new Promise((res, rej) => { try { c2.toBlob(b => b ? res(b) : rej(new Error('empty')), 'image/png'); } catch (x) { rej(x); } });
  $('#pe-save').addEventListener('click', () => { big(); const it = items[st.cur], name = `unipilot-${slug(E.title)}-${it.kind}${it.sel != null ? '-' + (it.sel + 1) : ''}${it.n != null ? '-' + it.n : ''}-${st.fmt}.png`; blobOf(cv).then(b => { dl(b, name); say('Saved as ' + name); }).catch(() => say('The picture could not be made. A photo from another website may be blocking it: add the photo from your computer instead.', true)); });
  $('#pe-zip').addEventListener('click', async () => { const btn = $('#pe-zip'); btn.disabled = true; say('Making all banners…'); try { const off = document.createElement('canvas'), files = [], caps = []; for (let i = 0; i < items.length; i++) { const it = items[i]; evDraw(off, it, E, opt()); const b = await blobOf(off), nm = String(i + 1).padStart(2, '0') + '-' + slug(it.name) + '.png'; files.push({ name: nm, data: new Uint8Array(await b.arrayBuffer()) }); caps.push(nm + '  |  post on: ' + (when(it) || (it.day + ' days')) + '\n\n' + EV[it.kind].cap(E, it).replace(/\n{3,}/g, '\n\n').trim() + '\n\n' + '-'.repeat(60)); } files.push({ name: 'captions-and-posting-plan.txt', data: new TextEncoder().encode('\uFEFF' + E.title + '\r\n' + evLine(E) + '\r\n\r\n' + caps.join('\n\n').replace(/\n/g, '\r\n')) }); dl(zipStore(files), `unipilot-${slug(E.title)}-kit-${st.fmt}.zip`); say(items.length + ' banners and the captions saved as one zip file.'); } catch (x) { say('The kit could not be made. A photo from another website may be blocking it: add the photo from your computer instead.', true); } btn.disabled = false; });
  $('#pe-copy').addEventListener('click', () => { const t = $('#pe-cap'), done = () => say('Caption copied.'); try { navigator.clipboard.writeText(t.value).then(done).catch(() => { t.select(); say('Press Ctrl+C to copy the selected caption.'); }); } catch (x) { t.select(); say('Press Ctrl+C to copy the selected caption.'); } });
  rows(); all(); window.__upe = { evDraw, evItems, EV, FORMATS, get E() { return E; }, st, redraw: all };
  return all;
}

/* ---------- team only ---------- */
let started = false, checking = false;
UP.boot('studio', U => {
  const gate = document.getElementById('ps-gate'), app = document.getElementById('ps-app'), show = (h) => { gate.innerHTML = h; gate.hidden = false; app.hidden = true; };
  if (started || checking) return;                       // the site builds a page twice (saved data, then fresh data); the studio starts once
  const go = () => { if (started) return; started = true; gate.hidden = true; app.hidden = false; start(U);
    let evOn = false; const tab = v => { document.querySelectorAll('#ps-tabs button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v))); document.getElementById('ps-daily').hidden = v !== 'daily'; document.getElementById('ps-event').hidden = v !== 'event'; if (v === 'event') { if (!evOn) { evOn = true; startEvents(U); } else evRedraw(); } try { history.replaceState(null, '', v === 'event' ? '#event' : location.pathname); } catch (e) { } };
    document.getElementById('ps-tabs').addEventListener('click', e => { const x = e.target.closest('[data-v]'); if (x) tab(x.dataset.v); }); if (location.hash === '#event') tab('event'); };
  if (!U.accShown || !U.accShown()) return show('<h2>Team page</h2><p class="mute">Accounts are switched off, so this page cannot check who you are.</p>');
  const u = U.sessUser();
  if (!u) return show('<h2>Team page</h2><p class="mute">Sign in with your team account to open the Post Studio.</p><a class="btn" href="account.html?next=studio.html">Sign in</a>');
  checking = true; show('<p class="mute">Checking your account…</p>');
  U.loadAcc().then(A => A.client()).then(sb => sb.from('user_roles').select('role').eq('user_id', u.id)).then(r => {
    const roles = (r.data || []).map(x => x.role);
    if (roles.some(x => ['admin', 'finance', 'support'].includes(x))) { const wait = () => { if (UP.settled === false && Date.now() - t0 < 6000) return setTimeout(wait, 200); go(); }, t0 = Date.now(); wait(); }
    else show('<h2>Team page</h2><p class="mute">This page is only for the UniPilot team.</p><a class="btn out" href="index.html">Back to the website</a>');
  }).catch(() => show('<h2>Team page</h2><p class="mute">Your account could not be checked. Check your internet connection and reload the page.</p>'));
});
})();
