#!/usr/bin/env python3
"""UNIPILOT GLOBAL: browser protection for every page (Content-Security-Policy).

What it does
  1. Moves the small script that sits inside each page (<script> ... </script>) into its own file assets/pg-<page>.js.
     A strict protection must be able to say "only scripts from my own files may run", and that needs scripts to live in files.
  2. Writes ONE protection line (a <meta http-equiv="Content-Security-Policy"> tag) near the top of every page. It tells the browser:
     only run scripts from this site (and Cloudflare's bot check), only talk to your Supabase project and the few services the site uses,
     show videos only from YouTube (privacy mode), never load plug-ins, and send forms only to this site.

When to run it (you normally never need to)
  - after you change your Supabase address in accounts.js, or add a new outside service the pages must talk to
  - after you add a new page
How:   python tools/set_csp.py        (run it in the website folder; then upload the changed files with GitHub Desktop)
It is safe to run again and again. It never touches config.js, accounts.js or content.xlsx.
"""
import re, sys, glob, os
from urllib.parse import urlparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def supabase_host():
    try:
        t = open(os.path.join(ROOT, 'accounts.js'), encoding='utf-8').read()
        m = re.search(r"supabaseUrl\s*=\s*'(https://[^']+)'", t)
        if m:
            u = urlparse(m.group(1))
            return 'https://' + u.hostname
    except OSError:
        pass
    return ''


def policy():
    sb = supabase_host()
    connect = ["'self'", sb, 'https://challenges.cloudflare.com', 'https://cloudflareinsights.com', 'https://docs.google.com',
               'https://formsubmit.co', 'https://api.web3forms.com', 'https://script.google.com', 'https://script.googleusercontent.com']
    parts = [
        "default-src 'self'",
        "script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self'",
        'connect-src ' + ' '.join(c for c in connect if c),
        'frame-src https://www.youtube-nocookie.com https://www.youtube.com https://challenges.cloudflare.com',
        "media-src 'self' https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
    ]
    return '; '.join(parts)


INLINE = re.compile(r'<script(?P<attrs>(?:\s+(?!src\b)(?!type\s*=\s*["\']application/ld\+json)[a-zA-Z-]+(?:\s*=\s*"[^"]*")?)*)\s*>(?P<body>.*?)</script>', re.S)


def process(path):
    name = os.path.splitext(os.path.basename(path))[0]
    html = open(path, encoding='utf-8').read()
    # redirect-only pages and the "page not found" page (it can be opened from any folder depth) are left alone
    if '<script src="config.js">' not in html:
        return False, False
    changed = False
    n = [0]

    def move(m):
        body = m.group('body')
        if not body.strip():
            return m.group(0)
        n[0] += 1
        out = 'assets/pg-%s.js' % name if n[0] == 1 else 'assets/pg-%s-%d.js' % (name, n[0])
        with open(os.path.join(ROOT, out), 'w', encoding='utf-8') as f:
            f.write(body.strip('\n') + '\n')
        return '<script src="%s"></script>' % out

    new = INLINE.sub(move, html)
    if new != html:
        html, changed = new, True
    tag = '<meta http-equiv="Content-Security-Policy" content="%s" data-csp><meta name="referrer" content="strict-origin-when-cross-origin" data-csp>' % policy()
    if 'data-csp' in html:
        new = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*data-csp>\s*<meta name="referrer"[^>]*data-csp>', lambda m: tag, html, count=1)
    else:
        new = re.sub(r'(<meta charset="utf-8">)', lambda m: m.group(1) + tag, html, count=1, flags=re.I)
        if new == html:
            raise SystemExit('No <meta charset> found in ' + path)
    if new != html:
        html, changed = new, True
    if changed:
        open(path, 'w', encoding='utf-8').write(html)
    return changed, True


def main():
    pages = sorted(glob.glob(os.path.join(ROOT, '*.html')))
    done = 0
    for p in pages:
        c, has = process(p)
        print(('updated  ' if c else 'unchanged') + '  ' + os.path.basename(p) + ('' if has else '   (redirect page, no protection needed)'))
        done += c
    print('\nDone: %d page(s) changed.' % done)
    if not supabase_host():
        print('WARNING: no Supabase address found in accounts.js, so the pages will not be allowed to talk to Supabase. Check accounts.js.')


if __name__ == '__main__':
    main()
