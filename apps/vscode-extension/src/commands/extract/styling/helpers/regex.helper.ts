const baseSanitazer = '[\\.\\*\\,\\s\\~\\+\\[\\]\\=\\_\\^\\$\\"\\\'\\:\\(\\)\\#\\-\\{\\}\\&]';

export const regExp = {
  /**
   * Match the whole css selectors excluding imports, variables and comments
   */
  css: /.*{(.|(\r\n|\r|\n))*;/g,
  /**
   * Retrieves all selectors attributes without the content. Only the name with the opening bracket
   */
  allSelectors: /(?:\s?&?\.?)([^\s]*)(?:\s?)(?:{)/g,
  /**
   * Trim and sanitize all the characters matching
   * `.` `*` `,` ` ` `~` `+` `\` `=` `_` `^` `$` `"` `'` `:` `(` `)` `#` `{` `}` `&`
   */
  sanitizer: new RegExp(`${baseSanitazer}`, 'g'),
  /**
   * Trim and sanitize the start part of the string matching
   * `.` `*` `,` ` ` `~` `+` `\` `=` `_` `^` `$` `"` `'` `:` `(` `)` `#` `{` `}` `&`
   */
  trimLeft: new RegExp(`^${baseSanitazer}+`, 'g'),
  /**
   * Trim and sanitize the end part of the string matching
   * `.` `*` `,` ` ` `~` `+` `\` `=` `_` `^` `$` `"` `'` `:` `(` `)` `#` `{` `}` `&`
   */
  trimRight: new RegExp(`${baseSanitazer}+$`, 'g')
};
