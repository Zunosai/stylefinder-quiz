import { describe, it, expect } from 'vitest';
import {
  coverLetter,
  ABOUT_MARY_MICHELE,
  assembleBlueprint,
} from '../boilerplate';

describe('boilerplate', () => {
  it('addresses the client by first name in the cover letter', () => {
    expect(coverLetter('Alice')).toContain('Bonjour Alice,');
  });

  it('signs the letter as Mary Michele', () => {
    expect(coverLetter('Eve')).toContain('Mary Michele Nidiffer');
    expect(coverLetter('Eve')).toContain('The Visibility Stylist');
  });

  it('keeps the About page fixed', () => {
    expect(ABOUT_MARY_MICHELE).toContain('StyleFinder ID® System');
    expect(ABOUT_MARY_MICHELE).toContain('@marymicheleofficial');
  });

  it('assembles front matter, body and back matter in order', () => {
    const doc = assembleBlueprint('Sarah', '## Your Signature Style\n\nBody.');
    const letter = doc.indexOf('Bonjour Sarah');
    const about = doc.indexOf('About Mary Michele');
    const body = doc.indexOf('Your Signature Style');
    const closing = doc.indexOf('Yes, You Do Have a Style');

    expect(letter).toBeGreaterThanOrEqual(0);
    expect(about).toBeGreaterThan(letter);
    expect(body).toBeGreaterThan(about);
    expect(closing).toBeGreaterThan(body);
  });
});
