const FAC = [['level', 'Degree'], ['region', 'Continent'], ['country', 'Country', 1], ['subject', 'Subject', 1], ['funding', 'Funding'], ['type', 'Type'], ['month', 'Deadline'], ['effort', 'Effort'], ['tag', 'Applicant']];
const PRE = [['Fully funded', { funding: ['full'] }], ["Master's, fully funded", { level: ['Master'], funding: ['full'] }], ['PhD fellowships', { level: ['PhD'] }], ['Women applicants', { tag: ['Women'] }], ['Low effort', { effort: ['Low'] }], ['Has video guide', { video: true }], ['Deadline soonest', { sort: 'soon' }], ['Internships', { type: ['Internship'] }]];
const $ = UP.$, $$ = UP.$$, S = { q: '', video: false, sort: 'rec' }; FAC.forEach(f => S[f[0]] = []);
let first = true, shown = 12, U0;
const hasInt = () => true, realInt = () => U0.D.opps.some(o => o.type === 'Internship'), facs = () => FAC.filter(f => f[0] !== 'type' || hasInt()), cap = s => s.charAt(0).toUpperCase() + s.slice(1), lab = (k, v) => { const o = U0.facetOpts(k).find(x => x[0] === v); return cap(o ? o[1] : v); };
const reset = (p) => { FAC.forEach(f => S[f[0]] = []); S.q = ''; S.video = false; S.sort = 'rec'; Object.keys(p || {}).forEach(k => S[k] = Array.isArray(p[k]) ? p[k].slice() : p[k]); $('#q').value = S.q; $('#sort').value = S.sort; };
function buildFacets() {
  $('#facets').innerHTML = facs().map(([k, l, s]) => `<div class="fd" data-k="${k}"><button type="button" class="fb" aria-expanded="false">${l} <b></b></button><div class="pop" hidden>${s ? `<input type="search" placeholder="Search ${l.toLowerCase()}" aria-label="Search ${l}">` : ''}<div class="ol">${U0.facetOpts(k).map(o => `<label class="opt" data-t="${UP.esc(o[1].toLowerCase())}"><input type="checkbox" value="${UP.esc(o[0])}"><span>${UP.esc(cap(o[1]))}</span><i></i></label>`).join('')}</div><div class="pf"><span class="mute">Pick one or more</span><button type="button" data-clear="${k}">Clear</button></div></div></div>`).join('') + '<div class="fd"><button type="button" class="fb" id="vb" aria-pressed="false">Video guide</button></div>';
}
function sync() {
  facs().forEach(([k]) => { const d = $('.fd[data-k=' + k + ']'); if (!d) return; const sel = S[k], b = $('.fb', d); b.classList.toggle('has', sel.length > 0); $('b', b).textContent = sel.length ? lab(k, sel[0]) + (sel.length > 1 ? ' +' + (sel.length - 1) : '') : '';
    $$('.opt', d).forEach(el => { const cb = $('input', el), n = U0.filterList(U0.D.opps, Object.assign({}, S, { [k]: [cb.value] })).length; cb.checked = sel.includes(cb.value); $('i', el).textContent = n; el.classList.toggle('z', n === 0); el.hidden = k === 'country' && !sel.includes(cb.value) && (n === 0 || (S.region.length > 0 && !S.region.includes(U0.regionOf(cb.value)))); }); });
  const nf = facs().reduce((a, [k]) => a + S[k].length, 0) + (S.video ? 1 : 0); $('#fcount').textContent = nf; $('#fcount').hidden = !nf;
  $('#vb').classList.toggle('has', S.video); $('#vb').setAttribute('aria-pressed', S.video);
}
function draw(rs) {
  const U = U0, list = U.filterList(U.D.opps, S); if (rs) shown = 12; sync();
  const sp = new URLSearchParams(); facs().forEach(([k]) => S[k].length && sp.set(k, S[k].join('|'))); if (S.q) sp.set('q', S.q); if (S.video) sp.set('video', '1'); if (S.sort !== 'rec') sp.set('sort', S.sort); history.replaceState(null, '', sp.toString() ? '?' + sp : location.pathname);
  const act = []; facs().forEach(([k]) => S[k].forEach(v => act.push([k, v, lab(k, v)]))); if (S.q) act.push(['q', '', '"' + S.q + '"']); if (S.video) act.push(['video', '', 'Video guide']);
  $('#active').innerHTML = act.length ? '<small>Your filters</small>' + act.map(a => `<button class="chip on" data-k="${a[0]}" data-v="${U.esc(a[1])}">${U.esc(a[2])} <i>&times;</i></button>`).join('') + '<button class="chip" data-k="all">Clear all</button>' : '';
  const without = a => { const g = Object.assign({}, S); FAC.forEach(f => g[f[0]] = S[f[0]].slice()); if (a[0] === 'q') g.q = ''; else if (a[0] === 'video') g.video = false; else g[a[0]] = g[a[0]].filter(x => x !== a[1]); return g; };
  const sg = act.map(a => [a, U.filterList(U.D.opps, without(a)).length]).filter(x => x[1] > list.length).sort((a, b) => b[1] - a[1]).slice(0, 3);
  $('#sug').innerHTML = sg.length && list.length < 6 ? '<small>Try instead</small>' + sg.map(x => `<a href="#" data-k="${x[0][0]}" data-v="${U.esc(x[0][1])}">Remove ${U.esc(x[0][2])} (${x[1]} results)</a>`).join('') : '';
  $('#rg').innerHTML = S.region.length === 1 ? U.guideHTML(S.region[0]) : '';
  let c = list.length + (list.length === 1 ? ' opportunity found' : ' opportunities found');
  if (S.subject.length && list.length) { const n = list.filter(o => S.subject.some(s => o.subjects.includes(s))).length; c += ` (${n} for this subject, ${list.length - n} open to all fields)`; } $('#cnt').textContent = c; $('#fdshow').textContent = 'Show ' + list.length + (list.length === 1 ? ' result' : ' results');
  const cty = S.country.length ? S.country.join(', ') : '';
  $('#grid').innerHTML = list.length ? list.slice(0, shown).map(U.card).join('') : `<div class="empty"><h3>${S.type.includes('Internship') && !realInt() ? 'No internships are listed yet' : cty ? 'No listings for ' + U.esc(cty) + ' with these filters yet' : 'No matches for these filters'}</h3><p class="mute">Remove a filter, or tell us your goals. We add new internships and scholarships regularly, and we also help with direct university opportunities that are not listed here.</p><a class="btn" href="pilots.html">Ask an advisor</a> <button class="btn out" data-k="all" type="button">Clear all</button></div>`;
  $('#more2').hidden = list.length <= shown;
}
function suggest() {
  const v = $('#q').value.trim().toLowerCase(), box = $('#sugg'); if (v.length < 2) { box.hidden = true; return; }
  const W = v.split(/\s+/), m = U0.D.opps.filter(o => W.every(w => (o.name + ' ' + o.sponsor + ' ' + o.countries.join(' ')).toLowerCase().includes(w))).slice(0, 6);
  box.hidden = !m.length; box.innerHTML = m.map(o => `<a href="${UP.oppUrl(o.id)}"><b>${UP.esc(o.name)}</b><span>${UP.esc(o.region)} · ${UP.esc(o.levels.map(l => UP.LV[l] || l).join('/'))}</span></a>`).join('');
}
function closePops() { $$('.pop').forEach(p => { p.hidden = true; }); $$('.fb[aria-expanded]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
UP.boot('find', U => {
  U0 = U; $('#sort').innerHTML = U.optHTML('sort'); buildFacets();
  if (first) {
    first = false; const p = new URLSearchParams(location.search); FAC.forEach(f => { const v = p.get(f[0]); if (v) S[f[0]] = v.split('|'); }); S.q = p.get('q') || ''; S.video = p.get('video') === '1'; S.sort = p.get('sort') || 'rec'; $('#q').value = S.q;
    U0.drawerInit(); $('#fdclear').onclick = () => { reset({}); draw(true); };
    document.addEventListener('click', e => {
      const fb = e.target.closest('.fb[aria-expanded]'); if (fb) { const pop = fb.nextElementSibling, open = pop.hidden; closePops(); pop.hidden = !open; fb.setAttribute('aria-expanded', open); return; }
      if (e.target.id === 'vb') { S.video = !S.video; draw(true); return; }
      const cl = e.target.closest('[data-clear]'); if (cl) { S[cl.dataset.clear] = []; draw(true); return; }
      const pr = e.target.closest('[data-pre]'); if (pr) { reset(PRE.filter(x => !(x[1].type && !hasInt()))[+pr.dataset.pre][1]); draw(true); return; }
      const ch = e.target.closest('#active [data-k],#sug [data-k],#grid [data-k]'); if (ch) { e.preventDefault(); const k = ch.dataset.k, v = ch.dataset.v; if (k === 'all') reset({}); else if (k === 'q') { S.q = ''; $('#q').value = ''; } else if (k === 'video') S.video = false; else S[k] = S[k].filter(x => x !== v); draw(true); return; }
      if (!e.target.closest('.fd')) closePops();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePops(); $('#sugg').hidden = true; } });
    document.addEventListener('change', e => { const cb = e.target.closest('.opt input'); if (cb) { const k = cb.closest('.fd').dataset.k; S[k] = $$('.opt input', cb.closest('.fd')).filter(x => x.checked).map(x => x.value); if (k === 'region' && S.region.length) S.country = S.country.filter(c => S.region.includes(U0.regionOf(c))); draw(true); } if (e.target.id === 'sort') { S.sort = e.target.value; draw(true); } });
    document.addEventListener('input', e => { if (e.target.id === 'q') { S.q = e.target.value.trim(); suggest(); draw(true); } else if (e.target.matches('.pop input[type=search]')) { const t = e.target.value.toLowerCase(); $$('.opt', e.target.closest('.pop')).forEach(el => { el.style.display = el.dataset.t.includes(t) ? '' : 'none'; }); } });
    $('#q').addEventListener('blur', () => setTimeout(() => { $('#sugg').hidden = true; }, 200)); $('#q').addEventListener('focus', suggest);
    $('#more2').onclick = () => { shown += 12; draw(false); };
    $('#share').onclick = e => { navigator.clipboard && navigator.clipboard.writeText(location.href); e.target.textContent = 'Link copied'; setTimeout(() => e.target.textContent = 'Copy link', 1800); };
  }
  $('#sort').value = S.sort;
  $('#presets').innerHTML = PRE.filter(x => !(x[1].type && !hasInt())).map((x, i) => `<button class="chip" data-pre="${i}" type="button">${x[0]}</button>`).join('');
  draw(false);
});
