import os, re, json, zipfile
import pdfplumber

SRC = os.path.expanduser('~/Downloads/styletypes')
FIELDS = ['Words and Qualities','Words & Qualities','Shadow Side','Shadow side',
          'Most Important','Elements of Style','Colors','Patterns','Textures',
          'Silhouettes','For more inspiration']

def text_of(p):
    if p.lower().endswith('.pdf'):
        with pdfplumber.open(p) as pdf:
            return '\n'.join((pg.extract_text() or '') for pg in pdf.pages)
    with zipfile.ZipFile(p) as z:
        xml = z.read('word/document.xml').decode('utf8','ignore')
    xml = re.sub(r'</w:p>', '\n', xml)
    # A <w:tab/> separates list items; without this the legacy sheets'
    # tab-delimited vocabulary collapses into one run-on string.
    xml = re.sub(r'<w:tab\s*/>', ', ', xml)
    t = re.sub(r'<[^>]+>', '', xml).replace('&amp;','&')
    t = re.sub(r'(,\s*)+', ', ', t)
    return re.sub(r'^\s*,\s*', '', t, flags=re.M)

def normalize_labels(t):
    for L in FIELDS:
        t = re.sub(rf'(?<!\n)\s*\b{re.escape(L)}\s*:', f'\n{L}:', t)
    return t

def block(t, label):
    lines=[l.strip() for l in t.split('\n')]
    out,cap=[],False
    for s in lines:
        if not cap:
            if re.match(rf'^{re.escape(label)}\s*:?\s*$', s, re.I) or \
               re.match(rf'^{re.escape(label)}\s*:', s, re.I):
                cap=True
                rest=re.sub(rf'^{re.escape(label)}\s*:?','',s,flags=re.I).strip()
                if rest: out.append(rest)
            continue
        if any(re.match(rf'^{re.escape(L)}\s*:?', s, re.I) for L in FIELDS): break
        if s: out.append(s)
        elif out: break
    return ' '.join(out).strip(' .')

out={}
for f in sorted(os.listdir(SRC)):
    if f.startswith('.'): continue
    t = normalize_labels(text_of(os.path.join(SRC,f)))
    m = re.search(r'(Classic|Sporty|Dramatic|Contemporary|Natural|Whimsical|Delicate|Romantic)\s*/\s*(Yin|Yang)', t)
    if not m:
        m2 = re.search(r'(Classic|Sporty|Dramatic|Contemporary|Natural|Whimsical|Delicate|Romantic)', f)
        if not m2: print('SKIP', f); continue
        name, energy = m2.group(1), None
    else:
        name, energy = m.group(1), m.group(2)

    # The Dramatic sheet predates the others: an em-dash after "Shadow side",
    # an ampersand in "Words & Qualities", and a prose intro instead of
    # "Most Important". Accept both shapes.
    if not energy:
        e = re.search(r'The \w+ Type/(Yang|Yin)', t)
        energy = e.group(1) if e else None

    shadow = block(t,'Shadow Side') or block(t,'Shadow side')
    if not shadow:
        m2 = re.search(r'Shadow side\s*[–—-]\s*([^\n]+)', t, re.I)
        shadow = m2.group(1).strip() if m2 else ''
    shadow = re.sub(r'^[–—-]\s*', '', shadow)

    intro = ''
    im = re.search(r'The \w+ woman[^\n]*(?:\n(?!Shadow)[^\n]+)*', t)
    if im: intro = ' '.join(im.group(0).split())

    out[name] = {
      'energy': energy,
      'words': block(t,'Words and Qualities') or block(t,'Words & Qualities'),
      'shadowSide': shadow,
      'intro': intro,
      'mostImportant': block(t,'Most Important') or intro,
      'elements': block(t,'Elements of Style'),
      'colors': block(t,'Colors'),
      'patterns': block(t,'Patterns'),
      'textures': block(t,'Textures'),
      'silhouettes': block(t,'Silhouettes'),
      'file': f,
    }

def tidy(v):
    if not v: return v
    # Word anchors drawings with long numeric ids that survive tag-stripping.
    v = re.sub(r'\s*\d{6,}\s*', ' ', v)
    v = re.sub(r'(,\s*)+', ', ', v)          # collapse empty tab cells
    v = re.sub(r'(?<=[a-z])\s+(?=[A-Z][a-z])', ', ', v)  # join wrapped lines
    return re.sub(r'\s+', ' ', v).strip(' ,.')

for d in out.values():
    for f in ('words','shadowSide','mostImportant','elements','colors',
              'patterns','textures','silhouettes'):
        d[f] = tidy(d.get(f,''))

json.dump(out, open('styletype_fields.json','w'), indent=1)
print(f'parsed {len(out)} styletypes:', ', '.join(sorted(out)))
missing={k:[f for f,v in d.items() if f!='file' and not v] for k,d in out.items()}
for k,v in missing.items():
    if v: print('  ', k, 'missing', v)
