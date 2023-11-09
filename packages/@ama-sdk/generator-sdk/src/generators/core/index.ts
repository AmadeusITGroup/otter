import * as path from 'node:path';
import * as rimraf from 'rimraf';
import * as sway from 'sway';
import { type } from 'node:os';
import type {Operation, PathObject} from '@ama-sdk/core';

import Generator from 'yeoman-generator';

import { SdkGenerator } from '../sdk-generator';
import { Properties } from './core';

export default class extends SdkGenerator {

  public properties: Properties = {};

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    const deprecatedMessage = '[DEPRECATED] This generator is deprecated and will no longer be updated as of v10, please use @ama-sdk/schematics:typescript-core';

    this.log(deprecatedMessage);

    this.desc(`${deprecatedMessage}\nGenerate the SDK based on a given swagger spec`);

    this.option('swaggerSpecPath', {
      description: 'Swagger Spec file to generate the SDK',
      type: String,
      alias: 'spec'
    });
  }

  /**
   * Generates the operation id finder from spec
   */
  private async _generateOperationFinder(): Promise<PathObject[]> {
    const swayOptions = {
      definition: path.resolve(this.properties.swaggerSpecPath!)
    };
    const swayApi = await sway.create(swayOptions);
    const extraction = swayApi.getPaths().map((obj) => ({
      path: `${obj.path as string}`,
      regexp: obj.regexp as RegExp,
      operations: obj.getOperations().map((op: any) => {
        const operation: Operation = {
          method: `${op.method as string}`,
          operationId: `${op.operationId as string}`
        };
        return operation;
      }) as Operation[]
    }));
    return extraction;
  }

  private _getRegexpTemplate(regexp: RegExp) {
    return `new RegExp('${regexp.toString().replace(/\/(.*)\//, '$1').replace(/\\\//g, '/')}')`;
  }

  private _getPathObjectTemplate(pathObj: PathObject) {
    return `{
      ${
  (Object.keys(pathObj) as (keyof PathObject)[]).map((propName) => {
    const value = (propName) === 'regexp' ? this._getRegexpTemplate(pathObj[propName]) : JSON.stringify(pathObj[propName]);
    return `${propName as string}: ${value}`;
  }).join(',')
}
    }`;
  }

  public initializing() {
    this.properties.swaggerSpecPath = (this.options as any).swaggerSpecPath;
  }

  public async prompting() {
    const questions: Generator.Question[] = [];

    const qSwaggerSpecPath: Generator.Question = {
      type: 'input',
      name: 'swaggerSpecPath',
      message: 'Swagger Spec file to generate the SDK',
      default: this.customConfig.get('swaggerSpecPath') || path.join('..', 'digital-api-spec', 'swagger-spec', 'src', 'main', 'resources', 'DAPI_swagger_messages.yaml'),
      validate: (val) => this.fs.exists(path.resolve(val)) && /\.ya?ml$/i.test(val)
    };

    if (!this.properties.swaggerSpecPath) { questions.push(qSwaggerSpecPath); }

    const answers = await this.prompt(questions);
    this.properties = {
      ...this.properties,
      ...answers
    };
    return answers;
  }

  public configuring() {
    const CUSTOM_PROPERTIES_TO_STORE = ['swaggerSpecPath'];

    CUSTOM_PROPERTIES_TO_STORE.forEach((prodKey) => this.customConfig.set(prodKey, this.properties[prodKey]));
    this.customConfig.save();
  }

  public async writing() {
    rimraf.sync(path.resolve(this.destinationPath(), 'src', 'api', '**', '*.ts'), {glob: true});
    rimraf.sync(path.resolve(this.destinationPath(), 'src', 'models', 'base', '**', '!(index).ts'), {glob: true});
    rimraf.sync(path.resolve(this.destinationPath(), 'src', 'spec', '!(operation-adapter|index).ts'), {glob: true});
    this.log('Removed previously generated sources');

    const pathObjects = await this._generateOperationFinder() || [];

    this.properties.swayOperationAdapter = `[${
      pathObjects.map((pathObj) => this._getPathObjectTemplate(pathObj)).join(',')
    }]`;

    this.fs.copyTpl(
      this.templatePath('**'),
      this.destinationPath(),
      this.properties,
      undefined,
      {
        globOptions: {
          dot: true
        }
      }
    );

    if (this.fs.exists(this.destinationPath('readme.md'))) {
      const swagger = this.fs.read(this.getSwaggerSpecPath(this.properties.swaggerSpecPath!));
      const swaggerVersion = /version: ([0-9]+\.[0-9]+\.[0-9]+)/.exec(swagger);

      if (swaggerVersion) {
        const readmeContent = this.fs.read(this.destinationPath('readme.md'));
        this.fs.write(this.destinationPath('readme.md'), readmeContent.replace(/Based on Swagger spec .*/i, `Based on Swagger spec ${swaggerVersion[1]}`));
      }
    }
    this.fs.copy(path.resolve(__dirname, '..', 'resources', 'swagger-codegen-cli.jar'),
      path.resolve(this.destinationPath(), 'swagger-codegen-typescript', 'target', 'swagger-codegen-cli.jar'));

    this.fs.copy(path.resolve(this.destinationPath(), this.getSwaggerSpecPath(this.properties.swaggerSpecPath!)), path.resolve(this.destinationPath(), 'swagger-spec.yaml'));
  }

  public install() {
    this.spawnCommandSync('java', [
      '-cp',
      path.join('swagger-codegen-typescript', 'target', 'typescriptFetch-swagger-codegen.jar') + path.delimiter + path.join('swagger-codegen-typescript', 'target', 'swagger-codegen-cli.jar'),
      'io.swagger.codegen.SwaggerCodegen',
      'generate',
      '-l',
      'typescriptFetch',
      '-i',
      this.getSwaggerSpecPath(this.properties.swaggerSpecPath!),
      ...(type().startsWith('Windows') ? [] : ['-o', '.'])
    ], { cwd: this.destinationPath() });
    this.log('Generated new sources');
  }

  public end() {
    rimraf.sync(path.resolve(this.destinationPath(), 'swagger-codegen-typescript', '**'), {glob: true});
    try {
      const packageManagerCommand = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npx' : 'yarn';
      this.spawnCommandSync(packageManagerCommand, ['eslint', path.join('src', 'spec', 'operation-adapter.ts'), '--quiet', '--fix'], { cwd: this.destinationPath() });
    } catch {
      this.log('Failed to run eslint on operation adapter');
    }
  }
}
