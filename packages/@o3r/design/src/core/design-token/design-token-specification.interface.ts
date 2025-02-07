import type {
  ItemIdentifier,
} from '@o3r/core';

/** Metadata information added in the design token extension for Metadata extraction */
export interface DesignTokenMetadata {
  tags?: string[];
  /** Description of the variable */
  label?: string;
  /** Name of a group of variables */
  category?: string;
  /** Component reference if the variable is linked to one */
  component?: ItemIdentifier;
}

/** Design Token Group Extension fields supported by the default renderer */
export interface DesignTokenGroupExtensions {
  /** Indicate the file where to generate the token */
  o3rTargetFile?: string;
  /**
   * Indicate that the variable does not need to be generated.
   * It is up to the generator to describe how to render private variables.
   * It can choose to ignore the private extension, it can provide a dedicated renderer (for example to prefix it with '_') or it can decide to skip the generation straight to its referenced value.
   */
  o3rPrivate?: boolean;
  /** Indicate that the value of this token is flagged as important */
  o3rImportant?: boolean;
  /** Metadata specific information */
  o3rMetadata?: DesignTokenMetadata;
  /** Scope of the Design Token value */
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
   * Indicate that the token is expected to be overridden by external rules
   */
  o3rExpectOverride?: boolean;
  /**
   * Explode a Token with complex type to generate variables for each field of the type definition
   */
  o3rExplodeComplexTypes?: boolean;
}

/** Design Token Extension fields supported by the default renderer */
export interface DesignTokenExtensions extends DesignTokenGroupExtensions {
}

interface DesignTokenBase<T> {
  /** Value of the Token */
  $value: T;

  /** Type of the Design Token */
  $type: string;
}

/** Design Token without explicit type (mainly alias) */
export interface DesignTokenTypeImplicit {
  /** Value of the Token */
  $value: string;

  /** @inheritdoc */
  $type?: undefined;
}

/** Design Token Color */
export interface DesignTokenTypeColor extends DesignTokenBase<string> {
  /** @inheritdoc */
  $type: 'color';
}

/** Design Token String */
export interface DesignTokenTypeString extends DesignTokenBase<string> {
  /** @inheritdoc */
  $type: 'string';
}

/** Design Token Dimension */
export interface DesignTokenTypeDimension extends DesignTokenBase<string> {
  /** @inheritdoc */
  $type: 'dimension';
}

/** Design Token Font Family */
export interface DesignTokenTypeFontFamily extends DesignTokenBase<string> {
  /** @inheritdoc */
  $type: 'fontFamily';
}

/** Design Token Duration */
export interface DesignTokenTypeDuration extends DesignTokenBase<number | string> {
  /** @inheritdoc */
  $type: 'duration';
}

type DesignTokenTypeCubicBezierValue = (number | string)[];

/** Design Token Cubic Bezier */
export interface DesignTokenTypeCubicBezier extends DesignTokenBase<DesignTokenTypeCubicBezierValue> {
  /** @inheritdoc */
  $type: 'cubicBezier';
}

type DesignTokenTypeFontWeightValue = number | string;

/** Design Token Font Weight */
export interface DesignTokenTypeFontWeight extends DesignTokenBase<DesignTokenTypeFontWeightValue> {
  /** @inheritdoc */
  $type: 'fontWeight';
}

/** Design Token Number */
export interface DesignTokenTypeNumber extends DesignTokenBase<number | string> {
  /** @inheritdoc */
  $type: 'number';
}

type DesignTokenTypeStrokeStyleDetailsValue = {
  dashArray: string[];
  lineCap: 'round' | 'butt' | 'square';
};

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- `string` type is added only due to Jest transpiling issue
type DesignTokenTypeStrokeStyleLiterals = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'outset' | 'inset' | string;

/** Value of the Design Token Stroke Style */
export type DesignTokenTypeStrokeStyleValue = DesignTokenTypeStrokeStyleDetailsValue | DesignTokenTypeStrokeStyleLiterals;

/** Design Token Stroke Style */
export interface DesignTokenTypeStrokeStyle<T extends DesignTokenTypeStrokeStyleValue = DesignTokenTypeStrokeStyleValue> extends DesignTokenBase<T> {
  /** @inheritdoc */
  $type: 'strokeStyle';
}

type DesignTokenTypeBorderValue = {
  color: string;
  width: string;
  style: DesignTokenTypeStrokeStyleValue;
};

/** Design Token Border */
export interface DesignTokenTypeBorder extends DesignTokenBase<DesignTokenTypeBorderValue> {
  /** @inheritdoc */
  $type: 'border';
}

type DesignTokenTypeTransitionValue = {
  duration: string;
  delay: string;
  timingFunction: string | DesignTokenTypeCubicBezierValue;

};

/** Design Token Transition */
export interface DesignTokenTypeTransition extends DesignTokenBase<DesignTokenTypeTransitionValue> {
  /** @inheritdoc */
  $type: 'transition';
}

type DesignTokenTypeShadowValue = {
  color: string;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
};

/** Design Token Shadow */
export interface DesignTokenTypeShadow extends DesignTokenBase<DesignTokenTypeShadowValue | DesignTokenTypeShadowValue[]> {
  /** @inheritdoc */
  $type: 'shadow';
}

type DesignTokenTypeGradientStop = {
  /** Color to the stop of a gradient */
  color: string;
  /** Position of the stop */
  position: string | number;
};

