/**
 * Maximum allowed length for a user-provided regex pattern.
 */
const MAX_REGEX_LENGTH = 200;

/**
 * Patterns that indicate potential catastrophic backtracking (ReDoS).
 * These detect nested quantifiers and overlapping alternations that can
 * cause exponential time complexity.
 */
const UNSAFE_PATTERNS: RegExp[] = [
  // Nested quantifiers: (a+)+, (a*)+, (a+)*, (a*)*
  /(\(.+[+*]\))[+*]/,
  // Quantifier on a group that contains a quantifier: (x+y+)+
  /\([^)]*[+*][^)]*[+*][^)]*\)[+*]/,
  // Overlapping character classes with quantifier: ([\s\S]+)+, (.+.+)+
  /\(.+\+.+\+\)[+*]/,
  // Overlapping alternation with quantifier: (a|a)+, (\d|\d+)+
  /\([^)]*\|[^)]*\)[+*]/,
  // Group with quantifier repeated via {n,}: (a+){2,}, (a*){3,}
  /\([^)]*[+*][^)]*\)\{[^}]*,/
];

/**
 * Result of regex safety validation
 */
export interface RegexSafetyResult {
  /** Whether the regex is considered safe */
  safe: boolean;
  /** Error message if the regex is unsafe */
  error?: string;
}

/**
 * Validate that a regex pattern is safe from catastrophic backtracking (ReDoS).
 * Checks pattern length and detects common dangerous constructs like nested quantifiers.
 * @param pattern The regex pattern string to validate
 * @returns Validation result indicating whether the pattern is safe
 */
export function validateRegexSafety(pattern: string): RegexSafetyResult {
  if (pattern.length > MAX_REGEX_LENGTH) {
    return {
      safe: false,
      error: `Regex pattern is too long (${pattern.length} characters). Maximum allowed length is ${MAX_REGEX_LENGTH}.`
    };
  }

  for (const unsafePattern of UNSAFE_PATTERNS) {
    if (unsafePattern.test(pattern)) {
      return {
        safe: false,
        error: 'Regex pattern contains constructs that could cause catastrophic backtracking'
          + ' (e.g., nested quantifiers). Please simplify the pattern.'
      };
    }
  }

  return { safe: true };
}
