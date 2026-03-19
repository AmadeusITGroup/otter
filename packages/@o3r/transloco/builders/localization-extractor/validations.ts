/** Translation Validator */
export type ValidatorType = (str: string) => boolean;

/** Map of opening brackets to their closing counterparts */
const MAP_BRACKETS = {
  '[': ']',
  '{': '}',
  '(': ')'
} as const;

/** List of closing brackets */
const CLOSURE_BRACKETS: string[] = Object.values(MAP_BRACKETS);

/**
 * Check that the opened parentheses are correctly closed
 * @param str translation
 */
export function checkParentheses(str: string) {
  const stack: string[] = [];

  for (const ch of str) {
    if (MAP_BRACKETS[ch as keyof typeof MAP_BRACKETS]) {
      stack.push(ch);
    } else if (CLOSURE_BRACKETS.includes(ch)) {
      const tail = stack.pop();
      if (!tail) {
        return false;
      }
      const closure = MAP_BRACKETS[tail as keyof typeof MAP_BRACKETS];
      if (closure !== ch) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

/**
 * Check if the plural instruction always include an "other" case
 * @param str translation
 */
export function checkOtherInPlural(str: string) {
  if (/{[^,]*, *plural *, *.*}/.test(str)) {
    return /{.*other.*}/.test(str);
  }
  return true;
}

/**
 * List of validators to apply to the translations
 */
export const validators: ValidatorType[] = [
  checkParentheses,
  checkOtherInPlural
];
