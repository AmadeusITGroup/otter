/**
 * Post process to run on the final Swagger specification
 */
export interface PostProcess {
  /**
   * Execute post process
   *
   * @param spec Swagger specification
   */
  execute<T = any>(spec: T): Promise<T>;
}
