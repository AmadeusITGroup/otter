import { SchematicContext, TaskExecutor, Tree } from '@angular-devkit/schematics';
import { NodeModulesEngineHost } from '@angular-devkit/schematics/tools';
import { spawn, SpawnOptions } from 'node:child_process';
import * as path from 'node:path';

/**
 * Options for the generator-java task.
 */
export interface JavaGeneratorTaskOptions {
  /**
   * Enable API testing in Swagger Codegen
   *
   * @default true
   */
  apiTests: boolean;
  /**
   * Path to the Swagger CLI
   *
   * @default 'swagger-codegen-cli.jar'
   */
  cliPath: string;
  /**
   * Path to the Swagger Codegen
   *
   * @default 'swagger-codegen.jar'
   */
  codegenPath: string;
  /**
   * Template language use for the codegen
   *
   * @default 'default'
   */
  codegenLanguage: string;
  /**
   * Path to the Swagger specification
   *
   * @default 'swagger-spec.yaml'
   */
  swaggerSpecPath: string;
  /**
   * Path to the swagger configuration
   */
  swaggerConfigPath?: string | null;
}

const defaultOptions: JavaGeneratorTaskOptions = {
  apiTests: true,
  cliPath: 'swagger-codegen-cli.jar',
  codegenPath: 'swagger-codegen.jar',
  codegenLanguage: 'default',
  swaggerSpecPath: 'swagger-spec.yaml'
};

/**
 * Java swagger generator task factory
 *
 * @param factoryOptions.rootDirectory The root directory of the process execution
 * @param factoryOptions
 */
export const javaGeneratorFactory = (factoryOptions: {rootDirectory?: string} = {}): TaskExecutor<Partial<JavaGeneratorTaskOptions>> => {
  const rootDirectory = factoryOptions.rootDirectory || process.cwd();

  return (options: Partial<JavaGeneratorTaskOptions> = {}) => {
    const opts: JavaGeneratorTaskOptions = {
      ...defaultOptions,
      ...options
    };

    const args = [
      '-cp',
      opts.codegenPath + path.delimiter + opts.cliPath,
      'io.swagger.codegen.SwaggerCodegen',
      'generate',
      '-l',
      opts.codegenLanguage,
      '-i',
      opts.swaggerSpecPath,
      '-o',
      '.'
    ];

    if (!opts.apiTests) {
      args.push('-DapiTests=false');
    }

    if (opts.swaggerConfigPath) {
      args.push(`-c=${opts.swaggerConfigPath}`);
    }

    const spawnOptions: SpawnOptions = {
      stdio: 'inherit',
      shell: true,
      env: process.env,
      cwd: rootDirectory
    };

    return new Promise<void>((resolve, reject) => {
      spawn('java', args, spawnOptions)
        .on('close', (code: number) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Java generator failed with status ${code}`));
          }
        });
    });
  };
};

/** Name of the Java codegen task */
export const javaGeneratorName = 'java-generator';

/**
 * Rule to register the Java generator task
 *
 * @param tree
 * @param context
 */
export const registerJavaGeneratorExecutor = (tree: Tree, context: SchematicContext) => {
  // workaround for issue https://github.com/angular/angular-cli/issues/12678
  // eslint-disable-next-line no-underscore-dangle
  const host = (context.engine as any)._host as NodeModulesEngineHost;
  host.registerTaskExecutor({
    name: javaGeneratorName,
    create: () => Promise.resolve(javaGeneratorFactory())
  });

  return tree;
};
