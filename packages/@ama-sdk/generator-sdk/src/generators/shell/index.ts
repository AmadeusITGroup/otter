import * as fs from 'node:fs';
import * as path from 'node:path';
import Generator from 'yeoman-generator';
import { SdkGenerator } from '../sdk-generator';
import { Hostings, Properties } from './core';


/**
 *
 */
function readPackageJson() {
  let packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    packageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
  }

  return require(packageJsonPath);
}

const packageJson = readPackageJson();

export default class extends SdkGenerator {

  public properties: Properties = {};

  private messages: string[] = [];

  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args, options);

    const deprecatedMessage = '[DEPRECATED] This generator is deprecated and will no longer be updated as of v10, please use @ama-sdk/schematics:typescript-shell.';

    this.log(deprecatedMessage);

    this.desc(`${deprecatedMessage}\nGenerate the shell of an SDK package`);

    this.option('projectName', {
      description: 'Project name (NPM package scope, package.json name will be @{projectName}/{packageName})',
      type: String,
      alias: 'name'
    });

    this.option('projectPackageName', {
      description: 'Package name (package.json name will be @{projectName}/{packageName})',
      type: String,
      alias: 'package'
    });

    this.option('projectDescription', {
      description: 'Project description',
      type: String,
      alias: 'description'
    });

    this.option('projectHosting', {
      description: 'Project hosting',
      type: String,
      alias: 'hosting'
    });
  }

  public initializing() {
    this.properties.sdkCoreVersion = packageJson.version;
    this.properties.projectName = (this.options as any).projectName;
    this.properties.projectPackageName = (this.options as any).projectPackageName;
    this.properties.projectDescription = (this.options as any).projectDescription;
    this.properties.projectHosting = (this.options as any).projectHosting;
  }

  public async prompting() {
    const questions: Generator.Question[] = [];

    const qProjectName: Generator.Question = {
      type: 'input',
      name: 'projectName',
      message: 'Project name (NPM package scope, package.json name will be @{projectName}/{packageName})',
      store: true
    };

    const qProjectPackageName: Generator.Question = {
      type: 'input',
      name: 'projectPackageName',
      message: 'Package name (package.json name will be @{projectName}/{packageName})',
      store: true
    };

    const qProjectDescription: Generator.Question = {
      type: 'input',
      name: 'projectDescription',
      message: 'Project description',
      store: true
    };

    const qProjectHosting: Generator.Question = {
      type: 'list',
      name: 'projectHosting',
      message: 'Where is your repository hosted? (used to generate CI/CD pipelines)',
      choices: [Hostings.AZURE, Hostings.OTHER]
    };

    if (!this.properties.projectName) { questions.push(qProjectName); }
    if (!this.properties.projectPackageName) { questions.push(qProjectPackageName); }
    if (!this.properties.projectDescription) { questions.push(qProjectDescription); }
    if (!this.properties.projectHosting) { questions.push(qProjectHosting); }

    const answers = await this.prompt(questions);
    this.properties = {...this.properties, ...answers};

    return answers;
  }

  public configuring() {
    const PROPERTIES_TO_STORE = ['projectName', 'projectPackageName', 'projectDescription'];
    const CUSTOM_PROPERTIES_TO_STORE = ['gitUsername'];

    PROPERTIES_TO_STORE.forEach((prodKey) => this.config.set(prodKey, this.properties[prodKey]));
    CUSTOM_PROPERTIES_TO_STORE.forEach((prodKey) => this.customConfig.set(prodKey, this.properties[prodKey]));
    this.config.save();
    this.customConfig.save();
  }

  public writing() {
    const properties = {
      ...this.properties,
      dot: '.'
    };

    const processDestinationPath = (destinationPath: string) => {
      const matchVars = destinationPath.match(/__[^_]+__/g);
      if (matchVars) {
        return matchVars.reduce((acc, matchVar) => {
          const varName = matchVar.replace(/__/g, '') as keyof typeof properties;
          const varValue = properties[varName];
          return varValue ? acc.replace(matchVar, varValue) : acc;
        }, destinationPath);
      }
      return destinationPath;
    };

    this.fs.copyTpl(
      this.templatePath('base/**'),
      this.destinationPath(),
      properties,
      undefined,
      {
        processDestinationPath,
        globOptions: {
          dot: true
        }
      }
    );

    switch (this.properties.projectHosting) {
      case Hostings.AZURE: {
        this.fs.copyTpl(
          this.templatePath('azure/**'),
          this.destinationPath(),
          properties,
          undefined,
          {
            processDestinationPath,
            globOptions: {
              dot: true
            }
          }
        );
        this.messages.push(`A pipeline has been generated in "./azure-pipelines.yml" and some actions are required to be able to use it:
  - You need to give Contribution rights on your repository to your service user (to be able to push version tags).
  - You need to create Azure feeds for releases and PullRequest versions and set their names as values of the corresponding variables in the pipeline file.`);
        break;
      }
    }
  }

  public install() {
    const generatedPackageJson: any = this.fs.readJSON('./package.json');
    const packageManager = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';
    if (packageManager === 'yarn') {
      const version = generatedPackageJson.packageManager.replace('yarn@', '');
      this.spawnCommandSync('yarn', ['set', 'version', version], {cwd: this.destinationPath(), env: {}});
    }
  }

  public end() {
    this.messages.forEach((message) => this.log(message));
  }
}
