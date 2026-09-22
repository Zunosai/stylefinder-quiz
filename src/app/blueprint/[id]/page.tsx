/**
 * The client-facing Blueprint page.
 *
 * Linked from her email. Styled for print, so "Save as PDF" from the browser
 * produces the premium document without a PDF dependency on the server.
 */

import { notFound } from 'next/navigation';
import { getBlueprintById } from '@/lib/blueprint/storage';
import { getSubmissionById } from '@/lib/supabase';
import { renderBlueprintHtml } from '@/lib/blueprint/render';
import PrintButton from './print-button';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const blueprint = await getBlueprintById(id);

  return {
    title: blueprint
      ? 'Your StyleFinder ID® Signature Style Blueprint'
      : 'Blueprint not found',
    // A Blueprint is personal; keep it out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function BlueprintPage({ params }: PageProps) {
  const { id } = await params;
  const blueprint = await getBlueprintById(id);

  if (!blueprint) notFound();

  const submission = blueprint.submission_id
    ? await getSubmissionById(blueprint.submission_id)
    : null;

  const firstName = submission?.user_name?.trim().split(/\s+/)[0] ?? '';
  const idLine = [
    blueprint.primary_style,
    blueprint.secondary_style,
    blueprint.supporting_style,
  ].join(' · ');

  const bodyHtml = renderBlueprintHtml(blueprint.markdown);

  return (
    <main className="min-h-screen bg-[#faf7f8] px-4 py-10 print:bg-white print:p-0">
      <article className="mx-auto max-w-3xl rounded-md bg-white px-8 py-12 shadow-sm sm:px-16 print:max-w-none print:rounded-none print:px-0 print:py-0 print:shadow-none">
        <header className="mb-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#b08ba0]">
            StyleFinder ID®
          </p>
          <h1 className="font-serif text-3xl text-gray-900">
            {firstName ? `${firstName}'s` : 'Your'} Signature Style Blueprint
          </h1>
          <p className="mt-2 text-sm text-gray-500">{idLine}</p>
          {blueprint.archetype && (
            <p className="mt-1 font-serif text-base italic text-[#9c5c74]">
              {blueprint.archetype}
            </p>
          )}
        </header>

        <div
          className="blueprint-body font-serif leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <footer className="mt-14 border-t border-[#f0e3e8] pt-6 text-xs text-gray-400">
          StyleFinder ID® Signature Style Blueprint
        </footer>
      </article>

      <PrintButton />
    </main>
  );
}
