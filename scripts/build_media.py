"""Verwerkt kandidaatbeelden naar public/demo-media en schrijft src/data/media.json,
public/demo-media/manifest.json en public/demo-media/CREDITS.md.
Gebruik: python3 scripts/build_media.py <map-met-kandidaten> <map-met-pdf-beelden>"""
import json, os, sys
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
sys.path.insert(0, os.path.dirname(__file__))
from media_source import MEDIA, EXTRA_STILLS, AVATARS

CAND, PDF = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'public', 'demo-media')
for d in ('full', 'thumbs', 'avatars'): os.makedirs(os.path.join(OUT, d), exist_ok=True)
meta = json.load(open(os.path.join(CAND, 'meta.json')))
_rec = os.path.join(CAND, 'meta_recovered.json')
recovered = json.load(open(_rec)) if os.path.exists(_rec) else {}
MISSING = []

def src_path(pick):
    if pick.startswith('pdf:'): return os.path.join(PDF, pick[4:] + '.jpg')
    return os.path.join(CAND, pick + '.jpg')

def credit(pick):
    if pick.startswith('pdf:'):
        return {'source': 'Conceptpresentatie “Mijn Beeld & Geluid” (AI-gegenereerd beeld)', 'license': 'Gebruikt met toestemming van de opdrachtgever', 'creator': 'Beeld & Geluid (concept)', 'url': ''}
    slot, idx = pick.rsplit('_', 1)
    if slot in meta and int(idx) < len(meta[slot]): m = meta[slot][int(idx)]
    elif slot in recovered and idx in recovered[slot]: m = recovered[slot][idx]
    else:
        MISSING.append(pick); return {'source': 'onbekend', 'license': 'ONBEKEND', 'creator': 'onbekend', 'url': ''}
    lic = m.get('license', '')
    lic = (lic.upper() + ' ' + (m.get('license_version') or '')).strip() if m.get('source') != 'wikimedia' else lic
    return {'source': m.get('source') or 'onbekend', 'license': lic, 'creator': (m.get('creator') or 'onbekend')[:100], 'url': m.get('foreign_landing_url') or '', 'title': (m.get('title') or '')[:120]}

def treat(im, era):
    im = ImageOps.exif_transpose(im).convert('RGB')
    if era == 'bw':
        g = ImageOps.grayscale(im); g = ImageOps.autocontrast(g, cutoff=1)
        im = ImageOps.colorize(g, black='#151310', white='#F4EFE4', mid='#857c6c')
    elif era == 'eighties':
        im = ImageEnhance.Color(im).enhance(0.72)
        r, g, b = im.split(); r = r.point(lambda v: min(255, int(v * 1.05 + 10))); b = b.point(lambda v: int(v * 0.86 + 8))
        im = Image.merge('RGB', (r, g, b)); im = ImageEnhance.Contrast(im).enhance(0.9)
    elif era == 'nineties':
        im = ImageEnhance.Color(im).enhance(0.8)
        r, g, b = im.split(); r = r.point(lambda v: min(255, int(v * 1.02 + 12))); g = g.point(lambda v: min(255, int(v * 0.98 + 10))); b = b.point(lambda v: int(v * 0.9 + 14))
        im = Image.merge('RGB', (r, g, b)); im = ImageEnhance.Contrast(im).enhance(0.88)
    return im

def save(im, name, full_w=1600, thumb_w=720):
    full = im.copy(); full.thumbnail((full_w, full_w * 2), Image.LANCZOS)
    full.save(os.path.join(OUT, 'full', name + '.jpg'), quality=80, optimize=True, progressive=True)
    th = im.copy(); th.thumbnail((thumb_w, thumb_w * 2), Image.LANCZOS)
    th.save(os.path.join(OUT, 'thumbs', name + '.jpg'), quality=74, optimize=True, progressive=True)
    return full.size

