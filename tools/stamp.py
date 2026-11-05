#!/usr/bin/env python3
"""UNIPILOT GLOBAL: puts a version stamp (?v=xxxxxxxx) on every script and stylesheet address in every page.

Why: phones and Cloudflare keep copies of files for hours. After an update a phone could mix an OLD copy of one file with the NEW copy of another
and a page stops working (this happened with the pilot profile). With a stamp that changes whenever a file changes, the phone must fetch the new file.

Run in the website folder:   python3 tools/stamp.py
"""
import glob, hashlib, os, re, sys

root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
os.chdir(root)
names = sorted(glob.glob('assets/*.js') + ['assets/site.css', 'config.js', 'accounts.js', 'data/base.js', 'data/static-ids.js'])
h = hashlib.md5()
for n in names:
    if os.path.exists(n):
        h.update(n.encode()); h.update(open(n, 'rb').read())
v = h.hexdigest()[:8]
pat = re.compile(r'((?:src|href)=")((?:/?assets/[A-Za-z0-9_.-]+\.(?:js|css)|/?config\.js|/?accounts\.js|/?data/base\.js|/?data/static-ids\.js))(\?v=[0-9a-f]+)?(")')
n_files = 0
for f in glob.glob('*.html') + glob.glob('o/*.html') + glob.glob('pilot/*.html'):
    s = open(f, encoding='utf-8').read()
    t = pat.sub(lambda m: m.group(1) + m.group(2) + '?v=' + v + m.group(4), s)
    if t != s:
        open(f, 'w', encoding='utf-8').write(t); n_files += 1
print('Version stamp ' + v + ' written into ' + str(n_files) + ' pages')
