import os, re, json, zipfile, sys
import pdfplumber

SRC = os.path.expanduser('~/Downloads/archetypes')
TYPES = r'(Classic|Sporty|Dramatic|Contemporary|Natural|Whimsical|Delicate|Romantic)'

def column_text(path):
    """Read each page as left column then right column, so a two-column
    layout does not interleave lines from both sides."""
    chunks = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            mid = page.width / 2
            left = page.crop((0, 0, mid, page.height)).extract_text() or ''
            right = page.crop((mid, 0, page.width, page.height)).extract_text() or ''
            chunks.append(left + '\n\n@@COL@@\n\n' + right)
    return '\n\n@@PAGE@@\n\n'.join(chunks)

def docx_text(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml').decode('utf8','ignore')
    xml = re.sub(r'</w:p>', '\n', xml)
    t = re.sub(r'<[^>]+>', '', xml)
    return t.replace('&amp;','&')

out = {}
for f in sorted(os.listdir(SRC)):
    if f.startswith('.') or f == 'The Archetypes.docx.pdf':
        continue
    p = os.path.join(SRC, f)
    try:
        txt = column_text(p) if f.lower().endswith('.pdf') else docx_text(p)
    except Exception as e:
        print('ERR', f, e, file=sys.stderr); continue

    pair = re.search(TYPES + r'\s*/\s*' + TYPES, txt[:2000])
    name = re.search(r'\{([^}]+)\}', txt[:2000])
    if not (pair and name):
        print('SKIP (no pairing/name)', f, file=sys.stderr); continue
    key = f'{pair.group(1)}/{pair.group(2)}'
    if key in out:
        continue
    out[key] = {'name': name.group(1).strip(), 'file': f, 'text': txt}

json.dump(out, open('archetypes_cols.json','w'), indent=1)
print(f'extracted {len(out)} archetypes')
