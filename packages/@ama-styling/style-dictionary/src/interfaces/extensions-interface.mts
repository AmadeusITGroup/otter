import {
  type DesignTokenMetadata,
} from './metadata-interface.mjs';

/** Design Token Group Extension fields supported by the default renderer */
export interface DesignTokenGroupExtensions {
  /**
   * Indicate that the variable does not need to be generated.
   * It is up to the generator to describe how to render private variables.
   * It can choose to ignore the private extension, it can provide a dedicated renderer (for example to prefix it with '_') or it can decide to skip the generation straight to its referenced value.
   */
  o3rPrivate?: boolean;
  /**
   * Indicate that the value of this token is flagged as important
   * @example Css Generation of `my-var` with `o3rImportant: true`
   * ```css
   * :root {
   *   --my-var: #000 !important;
   * }
   * ```
   */
  o3rImportant?: boolean;
  /**
   * Metadata specific information
   * The metadata properties will be used only with the `o3r/<type>/metadata` formats
   */
  o3rMetadata?: DesignTokenMetadata;
  /**
   * Scope applied to the generated variable according to the language
   * @example Css Generation of `my-var` with `o3rScope: 'html .my-class'`
   * ```css
   * :root {
   *   html .my-class { --my-var: #000; }
   * }
   * ```
   */
  o3rScope?: string;
  /**
   * Convert a numeric value from the specified unit to the new unit.
   * It will add a unit to the token with type "number" for which the unit is not specified.
   * In case of complex type (such as shadow, transition, etc...), the unit will be applied to all numeric types in it.
   */
  o3rUnit?: string;
  /**
   * Ratio to apply to previous value.
   * The ratio will be applied only on token with "number" type or on the first numbers determined in "string" like types.
   * In case of complex type (such as shadow, transition, etc...), the ratio will be applied to all numeric types in it.
   */
  o3rRatio?: number;
  /**
   * Indicate that the Token is expected to be overridden by external rules
   * This is converted to the Style Dictionary {@link https://styledictionary.com/info/tokens/#design-token-attributes | themeable attribute}.
   */
  o3rExpectOverride?: boolean;
}

/** Design Token Extension fields supported by the default renderer */
export interface DesignTokenExtensions extends DesignTokenGroupExtensions {
}
