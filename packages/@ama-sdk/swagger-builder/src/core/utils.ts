import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import process from 'node:process';
import {
  load,
} from 'js-yaml';
import {
  Validator,
} from 'jsonschema';
import {
  pascalCase,
} from 'pascal-case';
import type {
  Spec,
} from 'swagger-schema-official';
import {
  SwaggerSpecJson,
} from './swagger-spec-wrappers/swagger-spec-json';
import {
  SwaggerSpecObject,
} from './swagger-spec-wrappers/swagger-spec-object';
import {
  SwaggerSpecSplit,
} from './swagger-spec-wrappers/swagger-spec-split';
import {
  SwaggerSpecYaml,
} from './swagger-spec-wrappers/swagger-spec-yaml';
import {
  AvailableSwaggerSpecTargets,
  SwaggerSpec,
} from './swagger-spec-wrappers/swagger-spec.interface';
import {
  isUrlRefPath,
} from './swagger-spec-wrappers/utils';

/** X Vendor to indicate that the definition is generated because of reference conflict */
export const X_VENDOR_CONFLICT_TAG = 'x-generated-from-conflict';

/**
 * Retrieve a remote specification targeted via http(s)
 * @param targetedSwaggerSpec Path to the swagger spec
 * @param currentDirectory Directory from which the SwaggerSpec path is based one
 */
export async function retrieveRemoteSwagger(targetedSwaggerSpec: string, currentDirectory: string) {
  const remoteSwaggerContent = await new Promise<string>((resolve, reject) =>
    https.get(targetedSwaggerSpec, (res) => {
      const { statusCode } = res;
      if (!statusCode || statusCode >= 300) {
        reject(new Error(`fail to retrieve ${targetedSwaggerSpec}`));
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => resolve(rawData));
    }).on('error', (e) => reject(e))
  );

  let spec: Spec;
  try {
    spec = JSON.parse(remoteSwaggerContent);
  } catch {
    spec = load(remoteSwaggerContent) as Spec;
  }

  return new SwaggerSpecObject(spec, currentDirectory, 'Url');
}

/**
 * Get the path to the targeted swagger spec
 * @param targetedSwaggerSpec Path to the swagger spec
 * @param currentDirectory Directory from which the SwaggerSpec path is based one
 */
export function getTargetPath(targetedSwaggerSpec: string, currentDirectory: string) {
  const localPath = path.resolve(currentDirectory, targetedSwaggerSpec);

  if (fs.existsSync(localPath)) {
    return localPath;
  }

  const file = (require.resolve.paths(targetedSwaggerSpec) || [])
    .find((p) => fs.existsSync(path.resolve(p, targetedSwaggerSpec)));

  return file;
}

/**
 * Generate a prefix for a specific item
 * @param name Name of the item for which the prefix is needed
 * @param swaggerPath Path to the swagger spec the item come from
 */
export function calculatePrefix(name: string, swaggerPath?: string) {
  let prefix = swaggerPath ? pascalCase(path.basename(swaggerPath).replace(/\.[^.]*$/, '')) : 'Base';
  prefix = name.startsWith(prefix) ? 'Base' : prefix;
  return `_${prefix}`;
}

/**
 * Get the Swagger Spec wrapper according to the type of swagger spec
 * @param targetedSwaggerSpec Path to the swagger spec
 * @param currentDirectory Directory from which the SwaggerSpec path is based one
 * @param targetType Type of target used for the Swagger Spec
 */
export async function getTargetInformation(
  targetedSwaggerSpec: string,
  currentDirectory: string = process.cwd(),
  targetType: AvailableSwaggerSpecTargets = 'LocalPath'): Promise<SwaggerSpec> {
  if (targetType === 'Url' || isUrlRefPath(targetedSwaggerSpec)) {
    return retrieveRemoteSwagger(targetedSwaggerSpec, currentDirectory);
  }

  const localPath = getTargetPath(targetedSwaggerSpec, currentDirectory);

  if (localPath) {
    const stats = await fs.promises.stat(localPath);
    if (stats.isFile()) {
      const fileType = path.extname(localPath).replace('.', '');
      if (/json/i.test(fileType)) {
        const isSplitSpec = await SwaggerSpecSplit.isSplitConfigurationFile(localPath);
        return isSplitSpec ? new SwaggerSpecSplit(localPath, targetType) : new SwaggerSpecJson(localPath, targetType);
      } else if (/ya?ml/i.test(fileType)) {
        return new SwaggerSpecYaml(localPath, targetType);
      } else {
        throw new Error(`The file ${localPath} is invalid`);
      }
    }
  }

  const artifactPath = require.resolve(targetedSwaggerSpec);
  return getTargetInformation(path.relative(currentDirectory, artifactPath), currentDirectory, 'NpmModule');
}

/**
 * Add a tag to a swagger spec object
 * @param swaggerSpec Swagger spec to edit
 * @param tag Tag to add to the Swagger Spec
 */
