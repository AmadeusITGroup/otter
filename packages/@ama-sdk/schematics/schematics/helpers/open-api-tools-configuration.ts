/** Configuration of an Open API generator */
export interface OpenApiToolsGenerator {
  /** Location of the OpenAPI spec, as URL or file */
  inputSpec: string;
  /** Output path for the generated SDK */
  output: string;
  /** Generator to use */
  generatorName: string;
  /** Path to configuration file. It can be JSON or YAML */
  config?: string;
  /** Sets specified global properties */
  globalProperty?: string | Record<string, any>;
}

/** Global configuration of Open API generators */
export interface OpenApiToolsGeneratorCli {
  /** Open API version */
  version: string;
  /** Location of the generator JAR file */
  storageDir?: string;
  /** Generators configuration */
  generators: Record<string, OpenApiToolsGenerator>;
}

/** Global configuration of Open API Tools */
export interface OpenApiToolsConfiguration {
  /** Generators CLI configuration */
  // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed by OpenAPI
  'generator-cli': OpenApiToolsGeneratorCli;
}