out_media, manifest, credits = [], [], []
for m in MEDIA:
    item = {
        'id': m['id'], 'title': m['title'], 'dateTaken': m['date'], 'location': m['location'], 'peopleIds': m['people'], 'sourceId': m['source'],
        'kind': m['kind'], 'alt': m['title'] + ' — ' + m['desc'].split('.')[0], 'description': m['desc'], 'visibility': 'private',
        'favorite': bool(m.get('fav')), 'era': m['era'],
    }
    if m.get('story'): item['storyId'] = m['story']
    if m.get('dur'): item['duration'] = m['dur']
    if m.get('transcript'): item['transcript'] = m['transcript']
    if m.get('pick'):
        im = Image.open(src_path(m['pick']))
        if m.get('crop'):
            x0, y0, x1, y1 = m['crop']; W, H = im.size; im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
        im = treat(im, m['era'])
        w, h = save(im, m['id'])
        item.update({'src': f'/demo-media/full/{m["id"]}.jpg', 'thumb': f'/demo-media/thumbs/{m["id"]}.jpg', 'w': w, 'h': h})
        c = credit(m['pick'])
        credits.append((m['id'], c))
        manifest.append({'id': m['id'], 'file': item['src'], 'thumb': item['thumb'], 'alt': item['alt'], 'copyrightNote': f"{c['license']} · {c['creator']} · {c['source']}", 'sourceUrl': c.get('url', ''),
                         'personIds': m['people'], 'eventId': m['date'][:4], 'year': int(m['date'][:4])})
    else:
        item.update({'src': '', 'thumb': '', 'w': 1, 'h': 1})
    out_media.append(item)

for name, (pick, era) in EXTRA_STILLS.items():
    im = treat(Image.open(src_path(pick)), era); save(im, name)
    c = credit(pick); credits.append((name, c))
    manifest.append({'id': name, 'file': f'/demo-media/full/{name}.jpg', 'thumb': f'/demo-media/thumbs/{name}.jpg', 'alt': 'Plaatsvervangende still voor een fictief Schatkamer-conceptfragment', 'copyrightNote': f"{c['license']} · {c['creator']} · {c['source']}", 'sourceUrl': c.get('url', ''), 'personIds': [], 'eventId': 'schatkamer', 'year': 0})

for pid, (pick, (x0, y0, x1, y1)) in AVATARS.items():
    im = ImageOps.exif_transpose(Image.open(src_path(pick))).convert('RGB'); W, H = im.size
    box = [int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)]
    side = max(box[2] - box[0], box[3] - box[1]); cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    im = im.crop((max(0, cx - side // 2), max(0, cy - side // 2), min(W, cx + side // 2), min(H, cy + side // 2))).resize((256, 256), Image.LANCZOS)
    if pid == 'nel': im = treat(im, 'eighties')
    im.save(os.path.join(OUT, 'avatars', pid + '.jpg'), quality=82)
    c = credit(pick); credits.append(('avatar-' + pid, c))

json.dump(out_media, open(os.path.join(ROOT, 'src', 'data', 'media.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), ensure_ascii=False, indent=1)
with open(os.path.join(OUT, 'CREDITS.md'), 'w') as f:
    f.write('# Herkomst en licenties van de demo-beelden\n\nAlle personen, namen en verhalen in de demo zijn fictief. Personen op foto\'s zijn **niet** de fictieve familieleden; de beelden zijn illustratief.\n\n')
    f.write('- Beelden met bron “Conceptpresentatie” komen uit de presentatie *Mijn Beeld & Geluid* (AI-gegenereerd) en zijn met toestemming van de opdrachtgever gebruikt.\n')
    f.write('- Overige beelden zijn vrij gelicentieerd (CC0, publiek domein, CC BY of CC BY-SA) en via Openverse of Wikimedia Commons lokaal opgeslagen. Ze zijn bewerkt (uitsnede, verkleind, kleurbehandeling per tijdperk). Bewerkingen van CC BY-SA-werken vallen onder dezelfde licentie.\n\n')
    f.write('| Bestand | Licentie | Maker | Bron | Origineel |\n|---|---|---|---|---|\n')
    for name, c in credits:
        f.write(f"| {name} | {c['license']} | {c['creator'].replace('|', '/')} | {c['source']} | {c.get('url', '')} |\n")
print('media', len(out_media), 'manifest', len(manifest), 'missing credits', MISSING)
