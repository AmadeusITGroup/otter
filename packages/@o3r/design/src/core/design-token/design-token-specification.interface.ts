/** Metadata information added in the design token extension for Metadata extraction */
export interface DesignTokenMetadata {
  tags?: string[];
  /** Description of the variable */
  label?: string;
  /** Name of a group of variables */
  category?: string;
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

/** Value of the Design Token Stroke Style */
export type DesignTokenTypeStrokeStyleValue = DesignTokenTypeStrokeStyleDetailsValue |
  'solid' | 'dashed' | 'dotted' | 'double'| 'groove' | 'ridge' | 'outset' | 'inset';

/** Design Token Stroke Style */
export interface DesignTokenTypeStrokeStyle<T extends DesignTokenTypeStrokeStyleValue = DesignTokenTypeStrokeStyleValue> extends DesignTokenBase<T> {
  /** @inheritdoc */
  $type: 'strokeStyle';
}

type DesignTokenTypeBorderValue = {
  color: string;
  width: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  style: string | DesignTokenTypeStrokeStyleValue;

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
export interface DesignTokenTypeShadow extends DesignTokenBase<DesignTokenTypeShadowValue> {
  /** @inheritdoc */
  $type: 'shadow';
}

type DesignTokenTypeGradientValue = {
  color: string;
  position: string | number;
}[];

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

/** Available Design Token types */
export type DesignToken<E extends DesignTokenExtensions = DesignTokenExtensions> = DesignTokenCommonFields<E> & (
  DesignTokenTypeColor |
  DesignTokenTypeDimension |
  DesignTokenTypeFontFamily |
  DesignTokenTypeDuration |
  DesignTokenTypeCubicBezier |
  DesignTokenTypeFontWeight |
  DesignTokenTypeNumber |

  DesignTokenTypeStrokeStyle |
  DesignTokenTypeBorder |
  DesignTokenTypeTransition |
  DesignTokenTypeShadow |
  DesignTokenTypeGradient |
  DesignTokenTypeTypography |

  DesignTokenTypeImplicit
);

/** Design Token Node (Design Token Group or Item) */
// eslint-disable-next-line no-use-before-define
export type DesignTokenNode<E extends DesignTokenExtensions = DesignTokenExtensions, G extends DesignTokenGroupExtensions = E> = DesignTokenGroup<E, G> | DesignToken<E>;

/** Design Token Group */
export type DesignTokenGroup<E extends DesignTokenExtensions = DesignTokenExtensions, G extends DesignTokenGroupExtensions = E> =
  DesignTokenGroupCommonFields<G> & { [x: string]: DesignTokenNode<E, G> | E | string | boolean | undefined };

/** Context of the Design Token Specification document */
export type DesignTokenContext = {
  /** Base path use to calculate the path of the file to render the Tokens to */
  basePath?: string;
};

/** Design Token Specification */
export type DesignTokenSpecification<C extends DesignTokenContext = DesignTokenContext, E extends DesignTokenExtensions = DesignTokenExtensions, G extends DesignTokenGroupExtensions = E> = {
  /** Specification as described on {@link https://design-tokens.github.io/community-group/format/} */
  document: DesignTokenGroup<E, G>;
  /** Information relative of the context of the specification document */
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
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const isTokenTypeStrokeStyleValueComplex = (value?: DesignTokenTypeStrokeStyleValue | string): value is DesignTokenTypeStrokeStyleDetailsValue => {
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
