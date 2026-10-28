// ======================================================================
// ACCOUNTS (sign in, My account, saved scholarships). One-time settings; nothing else to edit.
// Both values are PUBLIC by design and safe in a website: the database protects every private row itself.
// NEVER paste the "secret" or "service_role" key (or the database password) anywhere in this site.
// To switch accounts off, empty both values: the Sign in link disappears and everything else works as before.
// ======================================================================
window.CONFIG = window.CONFIG || {};
CONFIG.supabaseUrl = 'https://gqhqvwwdrnrxwgfolxvu.supabase.co';
CONFIG.supabaseKey = 'sb_publishable_LCGxrSs1aG-rq32DNMykNw_U_4zpIac';
// PRIVATE TEST MODE: while this is false, visitors see no Sign in link and no Save buttons. The page unipilotglobal.com/account.html
// still works, so you can test it yourself. Change false to true on the day you want to announce accounts.
CONFIG.accountsLaunch = false;
// version of the privacy text people agree to (changes whenever the legal page text changes)
CONFIG.legal = CONFIG.legal || {};
CONFIG.legal.updated = '28 October 2026';
