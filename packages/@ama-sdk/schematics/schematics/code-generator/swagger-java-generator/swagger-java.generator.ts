import {
  spawn,
  SpawnOptions
} from 'node:child_process';
import * as path from 'node:path';
import {
  CodeGenerator
} from '../code-generator';
import {
  defaultOptions,
  JavaGeneratorTaskOptions
} from './swagger-java.options';

/**
 * Manage the schematic to generate a sdk using the Swagger 2 Generator
 * Note: a working java setup compatible with Swagger 2 Generator is required to use this class
 */
export class SwaggerJavaGenerator extends CodeGenerator<JavaGeneratorTaskOptions> {
  /** @inheritDoc */
  protected generatorName = 'java-generator';

  /** @inheritDoc */
  protected getDefaultOptions = () => defaultOptions;
  /** @inheritDoc */
  protected runCodeGeneratorFactory(factoryOptions: { rootDirectory?: string } = {}) {
    const rootDirectory = factoryOptions.rootDirectory || process.cwd();
    return async (generatorOptions?: JavaGeneratorTaskOptions) => {
      if (!generatorOptions) {
        return Promise.reject(new Error('Missing options'));
      }
      const spawnOptions: SpawnOptions = {
        stdio: 'inherit',
        shell: true,
        cwd: rootDirectory
      };
      const codegenPath = path.join(generatorOptions.targetFolder, `${generatorOptions.codegenLanguage}-${generatorOptions.codegenFileName}`);
      const cliPath = path.resolve(__dirname, '..', '..', 'resources', generatorOptions.cliFilename);

      const args = [
        '-cp',
        codegenPath + path.delimiter + cliPath,
        'io.swagger.codegen.SwaggerCodegen',
        'generate',
        '-l',
        generatorOptions.codegenLanguage,
        '-i',
        generatorOptions.specPath,
        '-o',
        generatorOptions.outputPath
      ];

      if (!generatorOptions.apiTests) {
        args.push('-DapiTests=false');
      }

      if (generatorOptions.specConfigPath) {
        args.push(`-c=${generatorOptions.specConfigPath}`);
      }

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
  }
}
