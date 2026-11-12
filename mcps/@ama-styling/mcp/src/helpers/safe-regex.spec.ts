import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  validateRegexSafety,
} from './safe-regex';

describe('validateRegexSafety', () => {
  it('should accept simple valid patterns', () => {
    expect(validateRegexSafety('color')).toEqual({ safe: true });
    expect(validateRegexSafety('^--color-.*')).toEqual({ safe: true });
    expect(validateRegexSafety('primary|secondary')).toEqual({ safe: true });
    expect(validateRegexSafety('[a-z]+')).toEqual({ safe: true });
    expect(validateRegexSafety('\\d{1,3}')).toEqual({ safe: true });
  });

  it('should reject patterns exceeding maximum length', () => {
    const longPattern = 'a'.repeat(201);
    const result = validateRegexSafety(longPattern);

    expect(result.safe).toBe(false);
    expect(result.error).toContain('too long');
    expect(result.error).toContain('201');
    expect(result.error).toContain('200');
  });

  it('should accept patterns at exactly maximum length', () => {
    const maxPattern = 'a'.repeat(200);
    expect(validateRegexSafety(maxPattern)).toEqual({ safe: true });
  });

  it('should reject nested quantifiers like (a+)+', () => {
    const result = validateRegexSafety('(a+)+');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should reject nested quantifiers like (a*)*', () => {
    const result = validateRegexSafety('(a*)*');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should reject nested quantifiers like (a+)*', () => {
    const result = validateRegexSafety('(a+)*');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should reject patterns with multiple quantifiers in a repeated group', () => {
    const result = validateRegexSafety('(x+y+)+');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should reject overlapping quantified patterns in a group', () => {
    const result = validateRegexSafety('(.+.+)+');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should accept non-nested quantifier patterns', () => {
    expect(validateRegexSafety('(abc)+')).toEqual({ safe: true });
    expect(validateRegexSafety('a+b+c+')).toEqual({ safe: true });
  });

  it('should reject overlapping alternation with quantifier like (a|a)+', () => {
    const result = validateRegexSafety('(a|a)+');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should reject overlapping alternation with quantifier like (\\d|\\d+)+', () => {
    const result = validateRegexSafety('(\\d|\\d+)+');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should reject group with quantifier repeated via {n,} like (a+){2,}', () => {
    const result = validateRegexSafety('(a+){2,}');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });

  it('should reject group with quantifier repeated via {n,m} like (a*){3,10}', () => {
    const result = validateRegexSafety('(a*){3,10}');

    expect(result.safe).toBe(false);
    expect(result.error).toContain('catastrophic backtracking');
  });
});
