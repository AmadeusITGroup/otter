import {CodeGenerator} from '../code-generator';
import {spawn, SpawnOptions} from 'node:child_process';
import {defaultTypescriptGeneratorOptions, OpenApiCliOptions} from './open-api-cli.options';
import * as path from 'node:path';
import { getPackageManagerName } from '../../helpers/node-install';

/**
 * Manage the schematic to generate a sdk using the @openapitools/openapi-generator-cli
 */
export class OpenApiCliGenerator extends CodeGenerator<OpenApiCliOptions> {

  protected readonly packageManager: 'npm' | 'yarn';
  protected get packageManagerRunner(): 'npx' | 'yarn' {
    return this.packageManager === 'npm' ? 'npx' : 'yarn';
  }

  /** @inheritDoc */
  protected readonly generatorName = 'openapi-codegen-npm-cli';

  constructor(options?: { packageManager?: 'npm' | 'yarn' | '' }) {
    super();
    this.packageManager = getPackageManagerName(options?.packageManager);
  }

  /**
   * Install the specified java open api generator
   *
   * @param version of the OpenApi Generator jar to use
   * @param spawnOptions to configure your command line environment
   */
  private runInstallOpenApiGenerator(version: string, spawnOptions: SpawnOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      spawn(this.packageManagerRunner,
        ['openapi-generator-cli', 'version-manager', 'set', version],
        spawnOptions
      ).on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`OpenApiGeneratorCli failed to install OpenApiGenerator@${version}`));
        }
      });
    });
  }

  /**
   * Run the OpenApi generator jar with the configuration specified to generate a SDK based on the specified specification
   *
   * @param generatorOptions contains the version of the generator to use, the output dir, the specification file and config to use etc.
   * @param spawnOptions to configure your command line environment
   */
  private runGenerator(generatorOptions: OpenApiCliOptions, spawnOptions: SpawnOptions) {
    const args = [
      'openapi-generator-cli',
      'generate',
      generatorOptions.generatorCustomPath ? `--custom-generator=${generatorOptions.generatorCustomPath}` : '',
      '-g', generatorOptions.generatorName,
      '-i', generatorOptions.specPath,
      ...generatorOptions.specConfigPath ? ['-c', generatorOptions.specConfigPath] : [],
      '-o', generatorOptions.outputPath,
      ...generatorOptions.globalProperty ? ['--global-property', generatorOptions.globalProperty] : []
    ];
    return new Promise<void>((resolve, reject) => {
      spawn(this.packageManagerRunner, args, spawnOptions)
        .on('close', (code: number) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`OpenApiGeneratorCli failed to run OpenApiGenerator with command '${args.join(' ')}'`));
          }
        });
    });
  }

  /** @inheritDoc */
  protected getDefaultOptions = () => defaultTypescriptGeneratorOptions;

  /** @inheritDoc */
  protected runCodeGeneratorFactory = (factoryOptions: { rootDirectory?: string } = {}) => {
    const rootDirectory = factoryOptions.rootDirectory ?
      (path.isAbsolute(factoryOptions.rootDirectory) ? factoryOptions.rootDirectory : path.resolve(process.cwd(), factoryOptions.rootDirectory)) :
      process.cwd();
    return async (generatorOptions?: OpenApiCliOptions) => {
      if (!generatorOptions) {
        return Promise.reject('Missing options to run open api generator');
      }
      const spawnOptions: SpawnOptions = {
        stdio: 'inherit',
        shell: true,
        cwd: rootDirectory
      };
      if (generatorOptions.generatorVersion) {
        await this.runInstallOpenApiGenerator(generatorOptions.generatorVersion, spawnOptions);
      }
      await this.runGenerator(generatorOptions, spawnOptions);
    };
  };
}
