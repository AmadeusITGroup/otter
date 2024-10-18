import type { Schema, Spec } from 'swagger-schema-official';
import type { AvailableSwaggerSpecTargets, SwaggerSpec } from './swagger-spec.interface';
import { sanitizeDefinition } from './utils';

export class SwaggerSpecObject implements SwaggerSpec {
  /** @inheritdoc */
  public readonly sourcePath: string;

  /** @inheritdoc */
  public readonly targetType: AvailableSwaggerSpecTargets;

  /** Specification file loaded */
  public spec: Spec;

  /** @inheritdoc */
  public isParsed = true;

  constructor(spec: Spec, sourcePath: string, targetType: AvailableSwaggerSpecTargets) {
    this.spec = sanitizeDefinition(spec)!;
    this.sourcePath = sourcePath;
    this.targetType = targetType;
  }

  /** @inheritdoc */
  public async parse() {}

  /** @inheritdoc */
  public getEnvelop(): Promise<{ [k: string]: any }> {
    return Promise.resolve(Object.keys(this.spec)
      .filter((k) => !['tags', 'parameters', 'paths', 'definitions'].includes(k.toLowerCase()))
      .reduce<{ [k: string]: any }>((acc, k) => {
        acc[k] = this.spec[k as keyof Spec];
        return acc;
      }, {}));
  }

  /** @inheritdoc */
  public async getDefinitions(): Promise<Record<string, Schema>> {
    return Promise.resolve<Record<string, Schema>>(this.spec.definitions || {});
  }

  /** @inheritdoc */
  public async getResponses(): Promise<Record<string, Schema>> {
    return Promise.resolve<Record<string, Schema>>(this.spec.responses || {});
  }

  /** @inheritdoc */
  public async getTags(): Promise<any[]> {
    return Promise.resolve<any[]>(this.spec.tags || []);
  }

  /** @inheritdoc */
  public async getParameters(): Promise<{ [k: string]: any }> {
    return Promise.resolve<{ [k: string]: any }>(this.spec.parameters || {});
  }

  /** @inheritdoc */
  public async getPaths(): Promise<{ [k: string]: any }> {
    return Promise.resolve<{ [k: string]: any }>(this.spec.paths || {});
  }
}
