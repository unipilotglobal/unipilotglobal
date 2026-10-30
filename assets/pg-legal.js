UP.boot('', U => {
  const { C, $$ } = U, L = C.legal || {}, tbd = 'To be published once our business registration is complete.';
  const v = { brand: C.brand, legalName: L.legalName || C.brand, businessType: L.businessType || 'Online education consultancy and information service', owner: L.owner || tbd, registration: L.registration || 'Business registration is in progress. The licence details will be added here once issued.', address: L.address || tbd, phone: L.phone || 'Use the WhatsApp button on this website, or write to us by e-mail', email: C.email, website: /^https?:/.test(location.href) ? location.origin + location.pathname.replace(/[^/]*$/, '') : '', cancelHours: L.cancelHours || 24, refundDays: L.refundDays || 10, updated: L.updated || '', law: L.governingLaw || '' };
  $$('[data-l]').forEach(el => { el.textContent = v[el.dataset.l] || ''; });
  $$('[data-law]').forEach(el => { el.hidden = !v.law; });
  const ana = !!C.analyticsToken, cf = ana || !!C.turnstileSiteKey || C.cloudflare === true;
  $$('[data-ana="on"]').forEach(el => { el.hidden = !ana; }); $$('[data-ana="off"]').forEach(el => { el.hidden = ana; }); $$('[data-cf]').forEach(el => { el.hidden = !cf; }); $$('[data-legacy]').forEach(el => { el.hidden = C.legacyForms === false; });
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 80); }
});
