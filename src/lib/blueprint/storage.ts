/**
 * Blueprint persistence.
 *
 * A generated Blueprint is stored so it can be re-sent and re-rendered as a
 * PDF without regenerating it — and so the client and the coach always read
 * the same words. Regenerating inserts a new row rather than overwriting, so a
 * document that has already been delivered is never silently rewritten.
 */

import { getDbClient } from '../supabase';
import type { GeneratedBlueprint } from './generate';

export interface DbStyleBlueprint {
  id?: string;
  submission_id: string;
  markdown: string;
  primary_style: string;
  secondary_style: string;
  supporting_style: string;
  archetype: string | null;
  model: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_tokens?: number | null;
  generated_at?: string;
  generated_by?: string | null;
  email_sent?: boolean;
  email_sent_at?: string | null;
  email_error?: string | null;
  created_at?: string;
}

function client() {
  return getDbClient();
}

/** Store a freshly generated Blueprint. */
export async function saveBlueprint(
  submissionId: string,
  blueprint: GeneratedBlueprint,
  generatedBy: string,
): Promise<{ success: boolean; blueprintId?: string; error?: string }> {
  try {
    const row: DbStyleBlueprint = {
      submission_id: submissionId,
      markdown: blueprint.markdown,
      primary_style: blueprint.primary,
      secondary_style: blueprint.secondary,
      supporting_style: blueprint.supporting,
      archetype: blueprint.archetype,
      model: blueprint.model,
      input_tokens: blueprint.inputTokens,
      output_tokens: blueprint.outputTokens,
      cache_read_tokens: blueprint.cacheReadTokens,
      generated_at: blueprint.generatedAt,
      generated_by: generatedBy,
      email_sent: false,
    };

    const { data, error } = await client()
      .from('style_blueprints')
      .insert([row])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save blueprint:', error);
      return { success: false, error: error.message };
    }

    return { success: true, blueprintId: data.id };
  } catch (error: unknown) {
    console.error('Failed to save blueprint:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Fetch one Blueprint by id. */
export async function getBlueprintById(
  id: string,
): Promise<DbStyleBlueprint | null> {
  try {
    const { data, error } = await client()
      .from('style_blueprints')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to get blueprint:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get blueprint:', error);
    return null;
  }
}

/** The newest Blueprint for a submission, or null when none exists. */
export async function getLatestBlueprintForSubmission(
  submissionId: string,
): Promise<DbStyleBlueprint | null> {
  try {
    const { data, error } = await client()
      .from('style_blueprints')
      .select('*')
      .eq('submission_id', submissionId)
      .order('generated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Failed to get latest blueprint:', error);
      return null;
    }

    return data?.[0] ?? null;
  } catch (error) {
    console.error('Failed to get latest blueprint:', error);
    return null;
  }
}

/**
 * Which of these submissions already have a Blueprint.
 *
 * One query for the whole dashboard page rather than one per row.
 */
export async function findSubmissionsWithBlueprints(
  submissionIds: string[],
): Promise<Set<string>> {
  if (submissionIds.length === 0) return new Set();

  try {
    const { data, error } = await client()
      .from('style_blueprints')
      .select('submission_id')
      .in('submission_id', submissionIds);

    if (error) {
      console.error('Failed to look up blueprints:', error);
      return new Set();
    }

    return new Set((data ?? []).map((row) => row.submission_id as string));
  } catch (error) {
    console.error('Failed to look up blueprints:', error);
    return new Set();
  }
}

/** Record the outcome of emailing a Blueprint. */
export async function updateBlueprintEmailStatus(
  blueprintId: string,
  sent: boolean,
  error?: string,
): Promise<void> {
  try {
    await client()
      .from('style_blueprints')
      .update({
        email_sent: sent,
        email_sent_at: sent ? new Date().toISOString() : null,
        email_error: error ?? null,
      })
      .eq('id', blueprintId);
  } catch (err) {
    console.error('Failed to update blueprint email status:', err);
  }
}
