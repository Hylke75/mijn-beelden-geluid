"""Controleert of alle media-ID's die in de code/data worden genoemd bestaan, en of alle
beeldpaden in media.json en manifest.json naar een bestaand bestand verwijzen."""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(__file__), '..')
media = json.load(open(os.path.join(ROOT, 'src/data/media.json')))
ids = {m['id'] for m in media}
errors = []
for m in media:
    for k in ('src', 'thumb'):
        if m[k] and not os.path.exists(os.path.join(ROOT, 'public', m[k].lstrip('/'))): errors.append(f'ontbrekend bestand {m[k]}')
for e in json.load(open(os.path.join(ROOT, 'public/demo-media/manifest.json'))):
    for k in ('file', 'thumb'):
        if not os.path.exists(os.path.join(ROOT, 'public', e[k].lstrip('/'))): errors.append(f'manifest: ontbrekend {e[k]}')
pat = re.compile(r"['\"`/]((?:m|v|a)-(?:19|20|geluk|kerst|reis|nel|pieter|mila)[a-z0-9-]*)")
for dp, _, fs in os.walk(os.path.join(ROOT, 'src')):
    for f in fs:
        if not f.endswith(('.ts', '.tsx')): continue
        txt = open(os.path.join(dp, f)).read()
        for ref in set(pat.findall(txt)):
            if ref.endswith('-'): continue
            if ref not in ids and not ref.startswith('m-2024-beach-family-'): errors.append(f'{f}: onbekende media-id {ref}')
for f in ('full', 'thumbs'):
    for name in ['sk-zeeland', 'sk-bakken', 'sk-stad', 'sk-radio', 'sk-ijs']:
        if not os.path.exists(os.path.join(ROOT, 'public/demo-media', f, name + '.jpg')): errors.append(f'ontbrekende still {f}/{name}')
for p in ['sanne', 'thomas', 'mila', 'daan', 'pieter', 'ineke', 'marieke', 'nel']:
    if not os.path.exists(os.path.join(ROOT, 'public/demo-media/avatars', p + '.jpg')): errors.append(f'ontbrekende avatar {p}')
kinds = {}
for m in media: kinds[m['kind']] = kinds.get(m['kind'], 0) + 1
print('media per soort:', kinds)
print('\n'.join(errors) if errors else 'OK: alle verwijzingen en paden kloppen')
sys.exit(1 if errors else 0)
