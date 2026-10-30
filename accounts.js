// ======================================================================
// ACCOUNTS (sign in, My account, saved scholarships). One-time settings; nothing else to edit.
// Both values are PUBLIC by design and safe in a website: the database protects every private row itself.
// NEVER paste the "secret" or "service_role" key (or the database password) anywhere in this site.
// To switch accounts off, empty both values: the Sign in link disappears and everything else works as before.
// ======================================================================
window.CONFIG = window.CONFIG || {};
CONFIG.supabaseUrl = 'https://gqhqvwwdrnrxwgfolxvu.supabase.co';
CONFIG.supabaseKey = 'sb_publishable_LCGxrSs1aG-rq32DNMykNw_U_4zpIac';
// Sign in / My account is visible to everyone. To hide it again (for example while testing), change true to false.
CONFIG.accountsLaunch = true;
// "Continue with Google" button. Keep false until Google sign-in is set up in Supabase (Authentication, Sign In / Providers, Google).
CONFIG.googleSignIn = false;
// version of the privacy text people agree to (changes whenever the legal page text changes)
CONFIG.legal = CONFIG.legal || {};
CONFIG.legal.updated = '28 October 2026';
CONFIG.legacyForms = false;
CONFIG.whatsappRedirect = true;
CONFIG.googleSignIn = true;
CONFIG.cloudflare = true;