import type {
  DesignToken,
  DesignTokenContext,
  DesignTokenExtensions,
  DesignTokenGroup,
  DesignTokenGroupExtensions
} from '../design-token-specification.interface';

/** Reference to a parent node */
export interface ParentReference {
  /** Design Token name */
  name: string;
  /** Design Token Group node */
  tokenNode: DesignTokenGroup;
}

/** Reference to a node */
export interface NodeReference {
  /** Design Token name */
  name: string;
  /** Design Token Group node */
  tokenNode: DesignTokenGroup | DesignToken;
}

/**
 * Function rendering the Design Token Value
 * @param tokenStructure Parsed Design Token
 * @param variableSet Complete list of the parsed Design Token
 * @param enforceReferenceRendering Renderer the variable as reference
 */
// eslint-disable-next-line no-use-before-define
export type TokenValueRenderer = (tokenStructure: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>, enforceReferenceRendering?: boolean) => string;

/**
 * Function rendering the Design Token reference
 * @param tokenStructure Parsed Design Token
 * @param variableSet Complete list of the parsed Design Token
 * @param defaultValue Default value to use if the reference is made to an undefined variable
 */
// eslint-disable-next-line no-use-before-define
export type TokenReferenceRenderer = (tokenStructure: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>, defaultValue?: string) => string;

/**
 * Function rendering the Design Token reference not registered
 * @param referenceName Name of the un registered variable
 * @param variableSet Complete list of the parsed Design Token
 */
// eslint-disable-next-line no-use-before-define
export type UnregisteredTokenReferenceRenderer = (referenceName: string, variableSet: Map<string, DesignTokenVariableStructure>) => string;

/**
 * Function rendering the Design Token reference not registered
 * @param referenceName Name of the un registered variable
 * @param variableSet Complete list of the parsed Design Token
 * @deprecated duplicate of {@link UnregisteredTokenReferenceRender}, will be removed on v13
 */
// eslint-disable-next-line no-use-before-define
export type UnregisteredTokenReferenceRender = (referenceName: string, variableSet: Map<string, DesignTokenVariableStructure>) => string;

/**
 * Function rendering the Design Token reference
 * @param tokenStructure Parsed Design Token
 * @param variableSet Complete list of the parsed Design Token
 * @deprecated duplicate of {@link TokenReferenceRenderer}, will be removed on v13
 */
// eslint-disable-next-line no-use-before-define
export type TokenReferenceRender = (tokenStructure: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => string;

/**
 * Function rendering the Design Token Key
 * @param tokenStructure Parsed Design Token
 */
// eslint-disable-next-line no-use-before-define
export type TokenKeyRenderer = (tokenStructure: DesignTokenVariableStructure) => string;

/** Complete list of the parsed Design Token */
// eslint-disable-next-line no-use-before-define
export type DesignTokenVariableSet = Map<string, DesignTokenVariableStructure>;

/** Parsed Design Token variable */
export interface DesignTokenVariableStructure {
  /** Context of the Token determined or provided during the parsing process */
  context?: DesignTokenContext;
  /** Design Token Extension */
  extensions: DesignTokenGroupExtensions & DesignTokenExtensions;
  /** Reference to the Design Token node */
  node: DesignToken;
  /** Name of the token in references */
  tokenReferenceName: string;
  /** Description of the Token */
  description?: string;
  /** List of the Ancestors references */
  ancestors: ParentReference[];
  /** Reference to the direct parent node */
  parent?: ParentReference;
  /**
   * Retrieve the list of the references of the Design Token
   * @param variableSet Complete list of the parsed Design Token
   */
  getReferences: (variableSet?: DesignTokenVariableSet) => string[];
  /**
   * Raw CSS value of the Token
   * @param variableSet Complete list of the parsed Design Token
   */
  getCssRawValue: (variableSet?: DesignTokenVariableSet) => string;
  /**
   * Determine if the Token is an alias
   * @param variableSet Complete list of the parsed Design Token
   */
  getIsAlias: (variableSet?: DesignTokenVariableSet) => boolean;
  /**
   * Retrieve the type calculated for the Token
   * @param followReference Determine if the references should be follow to calculate the type
   * @param variableSet Complete list of the parsed Design Token
   */
  getType: (variableSet?: DesignTokenVariableSet, followReference?: boolean) => DesignToken['$type'];
  /**
   * Retrieve the list of the references of the Design Token node
   * @param followReference Determine if the references should be follow to calculate the type
   */
  getReferencesNode: (variableSet?: DesignTokenVariableSet) => DesignTokenVariableStructure[];
  /**
   * Retrieve the Design Token Key as rendered by the provided renderer
   * @param keyRenderer Renderer for the Design Token key
   */
  getKey: (keyRenderer?: TokenKeyRenderer) => string;
}
