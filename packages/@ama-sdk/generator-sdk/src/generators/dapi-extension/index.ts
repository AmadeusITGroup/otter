import * as path from 'node:path';
import Generator from 'yeoman-generator';

import { Properties } from './core';

const packageJson = require(path.resolve(__dirname, '..', '..', 'package.json'));

module.exports = class extends Generator {

  public properties: Partial<Properties> = {};

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);
    this.desc('Generate a Dapi Extension package');

    this.option('name', {
      description: 'Extension Name',
      type: String
    });

    this.option('coreType', {
      description: 'Type of the core API to extend',
      type: String
    });

    this.option('coreVersion', {
      description: 'Version of the core API to extend',
      type: String
    });

    this.option('specPath', {
      description: 'Target Path where to generate the empty extension',
      type: String
    });
  }

  public initializing() {
    this.properties.myVersion = packageJson.version;
    this.properties.name = (this.options as any).name;
    this.properties.coreType = (this.options as any).coreType;
    this.properties.coreVersion = (this.options as any).coreVersion;

    if ((this.options as any).specPath) {
      this.destinationRoot((this.options as any).specPath);
    }
  }

  public async prompting() {
    const questions: Generator.Question[] = [];

    const qName: Generator.Question = {
      type: 'input',
      name: 'name',
      message: 'Extension Name'
    };

    const qCoreType: Generator.Question = {
      type: 'list',
      choices: ['private', 'public'],
      name: 'coreType',
      message: 'Type of the core API to extend'
    };

    const qCoreVersion: Generator.Question = {
      type: 'input',
      name: 'coreVersion',
      message: 'Version of the core API to extend '
    };

    if (!this.properties.name) { questions.push(qName); }
    if (!this.properties.coreType) { questions.push(qCoreType); }
    if (!this.properties.coreVersion) { questions.push(qCoreVersion); }

    const answers = await this.prompt(questions);
    this.properties = {...this.properties, ...answers};

    return answers;
  }

  public configuring() {
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
    this.fs.move(this.destinationPath('_package.json'), this.destinationPath('package.json'));
    this.fs.move(this.destinationPath('src', 'definitions', '__name__ExampleReply.yaml'), this.destinationPath('src', 'definitions', `${this.properties.name!}ExampleReply.yaml`));
    this.fs.move(this.destinationPath('_.gitignore'), this.destinationPath('.gitignore'));
    this.fs.move(this.destinationPath('_.npmrc'), this.destinationPath('.npmrc'));
    this.fs.move(this.destinationPath('src', 'override', '_.gitkeep'), this.destinationPath('src', 'override', '.gitkeep'));
  }
};
