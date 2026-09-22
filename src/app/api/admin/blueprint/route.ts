/**
 * Generate a StyleFinder ID® Signature Style Blueprint for a submission.
 *
 * Coach-triggered from the admin dashboard. The click is the approval: the
 * Blueprint is generated, stored, and emailed to the client in one request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import {
  generateBlueprint,
  subjectFromResult,
  isBlueprintConfigured,
  BlueprintError,
} from '@/lib/blueprint/generate';
import {
  saveBlueprint,
  updateBlueprintEmailStatus,
} from '@/lib/blueprint/storage';
import { generateBlueprintEmail } from '@/lib/blueprint/email';
import type { StyleResult } from '@/lib/types';

/** Generation runs at high effort and can take well over a minute. */
export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_TOKEN || 'admin123';
  return authHeader === `Bearer ${adminToken}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isBlueprintConfigured()) {
    return NextResponse.json(
      { error: 'Blueprint generation is not configured (ANTHROPIC_API_KEY).' },
      { status: 503 },
    );
  }

  let submissionId: string | undefined;
  try {
    ({ submissionId } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!submissionId) {
    return NextResponse.json(
      { error: 'Submission ID required' },
      { status: 400 },
    );
  }

  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    return NextResponse.json(
      { error: 'Submission not found' },
      { status: 404 },
    );
  }

  // The stored per-style scores are the scoring layer's own output; rebuild the
  // StyleResult shape from them rather than re-running the quiz scoring, so a
  // Blueprint always reflects the result the client was actually given.
  const results: StyleResult = {
    primary: {
      id: '',
      name: submission.primary_style,
      score: submission.primary_score,
    },
    secondary: {
      id: '',
      name: submission.secondary_style,
      score: submission.secondary_score,
    },
    supporting: {
      id: '',
      name: submission.supporting_style,
      score: submission.supporting_score,
    },
    allScores: submission.scores,
  };

  try {
    const subject = subjectFromResult(submission.user_name, results);
    const blueprint = await generateBlueprint(subject);

    const stored = await saveBlueprint(submissionId, blueprint, 'admin');
    if (!stored.success) {
      // The prose exists but could not be persisted. Return it rather than
      // discarding work the client already paid for, and say so plainly.
      return NextResponse.json(
        {
          error: `Blueprint generated but could not be saved: ${stored.error}`,
          markdown: blueprint.markdown,
          saved: false,
          emailed: false,
        },
        { status: 500 },
      );
    }

    const origin =
      process.env.APP_URL ?? request.nextUrl.origin ?? undefined;

    const email = generateBlueprintEmail({
      clientName: submission.user_name,
      clientEmail: submission.user_email,
      markdown: blueprint.markdown,
      archetype: blueprint.archetype,
      primary: blueprint.primary,
      secondary: blueprint.secondary,
      supporting: blueprint.supporting,
      viewUrl: origin
        ? `${origin}/blueprint/${stored.blueprintId}`
        : undefined,
    });

    let emailed = false;
    let emailError: string | undefined;
    try {
      emailed = await sendEmail(email);
      if (!emailed) emailError = 'Email was not sent (disabled or rate limited)';
    } catch (err: unknown) {
      emailError = err instanceof Error ? err.message : 'Email failed';
    }

    await updateBlueprintEmailStatus(stored.blueprintId!, emailed, emailError);

    return NextResponse.json({
      success: true,
      blueprintId: stored.blueprintId,
      archetype: blueprint.archetype,
      markdown: blueprint.markdown,
      saved: true,
      emailed,
      emailError,
      usage: {
        inputTokens: blueprint.inputTokens,
        outputTokens: blueprint.outputTokens,
        cacheReadTokens: blueprint.cacheReadTokens,
      },
    });
  } catch (error) {
    if (error instanceof BlueprintError) {
      console.error('Blueprint generation failed:', error.message, error.cause);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error('Blueprint generation failed:', error);
    return NextResponse.json(
      { error: 'Blueprint generation failed' },
      { status: 500 },
    );
  }
}
