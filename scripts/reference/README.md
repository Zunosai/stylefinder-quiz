# Blueprint reference data

`src/lib/blueprint/reference.ts` is generated from the StyleFinder source
documents — the per-StyleType Elements of Style cards and the 32 per-archetype
description sheets. It is what grounds a generated Blueprint in the real
system: without it the model invents style icons, colors and shadow sides.

## Regenerating

The source documents are not in this repo. Point these scripts at a directory
holding them (`archetypes/` and `styletypes/`), then copy the result over
`src/lib/blueprint/reference.ts`:

```bash
python3 -m venv .venv && .venv/bin/pip install pdfplumber
.venv/bin/python scripts/reference/extract-archetypes.py   # PDFs → column-aware text
.venv/bin/python scripts/reference/parse-archetypes.py     # text → fields
.venv/bin/python scripts/reference/parse-styletypes.py     # cards → fields
```

Then run the tests. `reference.test.ts` checks the extraction did not regress:
that every archetype has icons, a shadow side and a statement, that names agree
with the archetype table, and that no field holds runaway prose or a leaked
Word drawing id.

## Two things the extraction has to handle

**The archetype sheets are two-column PDFs.** Reading them linearly interleaves
the columns, so `extract-archetypes.py` crops each page at the midpoint and
reads the left column before the right.

**The Dramatic StyleType card predates the others.** It uses `Shadow side –`
rather than `Shadow Side:`, `Words & Qualities`, a prose intro instead of
`Most Important`, and tab-separated vocabulary that collapses into one run-on
string unless `<w:tab/>` is preserved as a separator. It has no Elements or
Silhouettes section at all — those fields are legitimately empty.

## Renamed archetypes

Three archetypes were renamed over the years. Some older source documents still
carry the retired name — when one does, the document is out of date, not the
code. Current names confirmed by Jim on 2026-09-22:

| Pairing | Current name | Retired name |
|---|---|---|
| Contemporary/Natural | **The Polished** | The Green Gal |
| Romantic/Sporty | **The Flirt** | The Enchantress |
| Natural/Dramatic | **The Artiste** | The Artist |

Tests in `archetypes.test.ts` pin each of these, so re-extracting from a stale
document fails rather than silently reintroducing an old name.