export function addTagToSpecObj(swaggerSpec: Partial<Spec>, tag: any): any {
  if (!tag || !swaggerSpec) {
    return;
  }

  if (swaggerSpec.tags) {
    const idx = (swaggerSpec.tags as any[]).findIndex((t) => t.name === tag.name);
    if (idx < 0) {
      swaggerSpec.tags.push(tag);
    } else {
      swaggerSpec.tags[idx] = tag;
    }
  } else {
    swaggerSpec.tags = [
      tag
    ];
  }

  return swaggerSpec;
}

/**
 * Add an item to a swagger spec object
 * @param swaggerSpec Swagger spec to edit
 * @param nodeType Type of item to add (definitions, parameters, responses, ...)
 * @param itemName Name of the item to add
 * @param item Content of the item
 * @param swaggerPath Path to swagger spec the item come from
 * @param ignoreConflict ignore the conflict and keep the original item
 */
export function addItemToSpecObj(swaggerSpec: Partial<Spec>, nodeType: keyof Spec, itemName: string, item: any, swaggerPath?: string, ignoreConflict = false
): { finalName: string; swaggerSpec: Partial<Spec> } {
  if (!item || !swaggerSpec || !itemName) {
    return { finalName: itemName, swaggerSpec };
  }

  if (swaggerSpec[nodeType]) {
    if (!(swaggerSpec[nodeType] as any)[itemName]) {
      (swaggerSpec[nodeType] as any)[itemName] = item;
    } else if (!ignoreConflict) {
      const newItemName = calculatePrefix(itemName, swaggerPath) + itemName;
      // eslint-disable-next-line no-console -- no logger available
      console.warn(`The ${nodeType} "${itemName}"${swaggerPath ? ` from "${swaggerPath}"` : ''} is conflicting, "${newItemName}" will be used instead.`);
      return addItemToSpecObj(swaggerSpec, nodeType, newItemName, { ...item, [X_VENDOR_CONFLICT_TAG]: true }, swaggerPath);
    }
  } else {
    swaggerSpec[nodeType] = {
      [itemName]: item
    } as any;
  }

  return { finalName: itemName, swaggerSpec };
}

/**
 * Add a definition to a swagger spec object
 * @param swaggerSpec Swagger spec to edit
 * @param definitionName Name of the definition to add
 * @param definition Content of the definition
 * @param swaggerPath Path to swagger spec the definition come from
 * @param ignoreConflict ignore the conflict and keep the original definition
 */
export function addDefinitionToSpecObj(swaggerSpec: Partial<Spec>, definitionName: string, definition: any, swaggerPath?: string, ignoreConflict = false
): { finalName: string; swaggerSpec: Partial<Spec> } {
  return addItemToSpecObj(swaggerSpec, 'definitions', definitionName, definition, swaggerPath, ignoreConflict);
}

/**
 * Add a response to a swagger spec object
 * @param swaggerSpec Swagger spec to edit
 * @param responseName Name of the response to add
 * @param response Content of the response
 * @param swaggerPath Path to swagger spec the response come from
 * @param ignoreConflict ignore the conflict and keep the original response
 */
export function addResponseToSpecObj(swaggerSpec: Partial<Spec>, responseName: string, response: any, swaggerPath?: string, ignoreConflict = false
): { finalName: string; swaggerSpec: Partial<Spec> } {
  return addItemToSpecObj(swaggerSpec, 'responses', responseName, response, swaggerPath, ignoreConflict);
}

/**
 * Add a parameter to a swagger spec object
 * @param swaggerSpec Swagger spec to edit
 * @param parameterName Name of the parameter to add
 * @param parameter Content of the parameter
 * @param swaggerPath Path to swagger spec the parameter come from
 * @param ignoreConflict ignore the conflict and keep the original definition
 */
export function addParameterToSpecObj(swaggerSpec: Partial<Spec>, parameterName: string, parameter: any, swaggerPath?: string, ignoreConflict = false
): { finalName: string; swaggerSpec: Partial<Spec> } {
  return addItemToSpecObj(swaggerSpec, 'parameters', parameterName, parameter, swaggerPath, ignoreConflict);
}

/**
 * Get the validity of a given JSON object
 * @param jsonObject Object to check
 * @param schema Json Schema to apply to the object
 * @param errorMessage Error message display to the error
 */
export function checkJson(jsonObject: object, schema: Record<string, unknown>, errorMessage = 'invalid format'): void {
  const validator = new Validator();
  const validation = validator.validate(jsonObject, schema);
  if (!validation.valid) {
    // eslint-disable-next-line no-console -- no logger available
    console.error(...validation.errors.map((err) => err.message));
    throw new Error(errorMessage);
  }
}

/**
 * Get the version of the local ./package.json
 */
export async function getCurrentArtifactVersion(): Promise<string | undefined> {
  const currentPackageJsonPath = path.resolve(process.cwd(), 'package.json');
  if (fs.existsSync(currentPackageJsonPath)) {
    const rawPackageJson = await fs.promises.readFile(currentPackageJsonPath, { encoding: 'utf8' });
    return JSON.parse(rawPackageJson).version;
  }
  return undefined;
}

/**
 * Determine if a pattern is a glob pattern
 * @param pattern Pattern to test
 */
export function isGlobPattern(pattern: string) {
  return pattern.includes('*')
    || pattern.includes('{');
}
