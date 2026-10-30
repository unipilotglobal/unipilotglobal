UP.boot('seminars', U => {
  const { C, $, esc, D } = U, up = D.seminars.filter(s => s.up).sort((a, b) => a.date.localeCompare(b.date)), past = D.seminars.filter(s => !s.up).sort((a, b) => b.date.localeCompare(a.date));
  if (U.seminarsHeld() > 0) $('#hl').textContent = 'We have hosted ' + U.seminarsHeld() + ' free seminars on scholarships, applications and studying abroad. Join the next one or watch the recordings.';
  $('#up').innerHTML = up.length ? up.map(U.semCard).join('') : `<div class="box" style="grid-column:1/-1"><h3>The next seminar will be announced soon</h3><p class="mute">Follow us on Facebook or subscribe to deadline alerts to hear first.</p>${C.facebook ? `<a class="btn" href="${esc(C.facebook)}" target="_blank" rel="noopener">Follow on Facebook</a>` : ''}</div>`;
  $('#pastS').hidden = !past.length; $('#past').innerHTML = past.map(U.semCard).join('');
  $('#vidS').hidden = !D.videos.length; $('#vids').innerHTML = D.videos.map(U.videoCard).join('');
  $('#follow').innerHTML = (C.facebook ? `<a class="btn" href="${esc(C.facebook)}" target="_blank" rel="noopener">Follow on Facebook</a> ` : '') + (C.youtubeChannel ? `<a class="btn out" href="${esc(C.youtubeChannel)}" target="_blank" rel="noopener">Subscribe on YouTube</a>` : '');
});
