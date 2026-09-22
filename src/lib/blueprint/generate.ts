/**
 * Blueprint generation.
 *
 * Calls Claude to write a StyleFinder ID® Signature Style Blueprint from a
 * client's three StyleTypes. The instructions are sent as a cached system
 * prompt, so repeat generations pay roughly a tenth of the input cost for
 * that portion.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  BLUEPRINT_INSTRUCTIONS,
  buildBlueprintRequest,
  firstNameOf,
  type BlueprintSubject,
} from './prompt';
import { getArchetype, asStyleType, type StyleType } from './archetypes';
import type { StyleResult } from '../types';

export const BLUEPRINT_MODEL = 'claude-opus-5';

/** Streaming is required at this output size to avoid HTTP timeouts. */
const MAX_TOKENS = 16000;

export interface GeneratedBlueprint {
  /** The Blueprint itself, as Markdown. */
  markdown: string;
  primary: StyleType;
  secondary: StyleType;
  supporting: StyleType;
  /** Null when the pairing has no archetype (same-energy types). */
  archetype: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  generatedAt: string;
}

export class BlueprintError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'BlueprintError';
  }
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new BlueprintError(
      'ANTHROPIC_API_KEY is not set. Blueprint generation is unavailable.',
    );
  }
  client ??= new Anthropic();
  return client;
}

/** Whether generation is configured. Lets callers degrade rather than throw. */
export function isBlueprintConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Turn a scored quiz result into the three StyleTypes a Blueprint needs.
 *
 * Throws when a scored name is not one of the eight StyleTypes, rather than
 * passing an unknown name to the model and getting invented prose back.
 */
export function subjectFromResult(
  clientName: string,
  results: StyleResult,
): BlueprintSubject {
  const primary = asStyleType(results.primary.name);
  const secondary = asStyleType(results.secondary.name);
  const supporting = asStyleType(results.supporting.name);

  if (!primary || !secondary || !supporting) {
    const unknown = [
      !primary && results.primary.name,
      !secondary && results.secondary.name,
      !supporting && results.supporting.name,
    ].filter(Boolean);

    throw new BlueprintError(
      `Scored result contains unrecognized StyleTypes: ${unknown.join(', ')}`,
    );
  }

  return {
    clientFirstName: firstNameOf(clientName),
    primary,
    secondary,
    supporting,
  };
}

/**
 * Generate a Blueprint.
 *
 * Runs at high effort with adaptive thinking — this is a premium deliverable
 * generated a few at a time, so quality is worth the latency.
 */
export async function generateBlueprint(
  subject: BlueprintSubject,
): Promise<GeneratedBlueprint> {
  const anthropic = getClient();

  try {
    const stream = anthropic.messages.stream({
      model: BLUEPRINT_MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      system: [
        {
          type: 'text',
          text: BLUEPRINT_INSTRUCTIONS,
          // The instructions are identical for every client; only the short
          // user message below varies. Caching them cuts the cost of each
          // additional Blueprint to roughly a tenth on this portion.
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: buildBlueprintRequest(subject) }],
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === 'refusal') {
      throw new BlueprintError(
        `Generation was declined: ${message.stop_details?.explanation ?? 'no explanation given'}`,
      );
    }

    const markdown = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    if (!markdown) {
      throw new BlueprintError('Generation returned no text.');
    }

    if (message.stop_reason === 'max_tokens') {
      throw new BlueprintError(
        'Generation hit the output limit and the Blueprint is incomplete.',
      );
    }

    return {
      markdown,
      primary: subject.primary,
      secondary: subject.secondary,
      supporting: subject.supporting,
      archetype: getArchetype(subject.primary, subject.secondary),
      model: message.model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof BlueprintError) throw error;

    if (error instanceof Anthropic.AuthenticationError) {
      throw new BlueprintError('The Anthropic API key was rejected.', error);
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new BlueprintError(
        'Rate limited by the Anthropic API. Try again shortly.',
        error,
      );
    }
    if (error instanceof Anthropic.APIError) {
      throw new BlueprintError(
        `Anthropic API error ${error.status}: ${error.message}`,
        error,
      );
    }

    throw new BlueprintError('Blueprint generation failed.', error);
  }
}
