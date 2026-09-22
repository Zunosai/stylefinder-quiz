import json, re

docs = json.load(open('archetypes_cols.json'))

LABELS = ['Style Icons','Elements of style','Elements of Style','Shadow Side',
          'Your Style Statement','Your Look','Hallmarks of your Style',
          'Hallmarks of Your Style','Your Fragrance','Top 10 Items',
          'Your beauty routine','Your Beauty Routine','Your StyleFinder',
          'Archetype','For more inspiration','Your Style']

def block(text, label):
    lines = [l.strip() for l in text.split('\n')]
    out, cap = [], False
    for s in lines:
        if not cap:
            if re.match(rf'^{re.escape(label)}\s*:?\s*$', s, re.I) or \
               re.match(rf'^{re.escape(label)}\s*:', s, re.I):
                cap = True
                rest = re.sub(rf'^{re.escape(label)}\s*:?', '', s, flags=re.I).strip()
                if rest: out.append(rest)
            continue
        if s in ('@@COL@@','@@PAGE@@'): break
        if any(re.match(rf'^{re.escape(L)}\s*:?', s, re.I) for L in LABELS): break
        if s: out.append(s)
        elif out: break
    return out

def clean(items, limit=90):
    res = []
    for x in items:
        x = re.sub(r'^[●•▪\-​]+\s*', '', x)
        x = re.sub(r'^\d+[\.\)]\s*', '', x)
        x = x.replace('​','').replace('­','').strip(' .\t')
        if x and len(x) <= limit and '@@' not in x:
            res.append(x)
    return res

out = {}
for key, d in docs.items():
    t = d['text']
    icons = clean(block(t,'Style Icons'))
    elems = clean(block(t,'Elements of style')) or clean(block(t,'Elements of Style'))
    shadow = clean(block(t,'Shadow Side'))
    hall = clean(block(t,'Hallmarks of your Style'), 120) or \
           clean(block(t,'Hallmarks of Your Style'), 120)

    # The quote may sit across a column/page marker from its label.
    stmt = re.search(
        r'Your Style\s*\n?\s*Statement\s*:?'
        r'(?:\s|\n|@@COL@@|@@PAGE@@)*[“"]([^”"]+)[”"]', t)
    desc = re.search(r'\{[^}]+\}\s*\n\s*([A-Z][^\n]{4,70})', t)

    out[key] = {
      'name': d['name'],
      'descriptor': re.sub(r'\s*[•,]\s*', ', ', desc.group(1).strip()) if desc else None,
      'styleIcons': icons[:6],
      'elements': elems[:8],
      'shadowSide': shadow[:6],
      'hallmarks': hall[:8],
      'statement': stmt.group(1).strip() if stmt else None,
    }

json.dump(out, open('archetype_fields.json','w'), indent=1)

miss = {k:[f for f in ('styleIcons','elements','shadowSide','descriptor','statement')
           if not out[k][f]] for k in out}
bad = {k:v for k,v in miss.items() if v}
print(f'parsed {len(out)}; incomplete: {len(bad)}')
for k,v in sorted(bad.items()): print(' ', k, '→ missing', v)
