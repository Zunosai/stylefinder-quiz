import { describe, it, expect } from 'vitest';
import { STYLE_TYPE_REFERENCE, ARCHETYPE_REFERENCE } from '../reference';
import { ARCHETYPES, ALL_STYLE_TYPES, energyOf } from '../archetypes';
import { buildBlueprintRequest } from '../prompt';

describe('StyleType reference cards', () => {
  it('covers all eight StyleTypes', () => {
    for (const type of ALL_STYLE_TYPES) {
      expect(STYLE_TYPE_REFERENCE[type], type).toBeDefined();
    }
  });

  it('agrees with the archetype table about each type\'s energy', () => {
    for (const type of ALL_STYLE_TYPES) {
      expect(STYLE_TYPE_REFERENCE[type].energy, type).toBe(energyOf(type));
    }
  });

  it('carries the vocabulary and shadow side for every type', () => {
    for (const type of ALL_STYLE_TYPES) {
      expect(STYLE_TYPE_REFERENCE[type].words, type).not.toBe('');
      expect(STYLE_TYPE_REFERENCE[type].shadowSide, type).not.toBe('');
    }
  });

  it('carries color guidance for every type', () => {
    for (const type of ALL_STYLE_TYPES) {
      expect(STYLE_TYPE_REFERENCE[type].colors, type).not.toBe('');
    }
  });

  it('contains no leaked Word drawing ids', () => {
    const leaks: string[] = [];
    for (const [type, ref] of Object.entries(STYLE_TYPE_REFERENCE)) {
      for (const [field, value] of Object.entries(ref)) {
        if (typeof value === 'string' && /\d{6,}/.test(value)) {
          leaks.push(`${type}.${field}`);
        }
      }
    }
    expect(leaks).toEqual([]);
  });
});

describe('archetype reference sheets', () => {
  it('covers all 32 archetypes', () => {
    expect(Object.keys(ARCHETYPE_REFERENCE)).toHaveLength(32);
  });

  it('has a sheet for every pairing in the archetype table', () => {
    const missing = Object.keys(ARCHETYPES).filter(
      (key) => !ARCHETYPE_REFERENCE[key],
    );
    expect(missing).toEqual([]);
  });

  it('agrees with the archetype table on every name', () => {
    const disagreements: string[] = [];
    for (const [key, name] of Object.entries(ARCHETYPES)) {
      if (ARCHETYPE_REFERENCE[key]?.name !== name) {
        disagreements.push(
          `${key}: table="${name}" reference="${ARCHETYPE_REFERENCE[key]?.name}"`,
        );
      }
    }
    expect(disagreements).toEqual([]);
  });

  it('names style icons and a shadow side for every archetype', () => {
    for (const [key, ref] of Object.entries(ARCHETYPE_REFERENCE)) {
      expect(ref.styleIcons.length, `${key} icons`).toBeGreaterThan(0);
      expect(ref.shadowSide.length, `${key} shadow side`).toBeGreaterThan(0);
    }
  });

  it('carries a style statement for every archetype', () => {
    const without = Object.entries(ARCHETYPE_REFERENCE)
      .filter(([, ref]) => !ref.statement)
      .map(([key]) => key);
    expect(without).toEqual([]);
  });

  it('holds short field values, not runaway prose from the source layout', () => {
    // Two-column PDFs bleed the right column into the left when parsed
    // naively; an over-long icon or element is that failure resurfacing.
    const tooLong: string[] = [];
    for (const [key, ref] of Object.entries(ARCHETYPE_REFERENCE)) {
      for (const icon of ref.styleIcons) {
        if (icon.length > 40) tooLong.push(`${key} icon: ${icon}`);
      }
      for (const el of ref.elements) {
        if (el.length > 60) tooLong.push(`${key} element: ${el}`);
      }
    }
    expect(tooLong).toEqual([]);
  });
});

describe('the request sent for a client', () => {
  const request = buildBlueprintRequest({
    clientFirstName: 'Sarah',
    primary: 'Classic',
    secondary: 'Whimsical',
    supporting: 'Natural',
  });

  it('names her and her three StyleTypes', () => {
    expect(request).toContain('Sarah');
    expect(request).toContain('Classic (Yang)');
    expect(request).toContain('Whimsical (Yin)');
    expect(request).toContain('Natural (Yin)');
  });

  it('resolves the archetype', () => {
    expect(request).toContain('The Adventurer');
  });

  it('includes the reference material for all three StyleTypes', () => {
    expect(request).toContain('PRIMARY — Classic');
    expect(request).toContain('SECONDARY — Whimsical');
    expect(request).toContain('SUPPORTING — Natural');
  });

  it("includes the archetype's own icons and statement", () => {
    expect(request).toContain('Diane Keaton');
    expect(request).toContain('Classic with a Twist');
  });

  it('omits the archetype block for a same-energy pairing', () => {
    const sameEnergy = buildBlueprintRequest({
      clientFirstName: 'Ana',
      primary: 'Classic',
      secondary: 'Sporty',
      supporting: 'Natural',
    });
    expect(sameEnergy).not.toContain('ARCHETYPE —');
    expect(sameEnergy).toContain('PRIMARY — Classic');
  });
});
