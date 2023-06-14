import * as path from 'node:path';
import * as rimraf from 'rimraf';
import * as Generator from 'yeoman-generator';

import { Properties } from '../core/core';

import { SdkGenerator } from '../sdk-generator';

module.exports = class extends SdkGenerator {

  public properties: Properties = {};

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    const deprecatedMessage = '[DEPRECATED] This generator is deprecated and will no longer be updated as of v10, please use @ama-sdk/schematics:java-client-core';

    this.log(deprecatedMessage);

    this.desc(`${deprecatedMessage}\nGenerate the SDK based on a given swagger spec`);

    this.option('swaggerSpecPath', {
      description: 'Swagger Spec file to generate the SDK',
      type: String,
      alias: 'spec'
    });

    this.option('swaggerConfigPath', {
      description: 'Swagger config file',
      type: String,
      alias: 'conf'
    });
  }

  private removePreviouslyGeneratedSources() {
    const swaggerConfig = this.fs.readJSON(this.properties.swaggerConfigPath!) as Record<string, any>;
    if (swaggerConfig && swaggerConfig.additionalProperties) {
      const modelPackage = swaggerConfig.additionalProperties?.basePackage;
      if (modelPackage) {
        this.log('Remove previously generated base models');
        rimraf.sync(path.resolve(this.destinationPath(), 'src', 'main', 'java', ...modelPackage.split('.'), '**', '*.java'));
      }

      const apiInterfacesPackage = swaggerConfig.additionalProperties.endpointsPackage;
      if (apiInterfacesPackage) {
        this.log('Remove previously generated API interfaces');
        rimraf.sync(path.resolve(this.destinationPath(), 'src', 'main', 'java', ...apiInterfacesPackage.split('.'), '**', '*.java'));
      }

      const apiImplPackage = swaggerConfig.additionalProperties.endpointsImplPackage;
      if (apiImplPackage) {
        this.log('Remove previously generated API implementations');
        rimraf.sync(path.resolve(this.destinationPath(), 'src', 'main', 'java', ...apiImplPackage.split('.'), '**', '*.java'));
      }
    }
    this.log('Remove previously generated doc');
    rimraf.sync(path.resolve(this.destinationPath(), 'docs', '**'));
    this.log('Remove previously generated readme');
    rimraf.sync(path.resolve(this.destinationPath(), 'README.md'));
  }

  public initializing() {
    this.properties.swaggerSpecPath = (this.options as any).swaggerSpecPath;
    this.properties.swaggerConfigPath = (this.options as any).swaggerConfigPath;
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

    const qSwaggerConfigPath: Generator.Question = {
      type: 'input',
      name: 'swaggerConfigPath',
      message: 'Swagger config file',
      default: this.customConfig.get('swaggerConfigPath') || this.templatePath(path.join('swagger-codegen-java-client', 'config', 'swagger-codegen-config.json')),
      validate: (val) => this.fs.exists(path.resolve(val)) && /\.json$/i.test(val)
    };

    if (!this.properties.swaggerSpecPath) { questions.push(qSwaggerSpecPath); }
    if (!this.properties.swaggerConfigPath) { questions.push(qSwaggerConfigPath); }

    const answers = await this.prompt(questions);
    this.properties = {
      ...this.properties,
      ...answers
    };
    return answers;
  }

  public configuring() {
    const CUSTOM_PROPERTIES_TO_STORE = ['swaggerSpecPath', 'swaggerConfigPath'];

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
    this.fs.copy(path.resolve(__dirname, '..', 'resources', 'swagger-codegen-cli.jar'),
      path.resolve(this.destinationPath(), 'swagger-codegen-java-client', 'target', 'swagger-codegen-cli.jar'));
    this.fs.copy(path.resolve(this.destinationPath(), this.getSwaggerSpecPath(this.properties.swaggerSpecPath!)), path.resolve(this.destinationPath(), 'swagger-spec.yaml'));
  }

  public install() {
    this.removePreviouslyGeneratedSources();
    this.spawnCommandSync('java', [
      '-cp',
      path.join('swagger-codegen-java-client', 'target', 'java-client-swagger-codegen.jar')
      + path.delimiter + path.join('swagger-codegen-java-client', 'target', 'swagger-codegen-cli.jar'),
      'io.swagger.codegen.SwaggerCodegen',
      'generate',
      '-l',
      'javaClient',
      '-i',
      this.getSwaggerSpecPath(this.properties.swaggerSpecPath!),
      '-DapiTests=false',
      '-c',
      this.properties.swaggerConfigPath!,
      '-o',
      '.'
    ], { cwd: this.destinationPath() });
  }

  public end() {
    rimraf.sync(path.resolve(this.destinationPath(), 'swagger-codegen-java-client', '**'));
  }
};
