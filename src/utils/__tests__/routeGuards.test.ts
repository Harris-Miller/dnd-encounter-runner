import { describe, expect, it } from 'vitest';

import { hasProfileName } from '../profileName';

describe('hasProfileName', () => {
  it('returns false for null', () => {
    expect(hasProfileName(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(hasProfileName(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasProfileName('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(hasProfileName('   ')).toBe(false);
  });

  it('returns true for non-empty trimmed name', () => {
    expect(hasProfileName('Gandalf')).toBe(true);
  });

  it('returns true for name with surrounding whitespace', () => {
    expect(hasProfileName('  Gandalf  ')).toBe(true);
  });
});
