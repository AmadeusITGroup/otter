import fs from 'node:fs';
import {
  load as yamlLoad,
} from 'js-yaml';
import {
  SwaggerSpecFile,
} from './swagger-spec-file';
import {
  SwaggerSpec,
} from './swagger-spec.interface';
import {
  sanitizeDefinition,
} from './utils';

export class SwaggerSpecYaml extends SwaggerSpecFile implements SwaggerSpec {
  /**
   * Load the YAML file
   */
  protected async loadSpec() {
    const specRawFileContent = await fs.promises.readFile(this.sourcePath, { encoding: 'utf8' });
    this.spec = sanitizeDefinition(yamlLoad(specRawFileContent));
    this.isLoaded = true;
    this.isParsed = false;
  }
}
