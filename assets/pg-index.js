UP.boot('home', U => {
  const { C, $, esc, D, REGIONS, RDESC } = U;
  if (C.heroTitle) $('#h1').innerHTML = U.esc(C.heroTitle) + (C.heroEm ? ' <em>' + U.esc(C.heroEm) + '</em>' : ''); if (C.heroLead) $('#hl').textContent = C.heroLead;
  U.fill(['level', 'subject', 'region', 'country']);
  const fc = () => { const rg = $('#region').value, cur = $('#country').value, cs = Array.from(new Set(D.opps.filter(o => !rg || o.regions.includes(rg)).flatMap(o => o.countries))).filter(c => !rg || U.regionOf(c) === rg).sort(); $('#country').innerHTML = '<option value="">any country</option>' + cs.map(c => `<option>${esc(c)}</option>`).join(''); if (cs.includes(cur)) $('#country').value = cur; };
  $('#region').onchange = fc; fc();
  $('#fform').onsubmit = e => { e.preventDefault(); const p = new URLSearchParams(); ['level', 'subject', 'region', 'country'].forEach(k => $('#' + k).value && p.set(k, $('#' + k).value)); if ($('#hq').value.trim()) p.set('q', $('#hq').value.trim()); location.href = 'scholarships.html' + (p.toString() ? '?' + p : ''); };
  // Numbers on this page are real: they come from the database or from the lists you publish (see GUIDE-10).
  const L = U.liveStats(), sf = U.students(), st = [], stat = (n, label, plus) => `<div class="stat"><b data-n="${n}"${plus ? ' data-p="+"' : ''}>${U.fmtN(n)}${plus ? '+' : ''}</b><span>${label}</span></div>`;
  if (sf.n) st.push(stat(sf.n, 'students guided', sf.plus)); else if (L.students) st.push(stat(L.students, 'students registered'));
  const nSch = D.opps.filter(o => (o.type === 'Scholarship' || o.type === 'Internship') && !o.closed).length; if (nSch > 0) st.push(stat(nSch, 'scholarships &amp; internships listed'));
  const nReg = REGIONS.filter(r => D.opps.some(o => o.regions.includes(r[0]))).length; if (nReg > 0) st.push(stat(nReg, 'world regions covered'));
  if (L.sessions) st.push(stat(L.sessions, 'sessions completed'));
  if (L.pilots) st.push(stat(L.pilots, 'pilots ready to guide you'));
  if (U.seminarsHeld() > 0) st.push(stat(U.seminarsHeld(), 'free seminars held'));
  if (L.reviews) st.push(stat(L.reviews, 'reviews from students'));
  if (C.yearsExperience) st.push(`<div class="stat"><b>${C.yearsExperience}+</b><span>years of experience</span></div>`);
  $('#stats').innerHTML = st.slice(0, 5).join('');
  $('#tiles').innerHTML = REGIONS.map(r => { const ex = D.opps.filter(o => o.regions.includes(r[0])).slice(0, 3).map(o => o.name.replace(/\s*\(.*?\)/g, '').split(' ').slice(0, 3).join(' ')).join(', '); return `<a class="tile" style="--c:${r[1]}" href="scholarships.html?region=${encodeURIComponent(r[0])}"><h3>${esc(r[0])}</h3><p>${esc(RDESC[r[0]] || '')}${ex ? (RDESC[r[0]] ? '. ' : '') + 'Including ' + esc(ex) : ''}</p><span class="go">Explore &rarr;</span></a>`; }).join('');
  const t0 = new Date().toISOString().slice(0, 10), dl = o => Math.round((Date.parse(o.closes) - Date.parse(t0)) / 864e5), open = D.opps.filter(o => !o.closed);
  let soon = open.filter(o => o.closes && dl(o) >= 0 && dl(o) <= 45).sort((a, b) => dl(a) - dl(b)), ttl = 'Closing soon';
  if (soon.length < 3) { const mo = new Date().getMonth(), more = open.filter(o => o.months.includes(mo) && !soon.includes(o)).sort((a, b) => b.featured - a.featured); soon = soon.concat(more); ttl = soon.some(o => o.closes) ? 'Closing soon' : 'Deadlines this month'; }
  if (!soon.length) { soon = open.slice().sort((a, b) => b.featured - a.featured); ttl = 'Start exploring'; }
  $('#rtitle').textContent = ttl; $('#recent').innerHTML = soon.slice(0, 3).map(o => { const c = U.card(o), n = o.closes ? dl(o) : -1; return n >= 0 && n <= 45 ? c.replace('<div>', '<div><span class="pill bad">' + (n === 0 ? 'Closes today' : n === 1 ? '1 day left' : n + ' days left') + '</span>') : c; }).join('');
  const ft = D.news.filter(n => n.feat).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 3); $('#featS').hidden = !ft.length; $('#featL').innerHTML = ft.map(U.newsCard).join('');
  $('#svcs').innerHTML = C.services.slice(0, 4).map(v => `<div class="box svc">${U.icon(v.icon)}<h3>${esc(v.name)}</h3><p class="mute" style="margin:0;font-size:.92rem">${esc(v.desc)}</p></div>`).join('');
  const up = D.seminars.filter(x => x.up)[0], past = D.seminars.filter(x => !x.up && x.rec)[0];
  $('#semh').innerHTML = up ? U.semCard(up) : past ? U.semCard(past) : `<div class="semc"><h3>Next seminar coming soon</h3><p class="mute">Follow us to hear about the next free session first.</p>${C.facebook ? `<a class="btn" href="${esc(C.facebook)}" target="_blank" rel="noopener">Follow on Facebook</a>` : ''}</div>`;
  $('#revL').innerHTML = D.reviews.length ? D.reviews.slice(0, 12).map(U.reviewCard).join('') : '<div class="box c" style="grid-column:1/-1"><h3>Studied with us? Tell the next student how it went.</h3><p class="mute">Reviews are checked by our team before they are published.</p><a class="btn" href="reviews.html#rf">Write a review</a></div>'; U.car($('#revL'));
  const nw = D.news.slice().sort((a, b) => b.pin - a.pin || b.date.localeCompare(a.date)).slice(0, 3); $('#newsS').hidden = !nw.length; $('#newsL').innerHTML = nw.map(U.newsCard).join('');
});