type DesignTokenTypeGradientValue = {
  /** Type of the gradient */
  type?: 'linear' | 'radial' | 'conic';
  /** Angle to the gradient */
  angle?: string | number;
  /** List of stops in the gradient */
  stops?: DesignTokenTypeGradientStop[];
};

/** Design Token Gradient */
export interface DesignTokenTypeGradient extends DesignTokenBase<DesignTokenTypeGradientValue> {
  /** @inheritdoc */
  $type: 'gradient';
}

type DesignTokenTypeTypographyValue = {
  fontFamily: string;
  fontSize: string;
  letterSpacing: string;
  fontWeight: DesignTokenTypeFontWeightValue;
  lineHeight: string | number;
};

/** Design Token Typography */
export interface DesignTokenTypeTypography extends DesignTokenBase<DesignTokenTypeTypographyValue> {
  /** @inheritdoc */
  $type: 'typography';
}

/** Common field for the Design Token Groups */
export interface DesignTokenGroupCommonFields<G extends DesignTokenExtensions> {
  /** Description of the Group */
  $description?: string;
  /** Design Token Extension */
  $extensions?: G;
}

/** Common field for the Design Token */
export type DesignTokenCommonFields<E extends DesignTokenExtensions = DesignTokenExtensions> = DesignTokenGroupCommonFields<E>;

/**
 * Design Token supported types with their $value structure
 * Note: this definition does not include the $extension and $description fields common to all of them (and to the Token Groups)
 */
type DesignTokenTypes =
  | DesignTokenTypeString
  | DesignTokenTypeColor
  | DesignTokenTypeDimension
  | DesignTokenTypeFontFamily
  | DesignTokenTypeDuration
  | DesignTokenTypeCubicBezier
  | DesignTokenTypeFontWeight
  | DesignTokenTypeNumber
  | DesignTokenTypeStrokeStyle
  | DesignTokenTypeBorder
  | DesignTokenTypeTransition
  | DesignTokenTypeShadow
  | DesignTokenTypeGradient
  | DesignTokenTypeTypography
  | DesignTokenTypeImplicit;

/** Available Design Token types */
export type DesignToken<E extends DesignTokenExtensions = DesignTokenExtensions> = DesignTokenCommonFields<E> & DesignTokenTypes;

/** Design Token Node (Design Token Group or Item) */
export type DesignTokenNode<E extends DesignTokenExtensions = DesignTokenExtensions, G extends DesignTokenGroupExtensions = E> = DesignTokenGroup<E, G> | DesignToken<E>;

/** Design Token Group */
export type DesignTokenGroup<E extends DesignTokenExtensions = DesignTokenExtensions, G extends DesignTokenGroupExtensions = E> =
  DesignTokenGroupCommonFields<G> & { [x: string]: DesignTokenNode<E, G> | E | string | boolean | undefined };

/** Design Token Group for common properties only */
export type DesignTokenGroupTemplate<G extends DesignTokenGroupExtensions = DesignTokenGroupExtensions> =
  DesignTokenGroupCommonFields<G> & { [x: string]: DesignTokenGroupTemplate<G> | G | string | boolean | undefined };

/** Context of the Design Token specification document */
export type DesignTokenContext<G extends DesignTokenGroupExtensions = DesignTokenGroupExtensions> = {
  /** Base path used to compute the path of the file to render the Tokens into */
  basePath?: string;

  /** Default template of the Design Token nodes to use as base for the extension configuration */
  template?: DesignTokenGroupTemplate<G>;
};

/** Design Token specification */
export type DesignTokenSpecification<C extends DesignTokenContext = DesignTokenContext, E extends DesignTokenExtensions = DesignTokenExtensions, G extends DesignTokenGroupExtensions = E> = {
  /** Specification as described on {@link https://design-tokens.github.io/community-group/format/} */
  document: DesignTokenGroup<E, G>;
  /** Specification document context information */
  context?: C;
};

/**
 * Determine if the Design Token Node is a Token (not a Group)
 * @param node Design Token Node
 */
export const isDesignToken = (node?: any): node is DesignToken => {
  return !!node && (typeof node.$type !== 'undefined' || typeof node.$value === 'string');
};

/**
 * Determine if the Design Token Node is a Group (not a Token)
 * @param node Design Token Node
 */
export const isDesignTokenGroup = (node?: any): node is DesignTokenGroup => {
  return typeof node === 'object' && Object.keys(node).some((k) => !k.startsWith('$'));
};

/**
 * Determine if the Stroke Style value is defined or is a reference
 * @param value Stroke Style value
 * @returns true if it is a defined value
 */
export const isTokenTypeStrokeStyleValueComplex = (value?: DesignTokenTypeStrokeStyleValue): value is DesignTokenTypeStrokeStyleDetailsValue => {
  return !!value && typeof value !== 'string';
};

/**
 * Determine if the Stroke Style Token has a value defined or is a reference
 * @param node Stroke Style Token
 * @returns true if it is a token with defined value
 */
export const isTokenTypeStrokeStyleComplex = (node?: DesignTokenTypeStrokeStyle): node is DesignTokenTypeStrokeStyle<DesignTokenTypeStrokeStyleDetailsValue> => {
  return !!node && isTokenTypeStrokeStyleValueComplex(node.$value);
};
