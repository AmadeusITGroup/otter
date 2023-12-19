import fs from 'node:fs';
import { SwaggerSpecFile } from './swagger-spec-file';
import { SwaggerSpec } from './swagger-spec.interface';
import { sanitizeDefinition } from './utils';

export class SwaggerSpecJson extends SwaggerSpecFile implements SwaggerSpec {

  /**
   * Load the JSON file
   */
  protected async loadSpec() {
    const specRawFileContent = await fs.promises.readFile(this.sourcePath, { encoding: 'utf8' });
    this.spec = sanitizeDefinition(JSON.parse(specRawFileContent));
    this.isLoaded = true;
    this.isParsed = false;
  }
}
