import * as path from 'node:path';
import * as rimraf from 'rimraf';
import Generator from 'yeoman-generator';

import { SdkGenerator } from '../sdk-generator';
import { Properties } from './core';

module.exports = class extends SdkGenerator {

  public properties: Properties = {};

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    const deprecatedMessage = '[DEPRECATED] This generator is deprecated and will no longer be updated as of v10.';

    this.log(deprecatedMessage);

    this.desc(`${deprecatedMessage}\nGenerate the SDK based on a given swagger spec`);

    this.option('swaggerSpecPath', {
      description: 'Swagger Spec file to generate the SDK',
      type: String,
      alias: 'spec'
    });
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
      validate: (val) => this.fs.exists(val) && /\.ya?ml$/i.test(val)
    };

    if (!this.properties.swaggerSpecPath) { questions.push(qSwaggerSpecPath); }

    const answers = await this.prompt(questions);
    this.properties = {...this.properties, ...answers};

    return answers;
  }

  public configuring() {
    const CUSTOM_PROPERTIES_TO_STORE = ['swaggerSpecPath'];

    CUSTOM_PROPERTIES_TO_STORE.forEach((prodKey) => this.customConfig.set(prodKey, this.properties[prodKey]));
    this.customConfig.save();
  }

  public writing() {
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
      path.resolve(this.destinationPath(), 'swagger-codegen-dart', 'target', 'swagger-codegen-cli.jar'));

    this.fs.copy(path.resolve(this.destinationPath(), this.getSwaggerSpecPath(this.properties.swaggerSpecPath!)), path.resolve(this.destinationPath(), 'swagger-spec.yaml'));
  }

  public install() {
    rimraf.sync(path.resolve(this.destinationPath(), 'src', 'apis', '**', '*.dart'));
    rimraf.sync(path.resolve(this.destinationPath(), 'src', 'models', 'base', '**', '*.dart'));
    this.log('Removed previously generated sources');

    this.spawnCommandSync('java', [
      '-cp',
      path.join('swagger-codegen-dart', 'target', 'dart-swagger-codegen.jar') + path.delimiter + path.join('swagger-codegen-dart', 'target', 'swagger-codegen-cli.jar'),
      'io.swagger.codegen.SwaggerCodegen',
      'generate',
      '-l',
      'com.amadeus.swagger.codegen.dart.DartClientCodegen',
      '-i',
      this.getSwaggerSpecPath(this.properties.swaggerSpecPath!),
      '-o',
      '.'
    ], {cwd: this.destinationPath()});
    this.log('Generated new sources');
  }

  public end() {
    rimraf.sync(path.resolve(this.destinationPath(), 'swagger-codegen-dart', '**'));
  }
};
