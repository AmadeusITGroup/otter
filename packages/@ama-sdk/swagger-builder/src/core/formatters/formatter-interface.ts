/**
 * Swagger Spec formatter
 */
export interface Formatter {
  /** Generate the swagger spec file */
  generate(spec: any): Promise<void>;

  /**
   * Generate artifact file
   * @param artifactName Name of the swagger artifact
   * @param spec Swagger Spec to publish
   */
  generateArtifact(artifactName: string, spec: any): Promise<void>;
}
