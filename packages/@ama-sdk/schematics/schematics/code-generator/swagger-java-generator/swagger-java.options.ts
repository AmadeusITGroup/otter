import { CodegenTaskOptions } from '../code-generator';

/**
 * Options for the generator-java task.
 */
export type JavaGeneratorTaskOptions = CodegenTaskOptions & {
  targetFolder: string;
  /**
   * Enable API testing in Swagger Codegen
   * @default true
   */
  apiTests: boolean;
  /**
   * Path to the Swagger CLI
   * @default 'swagger-codegen-cli.jar'
   */
  cliFilename: string;
  /**
   * Path to the Swagger Codegen
   * @default 'swagger-codegen.jar'
   */
  codegenFileName: string;
  /**
   * Template language use for the codegen
   * @default 'default'
   */
  codegenLanguage: string;
};

/**
 * Default options to generate a JAVA sdk using the Swagger 2 Generator
 */
export const defaultOptions = {
  apiTests: true,
  targetFolder: './',
  cliFilename: 'swagger-codegen-cli.jar',
  codegenFileName: 'swagger-codegen.jar',
  codegenLanguage: 'default',
  specPath: 'swagger-spec.yaml',
  outputPath: '.',
  specConfigPath: ''
} as const satisfies JavaGeneratorTaskOptions;
