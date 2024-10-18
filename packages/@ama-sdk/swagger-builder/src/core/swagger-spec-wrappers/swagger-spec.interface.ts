import type {
  BodyParameter,
  Path,
  QueryParameter,
  Schema,
  Tag
} from 'swagger-schema-official';

/** Swagger spec available as target of $ref field */
export type AvailableSwaggerSpecTargets = 'NpmModule' | 'LocalPath' | 'Url';

/** Interface to describe the source of loaded swagger spec */
export interface SwaggerSpec {
  /** Swagger Target type */
  targetType: AvailableSwaggerSpecTargets;

  /** Path to the Swagger Spec */
  sourcePath: string;

  /** Determine if the Swagger Spec has been parsed */
  isParsed: boolean;

  /**
   * Parse the Swagger spec
   * @param ignoredSwaggerPath List of external swagger path to ignore
   */
  parse(ignoredSwaggerPath?: string[]): Promise<void>;

  /** Return the envelop part of the Swagger Spec */
  getEnvelop(): Promise<{ [k: string]: any }>;

  /** Return the definitions part of the Swagger Spec */
  getDefinitions(): Promise<Record<string, Schema>>;

  /** Return the responses part of the Swagger Spec */
  getResponses(): Promise<Record<string, Schema>>;

  /** Return the parameters part of the Swagger Spec */
  getParameters(): Promise<Record<string, BodyParameter | QueryParameter>>;

  /** Return the paths part of the Swagger Spec */
  getPaths(): Promise<Record<string, Path>>;

  /** Return the tags part of the Swagger Spec */
  getTags(): Promise<Tag[]>;
}
