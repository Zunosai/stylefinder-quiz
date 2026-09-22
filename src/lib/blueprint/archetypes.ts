/**
 * StyleFinder ID® archetypes.
 *
 * An archetype is the name for a Primary + Secondary StyleType pairing — the
 * lens the Blueprint uses to describe how those two energies interact.
 *
 * Order matters: Classic/Whimsical (The Adventurer) and Whimsical/Classic
 * (The Spirited) are different archetypes. The first name is always Primary.
 *
 * Source: the per-archetype reference documents, each of which states its own
 * pairing and name.
 *
 * Three archetypes were renamed over the years, and some older summary
 * documents still carry the retired name. The names below are the current
 * ones, confirmed by Jim on 2026-09-22:
 *
 *   Contemporary/Natural — The Polished, formerly "The Green Gal"
 *   Romantic/Sporty      — The Flirt, formerly "The Enchantress"
 *   Natural/Dramatic     — The Artiste, formerly "The Artist"
 *
 * If a source document shows a retired name, the document is out of date.
 */

import { YANG_STYLES, YIN_STYLES, STYLE_MAPPING } from '@/data/quiz-data';

/** The four Yang StyleTypes. */
export const YANG_TYPES = ['Classic', 'Sporty', 'Dramatic', 'Contemporary'] as const;

/** The four Yin StyleTypes. */
export const YIN_TYPES = ['Natural', 'Whimsical', 'Delicate', 'Romantic'] as const;

export type YangType = (typeof YANG_TYPES)[number];
export type YinType = (typeof YIN_TYPES)[number];

/** Any of the eight StyleTypes. */
export type StyleType = YangType | YinType;

export const ALL_STYLE_TYPES: readonly StyleType[] = [...YANG_TYPES, ...YIN_TYPES];

/**
 * Every Primary/Secondary pairing, keyed `${primary}/${secondary}`.
 *
 * The scoring always draws Secondary from the opposite energy of Primary, so
 * the 32 Yang/Yin and Yin/Yang pairings below are exhaustive for real results.
 * Same-energy pairings (Classic/Sporty) cannot occur and are absent.
 */
export const ARCHETYPES: Record<string, string> = {
  // Yang primary, Yin secondary
  'Dramatic/Natural': 'The Bon Vivant',
  'Dramatic/Delicate': 'The Demure Diva',
  'Dramatic/Romantic': 'The Sensualist',
  'Dramatic/Whimsical': 'The Ingenue',

  'Classic/Natural': 'The Genuine',
  'Classic/Delicate': 'The Gracious',
  'Classic/Romantic': 'The Sentimental',
  'Classic/Whimsical': 'The Adventurer',

  'Contemporary/Natural': 'The Polished',
  'Contemporary/Delicate': 'The Cosmopolitan',
  'Contemporary/Romantic': 'The Superstar',
  'Contemporary/Whimsical': 'The Trendsetter',

  'Sporty/Natural': 'The Elemental',
  'Sporty/Delicate': 'The Subdued',
  'Sporty/Romantic': 'The Impulsive',
  'Sporty/Whimsical': 'The Playful Muse',

  // Yin primary, Yang secondary
  'Natural/Dramatic': 'The Artiste',
  'Delicate/Dramatic': 'The Primadonna',
  'Romantic/Dramatic': 'The Bohemian',
  'Whimsical/Dramatic': 'The Creative',

  'Natural/Classic': 'The Girl Next Door',
  'Delicate/Classic': 'The Darling',
  'Romantic/Classic': 'The Nostalgic',
  'Whimsical/Classic': 'The Spirited',

  'Natural/Contemporary': 'The Essential',
  'Delicate/Contemporary': 'The Understated',
  'Romantic/Contemporary': 'The Charmer',
  'Whimsical/Contemporary': 'The Fanciful',

  'Natural/Sporty': 'The Easy Going',
  'Delicate/Sporty': 'The Informal',
  'Romantic/Sporty': 'The Flirt',
  'Whimsical/Sporty': 'The Clever',
};

/**
 * Look up the archetype for a Primary/Secondary pairing.
 *
 * Returns `null` when the pairing has no archetype — which happens only if
 * both types share an energy. The Blueprint omits the archetype line in that
 * case rather than inventing a name.
 */
export function getArchetype(
  primary: StyleType,
  secondary: StyleType,
): string | null {
  return ARCHETYPES[`${primary}/${secondary}`] ?? null;
}

/** Whether a StyleType belongs to the Yang energy. */
export function isYang(type: StyleType): type is YangType {
  return (YANG_TYPES as readonly string[]).includes(type);
}

/** The energy a StyleType belongs to. */
export function energyOf(type: StyleType): 'Yang' | 'Yin' {
  return isYang(type) ? 'Yang' : 'Yin';
}

/**
 * Narrow a scored style name to a `StyleType`.
 *
 * `STYLE_MAPPING` in quiz-data.ts is the source of these names; this guards the
 * boundary so a rename there surfaces here rather than producing a Blueprint
 * addressed to a type that does not exist.
 */
export function asStyleType(name: string): StyleType | null {
  return (ALL_STYLE_TYPES as readonly string[]).includes(name)
    ? (name as StyleType)
    : null;
}

/**
 * The scoring layer's A–H ids map onto the same eight names used here. Exported
 * so a test can prove the two vocabularies stay in sync.
 */
export const SCORING_VOCABULARY = {
  styleMapping: STYLE_MAPPING,
  yangIds: YANG_STYLES,
  yinIds: YIN_STYLES,
} as const;
