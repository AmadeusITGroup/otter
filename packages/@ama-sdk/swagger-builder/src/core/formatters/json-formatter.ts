import fs from 'node:fs';
import path from 'node:path';
import { Formatter } from './formatter.interface';
import { generatePackageJson } from './utils';

/**
 * Formatter to generate JSON file
 */
export class JsonFormatter implements Formatter {

  private readonly filePath: string;
  private readonly cwd: string;

  constructor(private readonly basePath: string) {
    this.filePath = /\.json$/i.test(this.basePath) ? this.basePath : this.basePath + '.json';
    this.cwd = path.dirname(this.filePath);
  }

  /** @inheritdoc */
  public async generate(spec: any): Promise<void> {
    const content = JSON.stringify(spec, null, 2);
    await fs.promises.mkdir(path.dirname(this.filePath), {recursive: true});
    const res = await fs.promises.writeFile(this.filePath, content);
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Swagger spec generated: ${this.filePath}`);
    return res;
  }

  /** @inheritdoc */
  public async generateArtifact(artifactName: string, spec: any): Promise<void> {
    await fs.promises.mkdir(this.cwd, {recursive: true});

    const content = JSON.stringify({
      ...generatePackageJson(artifactName, spec),
      main: path.relative(this.cwd, this.filePath),
      exports: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        './openapi.json': {
          default: path.relative(this.cwd, this.filePath)
        }
      }
    }, null, 2);

    const res = await fs.promises.writeFile(path.resolve(this.cwd, 'package.json'), content);
    // eslint-disable-next-line no-console, no-restricted-syntax
    console.info(`Artifact generated for ${this.filePath}`);
    return res;
  }
}
