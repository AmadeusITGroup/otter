import fs from 'node:fs';
import yaml from 'js-yaml';
import {
  SwaggerSpecFile
} from './swagger-spec-file';
import {
  SwaggerSpec
} from './swagger-spec.interface';
import {
  sanitizeDefinition
} from './utils';

export class SwaggerSpecYaml extends SwaggerSpecFile implements SwaggerSpec {
  /**
   * Load the YAML file
   */
  protected async loadSpec() {
    const specRawFileContent = await fs.promises.readFile(this.sourcePath, { encoding: 'utf8' });
    this.spec = sanitizeDefinition(yaml.load(specRawFileContent));
    this.isLoaded = true;
    this.isParsed = false;
  }
}
