import type { Spec } from 'swagger-schema-official';
import { SwaggerSpec } from './swagger-spec.interface';
import { getYamlFullPath, isOuterRefPath } from './utils';

export abstract class SwaggerSpecFile implements SwaggerSpec {
  /** Determine if the YAML file has been loaded */
  protected isLoaded: boolean;

  /** @inheritdoc */
  public readonly sourcePath: string;

  /** @inheritdoc */
  public readonly targetType: 'NpmModule' | 'LocalPath';

  /** Specification file loaded */
  public spec?: Spec;
  public isParsed: boolean;

  constructor(sourcePath: string, targetType: 'NpmModule' | 'LocalPath') {
    this.sourcePath = sourcePath;
    this.isParsed = false;
    this.isLoaded = false;
    this.targetType = targetType;
  }

  /**
   * Load the Specification file
   */
  protected abstract loadSpec(): Promise<void>;

  /**
   * Convert the reference relative paths to absolute paths
   * @param currentNode Node to inspect in the Swagger spec object
   * @param field Field of the node
   */
  protected async convertOuterRefToFullPath(currentNode: any, field?: string): Promise<any> {
    if (currentNode === undefined) {
      return;
    } else if (currentNode === null) {
      return null;
    } else if (field === '$ref') {
      if (isOuterRefPath(currentNode)) {
        const [relativeSourcePath, innerPath] = currentNode.split('#');
        return getYamlFullPath(this.sourcePath, relativeSourcePath) + '#' + (innerPath as (string | undefined) || '');
      }
      return currentNode;
    } else if (Array.isArray(currentNode)) {
      return Promise.all(
        currentNode.map((n) => this.convertOuterRefToFullPath(n))
      );
    } else if (typeof currentNode === 'object') {
      const ret: Record<string, unknown> = {};
      for (const k of Object.keys(currentNode)) {
        ret[k] = await this.convertOuterRefToFullPath(currentNode[k], k);
      }
      return ret;
    }
    return currentNode;
  }

  /** @inheritdoc */
  public async parse() {
    if (!this.isLoaded) {
      await this.loadSpec();
    }
    this.isParsed = true;
  }

  /** @inheritdoc */
  public async getEnvelop(): Promise<{ [k: string]: any }> {
    await this.parse();
    return Object.keys(this.spec!)
      .filter((k) => !['tags', 'parameters', 'paths', 'definitions'].includes(k.toLowerCase()))
      .reduce<{ [k: string]: any }>((acc, k) => {
        acc[k] = this.spec![k as keyof Spec];
        return acc;
      }, {});
  }

  /** @inheritdoc */
  public async getDefinitions(): Promise<{ [k: string]: any }> {
    await this.parse();
    return await this.convertOuterRefToFullPath(this.spec!.definitions) || {};
  }

  /** @inheritdoc */
  public async getResponses(): Promise<{ [k: string]: any }> {
    await this.parse();
    return await this.convertOuterRefToFullPath(this.spec!.responses) || {};
  }

  /** @inheritdoc */
  public async getTags(): Promise<any[]> {
    await this.parse();
    return this.spec!.tags || [];
  }

  /** @inheritdoc */
  public async getParameters(): Promise<{ [k: string]: any }> {
    await this.parse();
    return await this.convertOuterRefToFullPath(this.spec!.parameters) || {};
  }

  /** @inheritdoc */
  public async getPaths(): Promise<{ [k: string]: any }> {
    await this.parse();
    return await this.convertOuterRefToFullPath(this.spec!.paths) || {};
  }
}
