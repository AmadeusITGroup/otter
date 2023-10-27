/** Translation Validator */
export type ValidatorType = (str: string) => boolean;

/**
 * Check that the opened parentheses are correctly closed
 *
 * @param str translation
 */
export function checkParentheses(str: string) {
  /* eslint-disable @typescript-eslint/naming-convention */
  const mapBrackets: Record<string, string> = {
    '[': ']',
    '{': '}',
    '(': ')'
  };
  /* eslint-enable @typescript-eslint/naming-convention */
  const closureBrackets = Object.keys(mapBrackets).map((k) => mapBrackets[k]);
  const stack: string[] = [];

  for (const ch of str) {
    if (mapBrackets[ch]) {
      stack.push(ch);
    } else if (closureBrackets.indexOf(ch) >= 0) {
      const tail = stack.pop();
      if (!tail) {
        return false;
      }
      const closure = mapBrackets[tail];
      if (closure !== ch) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

/**
 * Check if the plural instruction always include an "other" case
 *
 * @param str translation
 */
export function checkOtherInPlural(str: string) {
  if (/\{[^,]*, *plural *, *.*\}/.test(str)) {
    return /\{.*other.*\}/.test(str);
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
