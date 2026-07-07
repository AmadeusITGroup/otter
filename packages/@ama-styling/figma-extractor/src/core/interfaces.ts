export interface ExtractorContext {
  /** Logger */
  logger?: Partial<Pick<Console, 'warn' | 'error' | 'info' | 'debug'>>;
}

/** Context to the Figma file to target */
export interface FigmaFileContext extends ExtractorContext {
  /** ID of the Figma file */
  fileKey: string;
}

/** Context to the Figma Project to target */
export interface FigmaProjectContext extends ExtractorContext {
  /**
   * ID of the Figma Project
   * Project Name where to look for files
   */
  projectKey: string;
}

/** Design Token basic interface */
export interface DesignToken<T = any> {
  /** Design Token type */
  $type?: string;
  /** Description of the Design Token */
  $description?: string;
  /** Value of the Design Token */
  $value: T;
}

/** Design Token basic Tree interface */
export interface DesignTokenTree<T = any> {
  [name: string]: DesignToken<T> | DesignTokenTree<T>;
}
