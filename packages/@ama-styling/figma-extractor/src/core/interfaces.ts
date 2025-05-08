/** Context to the Figma file to target */
export interface FigmaFileContext {
  /** ID of the Figma file */
  fileKey: string;
  /** Logger */
  logger?: Partial<Pick<Console, 'warn' | 'error' | 'info' | 'debug'>>;
}

/** Design Token basic interface */
export interface DesignToken {
  /** Design Token type */
  $type?: string;
  /** Description of the Design Token */
  $description?: string;
  /** Value of the Design Token */
  $value: any;
}
