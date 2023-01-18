import * as path from 'node:path';
import Generator from 'yeoman-generator';
const storage = require('yeoman-generator/lib/util/storage');

export class SdkGenerator extends Generator {

  /** Storage for custom configurations */
  protected customConfig: Generator.Storage;

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    this.argument('sdkPath', {
      type: String,
      required: false,
      optional: false,
      description: 'Path to the SDK to generate',
      default: process.cwd()
    });

    const destinationRoot = this.destinationRoot((this.options as any).sdkPath);

    // eslint-disable-next-line new-cap
    this.customConfig = new storage(this.rootGeneratorName(), this.fs, path.resolve(destinationRoot, '.custom.yo-rc.json'));
  }

  protected getSwaggerSpecPath(swaggerSpecPath: string) {
    try {
      return require.resolve(swaggerSpecPath);
    } catch {
      return swaggerSpecPath;
    }
  }

}
