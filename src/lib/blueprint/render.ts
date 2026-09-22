/**
 * Blueprint rendering.
 *
 * Turns the generated Markdown into the HTML used by both the client email and
 * the printable page. Deliberately a small hand-rolled renderer rather than a
 * Markdown dependency: the generator is instructed to emit a known, narrow
 * subset (headings, paragraphs, bullets, bold, italic), and email clients need
 * inline styles anyway.
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (char) => ESCAPES[char]);
}

/** Inline emphasis, applied after escaping so generated text cannot inject HTML. */
function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

/**
 * Render Blueprint Markdown to HTML.
 *
 * `standalone` wraps the result in a full document with print styles; the
 * email path uses the fragment.
 */
export function renderBlueprintHtml(
  markdown: string,
  options: { clientName?: string; standalone?: boolean } = {},
): string {
  const lines = markdown.split('\n');
  const out: string[] = [];

  let inList = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '') {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.min(heading[1].length + 1, 6); // h1 is the document title
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    if (/^---+$/.test(line)) {
      flushParagraph();
      closeList();
      out.push('<hr />');
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();

  const body = out.join('\n');

  if (!options.standalone) return body;

  const title = options.clientName
    ? `StyleFinder ID® Signature Style Blueprint — ${escapeHtml(options.clientName)}`
    : 'StyleFinder ID® Signature Style Blueprint';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 48px 24px;
    background: #faf7f8;
    color: #2b2b2b;
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1.7;
  }
  .sheet {
    max-width: 44rem;
    margin: 0 auto;
    background: #fff;
    padding: 56px 64px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,.08);
  }
  h1 { font-size: 1.75rem; letter-spacing: .01em; margin: 0 0 .25em; }
  h2 {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #9c5c74;
    margin: 2.5em 0 .75em;
    padding-bottom: .4em;
    border-bottom: 1px solid #f0e3e8;
  }
  h3 { font-size: 1.02rem; margin: 1.75em 0 .4em; color: #1f1f1f; }
  p { margin: 0 0 1em; }
  ul { margin: 0 0 1.25em; padding-left: 1.25em; }
  li { margin-bottom: .5em; }
  hr { border: 0; border-top: 1px solid #f0e3e8; margin: 2.5em 0; }
  .masthead {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: .7rem;
    text-transform: uppercase;
    letter-spacing: .18em;
    color: #b08ba0;
    margin-bottom: 2.5em;
  }
  .footer {
    margin-top: 3.5em;
    padding-top: 1.5em;
    border-top: 1px solid #f0e3e8;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: .75rem;
    color: #8a8a8a;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { box-shadow: none; padding: 0; max-width: none; }
    h2 { break-after: avoid; }
    h3 { break-after: avoid; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="masthead">StyleFinder ID®</div>
${body}
    <div class="footer">StyleFinder ID® Signature Style Blueprint</div>
  </div>
</body>
</html>`;
}

/** Plain-text fallback for the email's text part. */
export function renderBlueprintText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/^[-*+]\s+/gm, '  • ')
    .trim();
}
