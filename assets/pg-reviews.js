let ready = false;
UP.boot('news', U => {
  const { C, $, esc, D } = U; $('#rl').innerHTML = D.reviews.map(U.reviewCard).join(''); U.car($('#rl')); $('#empty').hidden = D.reviews.length > 0;
  if (ready) return; ready = true;
  $('#rf').onsubmit = async e => {
    e.preventDefault(); if ($('#hp').value) return; const v = id => $('#' + id).value.trim(), out = $('#out'), btn = $('#go'), label = btn.textContent;
    const p = { action: 'review', website: '', Name: v('name'), Country: v('country'), Email: v('email'), Rating: (($('[name=rt]:checked')) || {}).value || '5', Result: v('res'), Review: v('rev') };
    btn.disabled = true; btn.textContent = 'Sending...';
    try { await U.send(p); out.innerHTML = '<div class="msg ok"><b>Thank you, ' + esc(p.Name) + '!</b> Your review has been received. We will publish it after a quick check.</div>'; e.target.reset(); } catch (err) { out.innerHTML = U.failBox(p, 'my review', err); }
    btn.disabled = false; btn.textContent = label; out.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
});
