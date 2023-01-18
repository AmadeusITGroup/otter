import * as path from 'node:path';
import * as rimraf from 'rimraf';
import * as Generator from 'yeoman-generator';

import { Properties } from '../core/core';

import { SdkGenerator } from '../sdk-generator';

module.exports = class extends SdkGenerator {

  public properties: Properties = {};

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    this.desc('Generate the Swift SDK based on a given swagger spec');

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
    this.fs.copy(path.resolve(this.sourceRoot(), '..', '..', 'resources', 'swagger-codegen-cli.jar'),
      path.resolve(this.destinationPath(), 'swagger-codegen-typescript', 'target', 'swagger-codegen-cli.jar'));
    this.fs.copy(path.resolve(this.destinationPath(), this.getSwaggerSpecPath(this.properties.swaggerSpecPath!)), path.resolve(this.destinationPath(), 'swagger-spec.yaml'));
  }

  public install() {
    this.log('Remove previously generated sdk files');
    rimraf.sync(path.resolve(this.destinationPath(), 'DapiSwiftSDK', 'Classes', 'Swaggers', '*.swift'));
    rimraf.sync(path.resolve(this.destinationPath(), 'DapiSwiftSDK', 'Classes', 'Swaggers', 'APIs', '**'));
    rimraf.sync(path.resolve(this.destinationPath(), 'DapiSwiftSDK', 'Classes', 'Swaggers', 'Models', '*Private.swift'));

    this.spawnCommandSync('java', [
      '-cp',
      path.join('swagger-codegen-swift', 'target', 'swift-swagger-codegen.jar')
      + path.delimiter + path.join('swagger-codegen-swift', 'target', 'swagger-codegen-cli.jar'),
      'io.swagger.codegen.SwaggerCodegen',
      'generate',
      '-l',
      'com.amadeus.swagger.codegen.swift.SwiftGenerator',
      '-i',
      this.getSwaggerSpecPath(this.properties.swaggerSpecPath!),
      '-DapiTests=false',
      '-c',
      path.join('swagger-codegen-swift', 'config', 'swagger-codegen-config.json'),
      '-o',
      '.'
    ], { cwd: this.destinationPath() });
  }

  public end() {
    rimraf.sync(path.resolve(this.destinationPath(), 'swagger-codegen-swift', '**'));
  }
};
