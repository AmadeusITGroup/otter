import fs from 'node:fs';
import yaml from 'js-yaml';
import path from 'node:path';
import { Formatter } from './formatter.interface';
import { generatePackageJson } from './utils';

/**
 * Formatter to generate YAML file
 */
export class YamlFormatter implements Formatter {

  private filePath: string;
  private cwd: string;

  constructor(private basePath: string) {
    this.filePath = /\.ya?ml$/i.test(this.basePath) ? this.basePath : this.basePath + '.yaml';
    this.cwd = path.dirname(this.filePath);
  }

  /** @inheritdoc */
  public async generate(spec: any): Promise<void> {
    const content = yaml.dump(spec, {indent: 2});

    await fs.promises.mkdir(this.cwd, {recursive: true});
    await fs.promises.writeFile(this.filePath, content);
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Swagger spec generated: ${this.filePath}`);
  }

  /** @inheritdoc */
  public async generateArtifact(artifactName: string, spec: any): Promise<void> {
    await fs.promises.mkdir(this.cwd, {recursive: true});

    const content = JSON.stringify({
      ...generatePackageJson(artifactName, spec),
      main: path.relative(this.cwd, this.filePath)
    }, null, 2);

    await fs.promises.writeFile(path.resolve(this.cwd, 'package.json'), content);
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Artifact generated for ${this.filePath}`);
  }
}
