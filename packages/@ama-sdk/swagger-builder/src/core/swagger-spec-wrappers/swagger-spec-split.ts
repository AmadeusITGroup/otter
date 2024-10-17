import fs from 'node:fs';
import { sync as globbySync } from 'globby';
import path from 'node:path';
import type { Spec } from 'swagger-schema-official';
import { BuilderApiConfiguration } from '../../interfaces/apis-configuration';
import { SwaggerSpecMerger } from '../swagger-spec-merger';
import { checkJson, getTargetInformation, isGlobPattern } from '../utils';
import { SwaggerSpecObject } from './swagger-spec-object';
import { SwaggerSpec } from './swagger-spec.interface';

const apiConfigurationSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'schemas', 'api-configuration.schema.json'), { encoding: 'utf8' }));

export class SwaggerSpecSplit implements SwaggerSpec {

  /**
   * Determine if the given Json file is a Split Swagger Configuration file
   * @param sourcePath Json file to test
   */
  public static async isSplitConfigurationFile(sourcePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(sourcePath)) {
        const apiConfiguration = JSON.parse(await fs.promises.readFile(sourcePath, { encoding: 'utf8' }));
        checkJson(apiConfiguration, apiConfigurationSchema);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /** Folder containing the products */
  public readonly PRODUCT_FOLDER = 'products';

  /** @inheritdoc */
  public targetType: 'NpmModule' | 'LocalPath';

  /** @inheritdoc */

  public sourcePath: string;
  /** @inheritdoc */
  public isParsed: boolean;

  /** API Configuration */
  private apiConfiguration?: BuilderApiConfiguration;

  /** Swagger Spec as object */
  private swaggerSpecConsolidated?: any;

  constructor(source: string | { path: string; config: BuilderApiConfiguration }, targetType: 'NpmModule' | 'LocalPath') {
    this.targetType = targetType;
    this.isParsed = false;

    if (typeof source === 'string') {
      this.sourcePath = source;
    } else {
      this.sourcePath = source.path + '_' + source.config.output.replace(/[/\\]/g, '_');
      this.apiConfiguration = source.config;
    }
  }

  /**
   * Get the product path
   * @param cwd Current directory
   * @param product Product label
   */
  private getProductFilename(cwd: string, product: string) {
    const filename = /\.ya?ml$/i.test(product) ? product : product + '.yaml';
    const defaultProduct = path.join(this.PRODUCT_FOLDER, filename);
    if (fs.existsSync(path.resolve(cwd, defaultProduct))) {
      return defaultProduct;
    }
    const productFolder = this.apiConfiguration && (this.apiConfiguration.productFolders || [])
      .find((p) => fs.existsSync(path.resolve(cwd, p, filename)));

    if (!productFolder) {
      throw new Error(`No file for the product "${product}"`);
    }

    return path.join(productFolder, filename);
  }

  /** Get the list of Swagger specs targeted by the configuration */
  private async getProductSpecs() {
    if (!this.apiConfiguration) {
      return [];
    }
    const currentDirectory = path.dirname(this.sourcePath);

    return Promise.all(
      this.apiConfiguration.products
        .map((product) => this.getProductFilename(currentDirectory, product))
        .map((swaggerPath) => getTargetInformation(swaggerPath, currentDirectory))
    );
  }

  /** Get the list of Swagger specs added with the products */
  private async getAdditionalSpecs() {
    if (!this.apiConfiguration || !this.apiConfiguration.additionalSpecs) {
      return [];
    }
    const currentDirectory = path.dirname(this.sourcePath);

    return Promise.all(
      this.apiConfiguration.additionalSpecs
        .reduce<string[]>((acc, cur) => {
          if (isGlobPattern(cur)) {
            acc.push(...globbySync(cur, { cwd: currentDirectory, onlyFiles: false }));
          } else {
            acc.push(cur);
          }
          return acc;
        }, [])
        .map((swaggerPath) => getTargetInformation(swaggerPath, currentDirectory))
    );
  }

  /** Get the envelop from the swagger Template property */
  private async getOverrideEnvelop(): Promise<SwaggerSpec | undefined> {
    if (!this.apiConfiguration) {
      return;
    }

    const currentDirectory = path.dirname(this.sourcePath);
    if (typeof this.apiConfiguration.swaggerTemplate === 'string') {
      return getTargetInformation(this.apiConfiguration.swaggerTemplate, currentDirectory);
    } else if (Array.isArray(this.apiConfiguration.swaggerTemplate)) {
      const templates = await Promise.all(
        this.apiConfiguration.swaggerTemplate
          .map((swaggerTemplate) => getTargetInformation(swaggerTemplate, currentDirectory))
      );
      const merger = new SwaggerSpecMerger(templates);
      return new SwaggerSpecObject(await merger.build(), path.join(currentDirectory, this.apiConfiguration.swaggerTemplate[0]), 'LocalPath');
    } else {
      return new SwaggerSpecObject(this.apiConfiguration.swaggerTemplate as Spec, path.join(currentDirectory, '_template.yaml'), 'LocalPath');
    }
  }

  /** @inheritdoc */
  public async parse(ignoredSwaggerPath?: string[]): Promise<void> {
    if (!this.apiConfiguration) {
      if (fs.existsSync(this.sourcePath)) {
        this.apiConfiguration = JSON.parse(await fs.promises.readFile(this.sourcePath, {encoding: 'utf8'}));
        checkJson(this.apiConfiguration!, apiConfigurationSchema, `${this.sourcePath} is invalid`);
      } else {
        throw new Error(`The Swagger ${this.sourcePath} does not exist`);
      }
    }

    const additionalSpecs = await this.getAdditionalSpecs();
    const productSpecs = await this.getProductSpecs();
    const envelop = await this.getOverrideEnvelop();
    const specs = [...productSpecs, ...additionalSpecs];
    const merger = new SwaggerSpecMerger(envelop ? [...specs, envelop] : specs, ignoredSwaggerPath);
    this.swaggerSpecConsolidated = await merger.build();
    this.isParsed = true;
  }

  /** @inheritdoc */
  public async getEnvelop(): Promise<{ [k: string]: any }> {
    if (!this.isParsed) {
      await this.parse();
    }

    if (!this.swaggerSpecConsolidated) {
      return {};
    }

    return Object.keys(this.swaggerSpecConsolidated)
      .filter((k) => !['tags', 'parameters', 'paths', 'definitions'].includes(k.toLowerCase()))
      .reduce<{ [k: string]: any }>((acc, k) => {
        acc[k] = this.swaggerSpecConsolidated[k];
        return acc;
      }, {});
  }

  /** @inheritdoc */
  public async getDefinitions(): Promise<{ [k: string]: any }> {
    if (!this.isParsed) {
      await this.parse();
    }
    return this.swaggerSpecConsolidated && this.swaggerSpecConsolidated.definitions || {};
  }

  /** @inheritdoc */
  public async getResponses(): Promise<{ [k: string]: any }> {
    if (!this.isParsed) {
      await this.parse();
    }
    return this.swaggerSpecConsolidated && this.swaggerSpecConsolidated.responses || {};
  }

  /** @inheritdoc */
  public async getParameters(): Promise<{ [k: string]: any }> {
    if (!this.isParsed) {
      await this.parse();
    }
    return this.swaggerSpecConsolidated && this.swaggerSpecConsolidated.parameters || {};
  }

  /** @inheritdoc */
  public async getPaths(): Promise<{ [k: string]: any }> {
    if (!this.isParsed) {
      await this.parse();
    }
    return this.swaggerSpecConsolidated && this.swaggerSpecConsolidated.paths || {};
  }

  /** @inheritdoc */
  public async getTags(): Promise<any[]> {
    if (!this.isParsed) {
      await this.parse();
    }
    return this.swaggerSpecConsolidated && this.swaggerSpecConsolidated.tags || [];
  }
}
