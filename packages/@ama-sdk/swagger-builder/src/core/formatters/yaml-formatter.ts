import fs from 'node:fs';
import yaml from 'js-yaml';
import mkdirp from 'mkdirp';
import path from 'node:path';
import { Formatter } from './formatter.interface';
import { generatePackageJson } from './utils';

/**
 * Formatter to generate YAML file
 */
export class YamlFormatter implements Formatter {

  private readonly filePath: string;
  private readonly cwd: string;

  constructor(private readonly basePath: string) {
    this.filePath = /\.ya?ml$/i.test(this.basePath) ? this.basePath : this.basePath + '.yaml';
    this.cwd = path.dirname(this.filePath);
  }

  /** @inheritdoc */
  public async generate(spec: any): Promise<void> {
    const content = yaml.dump(spec, {indent: 2});

    await mkdirp(this.cwd);
    await new Promise<void>((resolve, reject) => fs.writeFile(this.filePath, content, (err) => err ? reject(err) : resolve()));
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Swagger spec generated: ${this.filePath}`);
  }

  /** @inheritdoc */
  public async generateArtifact(artifactName: string, spec: any): Promise<void> {
    await mkdirp(this.cwd);

    const content = JSON.stringify({
      ...generatePackageJson(artifactName, spec),
      main: path.relative(this.cwd, this.filePath)
    }, null, 2);

    await new Promise<void>((resolve, reject) => fs.writeFile(path.resolve(this.cwd, 'package.json'), content, (err) => err ? reject(err) : resolve()));
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Artifact generated for ${this.filePath}`);
  }
}
