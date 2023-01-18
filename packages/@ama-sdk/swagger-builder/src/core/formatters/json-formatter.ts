import fs from 'node:fs';
import mkdirp from 'mkdirp';
import path from 'node:path';
import { Formatter } from './formatter.interface';
import { generatePackageJson } from './utils';

/**
 * Formatter to generate JSON file
 */
export class JsonFormatter implements Formatter {

  private filePath: string;
  private cwd: string;

  constructor(private basePath: string) {
    this.filePath = /\.json$/i.test(this.basePath) ? this.basePath : this.basePath + '.json';
    this.cwd = path.dirname(this.filePath);
  }

  /** @inheritdoc */
  public async generate(spec: any): Promise<void> {
    const content = JSON.stringify(spec, null, 2);
    await mkdirp(path.dirname(this.filePath));
    const res = await new Promise<void>((resolve, reject) => fs.writeFile(this.filePath, content, (err) => err ? reject(err) : resolve()));
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Swagger spec generated: ${this.filePath}`);
    return res;
  }

  /** @inheritdoc */
  public async generateArtifact(artifactName: string, spec: any): Promise<void> {
    await mkdirp(this.cwd);

    const content = JSON.stringify({
      ...generatePackageJson(artifactName, spec),
      main: path.relative(this.cwd, this.filePath)
    }, null, 2);

    const res = await new Promise<void>((resolve, reject) => fs.writeFile(path.resolve(this.cwd, 'package.json'), content, (err) => err ? reject(err) : resolve()));
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Artifact generated for ${this.filePath}`);
    return res;
  }
}
