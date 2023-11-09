import * as path from 'node:path';
import * as rimraf from 'rimraf';
import Generator from 'yeoman-generator';

import { Properties } from '../core/core';

import { SdkGenerator } from '../sdk-generator';

module.exports = class extends SdkGenerator {

  public properties: Properties = {};

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    const deprecatedMessage = '[DEPRECATED] This generator is deprecated and will no longer be updated as of v10.';

    this.log(deprecatedMessage);

    this.desc(`${deprecatedMessage}\nGenerate the MDK based on a given swagger spec`);

    this.option('swaggerSpecPath', {
      description: 'Swagger Spec file to generate the SDK',
      type: String,
      alias: 'spec'
    });

    this.option('jaxRsImpl', {
      description: 'Supported implementations: RestEasy and Apache CXF with the values resteasy and cxf respectively',
      type: String,
      alias: 'jaxrs'
    });
  }

  private removePreviouslyGeneratedSources() {
    const swaggerConfig = this.fs.readJSON(this.templatePath(path.join('swagger-codegen-mdk', 'config', `swagger-codegen-${this.properties.jaxRsImpl as string}-config.json`))) as Record<string, any>;
    if (swaggerConfig) {
      if (swaggerConfig.modelPackage) {
        const modelPackage = swaggerConfig.modelPackage.split('.');
        this.log('Remove previously generated mappers');
        rimraf.sync(path.resolve(this.destinationPath(), 'src', 'main', 'java', ...modelPackage, 'mapper', '**', '*.java'), {glob: true});
        this.log('Remove previously generated private models');
        rimraf.sync(path.resolve(this.destinationPath(), 'src', 'main', 'java', ...modelPackage, 'model', 'base', '**', '*.java'), {glob: true});
      }
    }
    this.log('Remove previously generated readme');
    rimraf.sync(path.resolve(this.destinationPath(), 'README.md'));
    this.log('Remove previously generated pom');
    rimraf.sync(path.resolve(this.destinationPath(), 'pom.xml'));
  }

  public initializing() {
    this.properties.swaggerSpecPath = (this.options as any).swaggerSpecPath;
    this.properties.jaxRsImpl = (this.options as any).jaxRsImpl;
    this.properties.outputPath = (this.options as any).outputPath;
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

    const qJaxRsImpl: Generator.Question = {
      type: 'input',
      name: 'jaxRsImpl',
      message: 'Supported implementations: RestEasy and Apache CXF with the values resteasy and cxf respectively',
      default: this.customConfig.get('jaxRsImpl'),
      validate: (val) => val === 'resteasy' || val === 'cxf'
    };

    if (!this.properties.jaxRsImpl) { questions.push(qJaxRsImpl); }

    const answers = await this.prompt(questions);
    this.properties = {
      ...this.properties,
      ...answers
    };
    return answers;
  }

  public configuring() {
    const CUSTOM_PROPERTIES_TO_STORE = ['swaggerSpecPath', 'jaxRsImpl'];

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
      path.resolve(this.destinationPath(), 'swagger-codegen-mdk', 'target', 'swagger-codegen-cli.jar'));
    this.fs.copy(path.resolve(this.destinationPath(), this.getSwaggerSpecPath(this.properties.swaggerSpecPath!)), path.resolve(this.destinationPath(), 'airline-swagger-spec.yaml'));
  }

  public install() {
    this.removePreviouslyGeneratedSources();
    this.spawnCommandSync('java', [
      '-cp',
      path.join('swagger-codegen-mdk', 'target', 'mdk-swagger-codegen.jar')
      + path.delimiter + path.join('swagger-codegen-mdk', 'target', 'swagger-codegen-cli.jar'),
      'io.swagger.codegen.SwaggerCodegen',
      'generate',
      '-l',
      'javaMdk',
      '-i',
      this.getSwaggerSpecPath(this.properties.swaggerSpecPath!),
      '-DapiTests=false',
      '-c',
      path.join('swagger-codegen-mdk', 'config', 'swagger-codegen-' + (this.properties.jaxRsImpl as string) + '-config.json'),
      '-o',
      '.'
    ], { cwd: this.destinationPath() });
  }

  public end() {
    rimraf.sync(path.resolve(this.destinationPath(), 'swagger-codegen-mdk', '**'), {glob: true});
  }
};
