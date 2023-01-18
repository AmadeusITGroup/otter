/**
 * Proterty of the generator
 */
export interface Properties {
  [key: string]: string | undefined;

  /** Path to the swagger spec */
  swaggerSpecPath?: string;

  /** Sway operation JSON */
  swayOperationAdapter?: string;
}
