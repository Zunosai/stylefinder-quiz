/**
 * The Blueprint email to the client.
 */

import type { EmailTemplate } from '../types';
import { renderBlueprintHtml, renderBlueprintText } from './render';

export interface BlueprintEmailInput {
  clientName: string;
  clientEmail: string;
  markdown: string;
  archetype: string | null;
  primary: string;
  secondary: string;
  supporting: string;
  /** Absolute URL of the printable page, when one can be built. */
  viewUrl?: string;
}

export function generateBlueprintEmail(
  input: BlueprintEmailInput,
): EmailTemplate {
  const firstName = input.clientName.trim().split(/\s+/)[0] || 'there';

  const subject = input.archetype
    ? `${firstName}, your StyleFinder ID® Blueprint — ${input.archetype}`
    : `${firstName}, your StyleFinder ID® Signature Style Blueprint`;

  const idLine = `${input.primary} · ${input.secondary} · ${input.supporting}`;

  const intro = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                font-size:12px;text-transform:uppercase;letter-spacing:.18em;
                color:#b08ba0;margin-bottom:8px;">StyleFinder ID®</div>
    <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 6px;color:#2b2b2b;">
      Your Signature Style Blueprint
    </h1>
    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
              font-size:13px;color:#8a8a8a;margin:0 0 4px;">${idLine}</p>
    ${
      input.archetype
        ? `<p style="font-family:Georgia,serif;font-size:15px;font-style:italic;
                     color:#9c5c74;margin:0 0 28px;">${input.archetype}</p>`
        : '<div style="margin-bottom:28px;"></div>'
    }
  `;

  const viewLink = input.viewUrl
    ? `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                 font-size:13px;margin:32px 0 0;">
         <a href="${input.viewUrl}" style="color:#9c5c74;">View or print your Blueprint</a>
       </p>`
    : '';

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:32px 16px;background:#faf7f8;">
  <div style="max-width:640px;margin:0 auto;background:#fff;padding:40px 44px;
              border-radius:6px;font-family:Georgia,'Times New Roman',serif;
              line-height:1.7;color:#2b2b2b;">
    ${intro}
    ${renderBlueprintHtml(input.markdown)}
    ${viewLink}
  </div>
</body>
</html>`;

  const text = [
    'STYLEFINDER ID®',
    'Your Signature Style Blueprint',
    '',
    idLine,
    input.archetype ?? '',
    '',
    renderBlueprintText(input.markdown),
    input.viewUrl ? `\n\nView or print your Blueprint: ${input.viewUrl}` : '',
  ]
    .join('\n')
    .trim();

  return { to: input.clientEmail, subject, html, text };
}
