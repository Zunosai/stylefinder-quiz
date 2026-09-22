import { describe, it, expect } from 'vitest';
import {
  ARCHETYPES,
  ALL_STYLE_TYPES,
  YANG_TYPES,
  YIN_TYPES,
  SCORING_VOCABULARY,
  getArchetype,
  energyOf,
  isYang,
  asStyleType,
  type StyleType,
} from '../archetypes';

describe('archetype table', () => {
  it('names all 32 opposite-energy pairings', () => {
    expect(Object.keys(ARCHETYPES)).toHaveLength(32);
  });

  it('covers every Yang primary with every Yin secondary, and the reverse', () => {
    const missing: string[] = [];

    for (const yang of YANG_TYPES) {
      for (const yin of YIN_TYPES) {
        if (!getArchetype(yang, yin)) missing.push(`${yang}/${yin}`);
        if (!getArchetype(yin, yang)) missing.push(`${yin}/${yang}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it('gives every pairing a distinct archetype name', () => {
    const names = Object.values(ARCHETYPES);
    expect(new Set(names).size).toBe(names.length);
  });

  it('treats order as meaningful — primary comes first', () => {
    // The pair that proves it: same two types, two different archetypes.
    expect(getArchetype('Classic', 'Whimsical')).toBe('The Adventurer');
    expect(getArchetype('Whimsical', 'Classic')).toBe('The Spirited');
  });

  it('returns null rather than inventing a name for same-energy pairings', () => {
    expect(getArchetype('Classic', 'Sporty')).toBeNull();
    expect(getArchetype('Natural', 'Romantic')).toBeNull();
  });

  it('contains no same-energy pairings', () => {
    const sameEnergy = Object.keys(ARCHETYPES).filter((key) => {
      const [primary, secondary] = key.split('/') as [StyleType, StyleType];
      return energyOf(primary) === energyOf(secondary);
    });

    expect(sameEnergy).toEqual([]);
  });
});

describe('energy classification', () => {
  it('splits the eight types four and four', () => {
    expect(YANG_TYPES).toHaveLength(4);
    expect(YIN_TYPES).toHaveLength(4);
    expect(ALL_STYLE_TYPES).toHaveLength(8);
  });

  it('assigns each type exactly one energy', () => {
    for (const type of ALL_STYLE_TYPES) {
      expect(energyOf(type)).toBe(isYang(type) ? 'Yang' : 'Yin');
    }
  });
});

describe('agreement with the scoring layer', () => {
  const { styleMapping, yangIds, yinIds } = SCORING_VOCABULARY;

  it('knows every style name the scoring can produce', () => {
    const unknown = Object.values(styleMapping).filter(
      (name) => asStyleType(name) === null,
    );

    expect(unknown).toEqual([]);
  });

  it('agrees with the scoring layer about which ids are Yang', () => {
    const disagreements = yangIds.filter(
      (id) => !isYang(styleMapping[id] as StyleType),
    );

    expect(disagreements).toEqual([]);
  });

  it('agrees with the scoring layer about which ids are Yin', () => {
    const disagreements = yinIds.filter((id) =>
      isYang(styleMapping[id] as StyleType),
    );

    expect(disagreements).toEqual([]);
  });

  it('rejects a name that is not a StyleType', () => {
    expect(asStyleType('Bohemian')).toBeNull();
    expect(asStyleType('')).toBeNull();
  });
});

describe('every result the scoring can produce resolves to an archetype', () => {
  // The scoring picks Secondary from the opposite energy of Primary. That
  // invariant is what makes the 32-row table exhaustive, so assert it here:
  // if the scoring ever stops honoring it, this fails rather than a client
  // receiving a Blueprint with a missing archetype.
  it('resolves for all 32 reachable primary/secondary combinations', () => {
    const unresolved: string[] = [];

    for (const primary of ALL_STYLE_TYPES) {
      const opposite = isYang(primary) ? YIN_TYPES : YANG_TYPES;

      for (const secondary of opposite) {
        if (!getArchetype(primary, secondary)) {
          unresolved.push(`${primary}/${secondary}`);
        }
      }
    }

    expect(unresolved).toEqual([]);
  });
});
