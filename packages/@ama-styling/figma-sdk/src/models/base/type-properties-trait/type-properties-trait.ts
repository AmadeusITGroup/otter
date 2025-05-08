/**
 * Model: TypePropertiesTrait
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { TypeStyle } from '../type-style';

export interface TypePropertiesTrait {
  /** The raw characters in the text node. */
  characters: string;
  /** @see TypeStyle */
  style: TypeStyle;
  /** The array corresponds to characters in the text box, where each element references the 'styleOverrideTable' to apply specific styles to each character. The array's length can be less than or equal to the number of characters due to the removal of trailing zeros. Elements with a value of 0 indicate characters that use the default type style. If the array is shorter than the total number of characters, the characters beyond the array's length also use the default style. */
  characterStyleOverrides: number[];
  /** Internal property, preserved for backward compatibility. Avoid using this value. */
  layoutVersion?: number;
  /** Map from ID to TypeStyle for looking up style overrides. */
  styleOverrideTable: { [key: string]: TypeStyle; };
  /** An array with the same number of elements as lines in the text node, where lines are delimited by newline or paragraph separator characters. Each element in the array corresponds to the list type of a specific line. List types are represented as string enums with one of these possible values:  - `NONE`: Not a list item. - `ORDERED`: Text is an ordered list (numbered). - `UNORDERED`: Text is an unordered list (bulleted). */
  lineTypes: LineTypesEnum[];
  /** An array with the same number of elements as lines in the text node, where lines are delimited by newline or paragraph separator characters. Each element in the array corresponds to the indentation level of a specific line. */
  lineIndentations: number[];
}

export type LineTypesEnum = 'NONE' | 'ORDERED' | 'UNORDERED';

