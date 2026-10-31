let cat = '';
UP.boot('news', U => {
  const { $, esc, D } = U, cats = Array.from(new Set(D.news.map(n => n.cat)));
  $('#cats').innerHTML = D.news.length ? ['All'].concat(cats).map(c => `<button class="chip ${(c === 'All' ? '' : c) === cat ? 'on' : ''}" data-c="${esc(c === 'All' ? '' : c)}">${esc(c)}</button>`).join('') : '';
  $('#cats').onclick = e => { const b = e.target.closest('[data-c]'); if (b) { cat = b.dataset.c; render(); } };
  function render() { $$('.chip', $('#cats')).forEach(b => b.classList.toggle('on', b.dataset.c === cat)); const l = D.news.filter(n => !cat || n.cat === cat).sort((a, b) => b.pin - a.pin || b.date.localeCompare(a.date)); $('#nl').innerHTML = l.length ? l.map(U.newsCard).join('') : '<p class="mute">No news yet.</p>'; }
  const $$ = U.$$; render();
  const m = new Date().getMonth(), dl = D.opps.filter(o => !o.closed && o.months.includes(m)).slice(0, 8);
  $('#dl').innerHTML = dl.length ? dl.map(o => `<p style="margin:0 0 10px"><a href="${UP.oppUrl(o.id)}"><b>${esc(o.name)}</b></a><br><span class="mute" style="font-size:.88rem">${esc(o.deadline.replace(/\s*\(.*$/, ''))}</span></p>`).join('') : '<p class="mute" style="margin:0">No listed deadlines this month.</p>';
  const ra = D.opps.filter(o => o.added).sort((a, b) => String(b.added).localeCompare(String(a.added))).slice(0, 6);
  $('#ra').innerHTML = ra.length ? ra.map(o => `<p style="margin:0 0 10px"><a href="${UP.oppUrl(o.id)}"><b>${esc(o.name)}</b></a><br><span class="mute" style="font-size:.88rem">Added ${esc(U.fmtDate(o.added))}</span></p>`).join('') : '<p class="mute" style="margin:0">New listings will appear here as we add them.</p>';
});
