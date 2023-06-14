import { chain, Rule, SchematicContext, TaskConfiguration, TaskConfigurationGenerator, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { javaGeneratorName, JavaGeneratorTaskOptions, registerJavaGeneratorExecutor } from './generator-java.task';


class JavaGeneratorTask implements TaskConfigurationGenerator<JavaGeneratorTaskOptions> {

  public codegenPath: string;
  public cliPath: string;

  /**
   * @param targetFolder folder where to download the jars
   * @param swaggerSpecPath
   * @param codegenLanguage
   * @param apiTests
   * @param cliFilename
   * @param codegenFileName Name of the codeGen jar
   * @param workingDirectory
   */
  constructor(targetFolder: string,
      public swaggerSpecPath: string,
      public codegenLanguage: string,
      public apiTests = true,
      public swaggerConfigPath?: string | null,
      cliFilename = 'swagger-codegen-cli.jar',
      codegenFileName = 'swagger-codegen.jar',
      public workingDirectory?: string) {
    this.codegenPath = path.posix.join(targetFolder, `${codegenLanguage}-${codegenFileName}`);
    this.cliPath = path.resolve(__dirname, '..', 'resources', cliFilename);
  }

  public toConfiguration(): TaskConfiguration<JavaGeneratorTaskOptions> {
    return {
      name: javaGeneratorName,
      options: {
        codegenPath: this.codegenPath,
        codegenLanguage: this.codegenLanguage,
        cliPath: this.cliPath,
        apiTests: this.apiTests,
        swaggerSpecPath: this.swaggerSpecPath,
        swaggerConfigPath: this.swaggerConfigPath
      }
    };
  }
}

/**
 * Execute the Swagger CLI and codeGen rule factory
 *
 * @param targetFolder folder where to download the jars
 * @param swaggerSpecPath path to the swagger specification
 * @param codegenLanguage codegen template language
 * @param apiTests
 * @param codegenFileName Name of the codeGen jar
 * @param cliFilename Name of the codeGen CLI jar
 * @param swaggerConfigPath path to the swagger configuration
 */
export const executeSwaggerJarsRuleFactory = (
  targetFolder: string,
  swaggerSpecPath: string,
  codegenLanguage: string,
  apiTests = true,
  swaggerConfigPath?: string | null,
  codegenFileName = 'swagger-codegen.jar',
  cliFilename = 'swagger-codegen-cli.jar'
): Rule => {
  const scheduleTask = (tree: Tree, context: SchematicContext) => {
    context.addTask(new JavaGeneratorTask(targetFolder, swaggerSpecPath, codegenLanguage, apiTests, swaggerConfigPath, cliFilename, codegenFileName));
    return tree;
  };

  return chain([
    registerJavaGeneratorExecutor,
    scheduleTask
  ]);
};
