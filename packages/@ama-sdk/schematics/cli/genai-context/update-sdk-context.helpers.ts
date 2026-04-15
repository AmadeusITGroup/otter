import type {
  OpenAPIV2,
  OpenAPIV3,
  OpenAPIV3_1,
} from 'openapi-types';
import type {
  PackageJson,
} from 'type-fest';

/** Supported OpenAPI document types */
export type OpenAPISpec = OpenAPIV2.Document | OpenAPIV3.Document | OpenAPIV3_1.Document;

/**
 * Represents the parsed sections of an existing SDK_CONTEXT.md file
 */
export interface ExistingContextSections {
  /** Content before the DOMAINS-START marker (null if no existing file or no markers) */
  beforeDomains: string | null;
  /** Content after the DOMAINS-END marker (null if no existing file or no markers) */
  afterDomains: string | null;
  /** Disambiguation notes extracted from the file */
  disambiguation: string;
}

/**
 * Parse SDK_CONTEXT.md content to extract preserved sections
 * @param content The content of the SDK_CONTEXT.md file (null if file doesn't exist)
 * @returns Parsed sections or defaults if content is null
 */
export function parseExistingContext(content: string | null): ExistingContextSections {
  const defaultResult: ExistingContextSections = {
    beforeDomains: null,
    afterDomains: null,
    disambiguation: ''
  };

  if (content === null) {
    return defaultResult;
  }

  // Check if file has the domain markers
  const domainsStartMatch = content.indexOf('<!-- DOMAINS-START -->');
  const domainsEndMatch = content.indexOf('<!-- DOMAINS-END -->');

  // Extract disambiguation notes
  const disambiguationMatch = content.match(/## User Disambiguation Notes\s*\n<!-- Add project-specific clarifications below -->\n([\s\S]*?)(?=\n---|$)/);
  const disambiguation = disambiguationMatch ? disambiguationMatch[1].trim() : '';

  // If markers exist, extract the sections before and after
  if (domainsStartMatch !== -1 && domainsEndMatch !== -1 && domainsEndMatch > domainsStartMatch) {
    const beforeDomains = content.substring(0, domainsStartMatch);
    const afterDomains = content.substring(domainsEndMatch + '<!-- DOMAINS-END -->'.length);

    return {
      beforeDomains,
      afterDomains,
      disambiguation
    };
  }

  // No markers found, return just the disambiguation
  return {
    ...defaultResult,
    disambiguation
  };
}

/**
 * Result of updating package.json for prepare:context script
 */
export interface PrepareContextScriptResult {
  /** Updated package.json object */
  packageJson: PackageJson.PackageJsonStandard;
  /** Whether the prepare:context script was added */
  prepareContextAdded: boolean;
  /** Whether the build script was updated */
  buildScriptUpdated: boolean;
}

/**
 * Updates a package.json object to add prepare:context script and update build script
 * @param packageJson The package.json object to update
 * @returns Result containing updated package.json and flags indicating what was changed
 */
export function updatePackageJsonForContextScript(
  packageJson: PackageJson
): PrepareContextScriptResult {
  // Deep copy to avoid mutating the original object
  const scripts: PackageJson.Scripts = { ...packageJson.scripts };
  let prepareContextAdded = false;
  let buildScriptUpdated = false;

  // Add the prepare:context script if it doesn't exist
  if (!scripts['prepare:context']) {
    scripts['prepare:context'] = 'cpy SDK_CONTEXT.md dist/';
    prepareContextAdded = true;
  }

  // Update build script to include prepare:context if it exists and doesn't already include it
  const buildScript = scripts.build;
  if (buildScript && !buildScript.includes('prepare:context')) {
    scripts.build = `${buildScript} && npm run prepare:context`;
    buildScriptUpdated = true;
  }

  return {
    packageJson: { ...packageJson, scripts },
    prepareContextAdded,
    buildScriptUpdated
  };
}

/**
 * Represents a domain extracted from an OpenAPI specification
 * A domain groups related API operations together
 */
export interface Domain {
  /** Domain name (typically from OpenAPI tag) */
  name: string;
  /** Human-readable description of the domain */
  description: string;
  /** List of operations belonging to this domain */
  operations: {
    /** Unique operation identifier */
    operationId: string;
    /** HTTP method (GET, POST, etc.) */
    method: string;
    /** Short description of the operation */
    summary: string;
    /** API endpoint path */
    path: string;
  }[];
  /** Set of model names referenced by operations in this domain */
  models: Set<string>;
}

/** Standard HTTP methods supported in OpenAPI specifications */
export const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const satisfies `${OpenAPIV2.HttpMethods}`[];

/**
 * Extracts the model name from an OpenAPI $ref string
 * @param ref The $ref string to extract from
 * @returns The model name or null if not found
 */
export function extractRefModel(ref?: string): string | null {
  if (!ref) {
    return null;
  }
  const match = ref.match(/#\/components\/schemas\/(\w+)/);
  return match ? match[1] : null;
}

/**
 * Extracts all referenced model names from an OpenAPI operation
 * @param operation The OpenAPI operation to extract models from
 * @returns Array of model names
 */
export function extractModelsFromOperation(operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject): string[] {
  const models: string[] = [];

  const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject | undefined;
  if (requestBody?.content) {
    Object.values(requestBody.content).forEach((mediaType) => {
      const { schema } = mediaType;
      if (schema && '$ref' in schema) {
        const model = extractRefModel(schema.$ref);
        if (model) {
          models.push(model);
        }
      }
    });
  }

  if (operation.responses) {
    Object.values(operation.responses).forEach((responseOrRef) => {
      const response = responseOrRef as OpenAPIV3.ResponseObject;
      if (response.content) {
        Object.values(response.content).forEach((mediaType) => {
          const schema = mediaType.schema;
          if (schema && '$ref' in schema) {
            const model = extractRefModel(schema.$ref);
            if (model) {
              models.push(model);
            }
          } else if (schema && 'items' in schema) {
            const items = schema.items;
            if (items && '$ref' in items) {
              const itemModel = extractRefModel(items.$ref);
              if (itemModel) {
                models.push(itemModel);
              }
            }
          }
        });
      }
    });
  }

  return models;
}

/**
 * Infers a domain name from an API path
 * @param apiPath The API path to infer from
 * @returns The inferred domain name or 'default'
 */
export function inferDomainFromPath(apiPath: string): string {
  const segment = apiPath.split('/').find((s) => s && !s.startsWith('{'));
  return segment || 'default';
}

/**
 * Extracts domains from an OpenAPI specification
 * @param spec The OpenAPI specification to extract from
 * @param customDescriptions Optional custom descriptions for domains
 * @returns Map of domain names to Domain objects
 */
export function extractDomains(spec: OpenAPISpec, customDescriptions?: Record<string, string> | null): Map<string, Domain> {
  const domains = new Map<string, Domain>();
  const isV3 = 'openapi' in spec;

  if (spec.tags) {
    spec.tags.forEach((tag) => {
      const description = customDescriptions?.[tag.name] ?? tag.description ?? `Operations related to ${tag.name}`;
      domains.set(tag.name, {
        name: tag.name,
        description,
        operations: [],
        models: new Set()
      });
    });
  }

  if (spec.paths) {
    Object.entries(spec.paths).forEach(([apiPath, pathItemOrRef]) => {
      if (!pathItemOrRef) {
        return;
      }
      const pathObj = pathItemOrRef as OpenAPIV3.PathItemObject;
      HTTP_METHODS.forEach((method) => {
        const operation = pathObj[method as OpenAPIV3.HttpMethods];
        if (!operation) {
          return;
        }

        const domainName = operation.tags && operation.tags.length > 0 ? operation.tags[0] : inferDomainFromPath(apiPath);

        if (!domains.has(domainName)) {
          domains.set(domainName, {
            name: domainName,
            description: customDescriptions?.[domainName] ?? `Operations for ${domainName} (inferred from path)`,
            operations: [],
            models: new Set()
          });
        }

        const domain = domains.get(domainName)!;

        domain.operations.push({
          operationId: operation.operationId || `${method}_${apiPath.replace(/[{}/]/g, '_')}`,
          method: method.toUpperCase(),
          summary: operation.summary || operation.description || 'No description',
          path: apiPath
        });

        if (isV3) {
          extractModelsFromOperation(operation).forEach((model) => domain.models.add(model));
        }
      });
    });
  }

  return domains;
}
