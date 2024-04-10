import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import type { Operation, PathObject } from '@ama-sdk/core';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import * as semver from 'semver';
import * as sway from 'sway';

import { OpenApiCliOptions } from '../../code-generator/open-api-cli-generator/open-api-cli.options';
import { treeGlob } from '../../helpers/tree-glob';
import { NgGenerateTypescriptSDKCoreSchematicsSchema } from './schema';
import { OpenApiCliGenerator } from '../../code-generator/open-api-cli-generator/open-api-cli.generator';

const JAVA_OPTIONS = ['specPath', 'specConfigPath', 'globalProperty', 'outputPath'];
const OPEN_API_TOOLS_OPTIONS = ['generatorName', 'output', 'inputSpec', 'config', 'globalProperty'];

interface OpenApiToolsGenerator {
  /** Location of the OpenAPI spec, as URL or file */
  inputSpec: string;
  /** Output path for the generated SDK */
  output: string;
  /** Generator to use */
  generatorName: string;
  /** Path to configuration file. It can be JSON or YAML */
  config?: string;
  /** Sets specified global properties */
  globalProperty?: string | Record<string, any>;
}

interface OpenApiToolsGeneratorObject {
  [generatorName: string]: OpenApiToolsGenerator;
}

interface OpenApiToolsGeneratorCli {
  version: string;
  generators: OpenApiToolsGeneratorObject;
}

interface OpenApiToolsConfiguration {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'generator-cli': OpenApiToolsGeneratorCli;
}

const getRegexpTemplate = (regexp: RegExp) => `new RegExp('${regexp.toString().replace(/\/(.*)\//, '$1').replace(/\\\//g, '/')}')`;

const getPathObjectTemplate = (pathObj: PathObject) => {
  return `{
      ${
  (Object.keys(pathObj) as (keyof PathObject)[]).map((propName) => {
    const value = (propName) === 'regexp' ? getRegexpTemplate(pathObj[propName]) : JSON.stringify(pathObj[propName]);
    return `${propName as string}: ${value}`;
  }).join(',')
}
    }`;
};

const getProperties = (propertyMap: Map<string, any>, properties: string) => {
  const propertiesArray = properties.split(',');
  propertiesArray.forEach((property) => {
    const [propName, propValue] = property.split('=');
    propertyMap.set(propName, propValue ?? true);
  });
  return propertyMap;
};

const getGeneratorOptions = (tree: Tree, context: SchematicContext, options: NgGenerateTypescriptSDKCoreSchematicsSchema) => {
  let openApiToolsJson: OpenApiToolsConfiguration | undefined;
  let openApiToolsJsonGenerator: OpenApiToolsGenerator | undefined;
  const openApiToolsPath = path.posix.join(options.directory || '', 'openapitools.json');

  // read openapitools.json
  if (tree.exists(openApiToolsPath)) {
    try {
      openApiToolsJson = (tree.readJson(openApiToolsPath) as any as OpenApiToolsConfiguration);
    } catch (e: any) {
      context.logger.warn(`File ${openApiToolsPath} could not be parsed. Error message:\n${e}`);
    }
  } else {
    context.logger.warn(`File not found at ${openApiToolsPath}`);
  }
  const openApiVersion = openApiToolsJson?.['generator-cli'].version;

  // get generator config if generator key is provided
  if (openApiToolsJson && options.generatorKey) {
    openApiToolsJsonGenerator = openApiToolsJson['generator-cli'].generators?.[options.generatorKey];
    if (!openApiToolsJsonGenerator) {
      context.logger.warn(`Generator ${options.generatorKey} not found in ${openApiToolsPath} file`);
    } else if (openApiToolsJsonGenerator.generatorName !== 'typescriptFetch') {
      context.logger.warn(`Generator ${openApiToolsJsonGenerator.generatorName} is not supported. By default, the generator name is set to typescriptFetch (the only supported generator).`);
    }
  }

  const specPath = options.specPath || openApiToolsJsonGenerator?.inputSpec;
  if (!specPath) {
    throw new Error('Path to the swagger/open-api specification is undefined');
  }

  const generatorOptions: Partial<OpenApiCliOptions> = {specPath};

  const packageJsonFile: { openApiSupportedVersion?: string } = JSON.parse((readFileSync(path.join(__dirname, '..', '..', '..', 'package.json'))).toString());
  const packageOpenApiSupportedVersionRange = packageJsonFile.openApiSupportedVersion;
  const packageOpenApiSupportedVersion = packageOpenApiSupportedVersionRange && semver.minVersion(packageOpenApiSupportedVersionRange)?.version;
  if (!!packageOpenApiSupportedVersionRange && !!packageOpenApiSupportedVersion
    && semver.valid(packageOpenApiSupportedVersion) && (!openApiVersion || !semver.satisfies(openApiVersion, packageOpenApiSupportedVersionRange))
  ) {
    generatorOptions.generatorVersion = packageOpenApiSupportedVersion;
    context.logger.warn((openApiVersion ? `Version ${openApiVersion} is not supported` : `Version not provided`) + `, fallback to ${packageOpenApiSupportedVersion}`);
  } else if (!!openApiVersion && semver.valid(openApiVersion)) {
    generatorOptions.generatorVersion = openApiVersion;
  }

  const specConfigPath = options.specConfigPath || openApiToolsJsonGenerator?.config;
  const outputPath = options.outputPath || openApiToolsJsonGenerator?.output;

  // combine global properties from openapitools.json and options
  let globalPropertyMap: Map<string, any> = new Map();
  if (openApiToolsJsonGenerator?.globalProperty) {
    if (typeof openApiToolsJsonGenerator.globalProperty === 'object') {
      Object.entries(openApiToolsJsonGenerator.globalProperty).forEach(([key, value]) => globalPropertyMap.set(key, value));
    } else {
      globalPropertyMap = getProperties(globalPropertyMap, openApiToolsJsonGenerator.globalProperty);
    }
  }
  if (options.globalProperty) {
    globalPropertyMap = getProperties(globalPropertyMap, options.globalProperty);
  }
  const globalProperty = Array.from(globalPropertyMap).map(([key, value]) => `${key}=${value}`).join(',');

  // get openApi normalizer properties from options
  let openapiNormalizerMap: Map<string, any> = new Map();
  if (options.openapiNormalizer) {
    openapiNormalizerMap = getProperties(openapiNormalizerMap, options.openapiNormalizer);
  }
  const openapiNormalizer = Array.from(openapiNormalizerMap).map(([key, value]) => `${key}=${value}`).join(',');

  // log warning of options that won't be taken into account if generator key and other options are provided in the command
  if (options.generatorKey && openApiToolsJsonGenerator && JAVA_OPTIONS.some((optionName) => typeof options[optionName] !== undefined)) {
    Object.keys(openApiToolsJsonGenerator).filter((option) => !OPEN_API_TOOLS_OPTIONS.includes(option))
      .forEach((ignoredOption) => context.logger.warn(`Option ${ignoredOption} from ${openApiToolsPath} will not be taken into account`));
  }

  return {
    ...generatorOptions,
    ...(outputPath ? {outputPath} : {}),
    ...(specConfigPath ? {specConfigPath} : {}),
    ...(globalProperty ? {globalProperty} : {}),
    ...(openapiNormalizer ? {openapiNormalizer} : {}),
    ...(options.generatorCustomPath ? {generatorCustomPath: options.generatorCustomPath} : {})
  };
};

/**
 * Generate a typescript SDK source code base on swagger specification
 * @param options
 */
function ngGenerateTypescriptSDKFn(options: NgGenerateTypescriptSDKCoreSchematicsSchema): Rule {

  return (tree, context) => {
    const targetPath = options.directory || '';
    const generatorOptions = getGeneratorOptions(tree, context, options);

    /**
     * rule to clear previous SDK generation
     */
    const clearGeneratedCode = () => {
      treeGlob(tree, path.posix.join(targetPath, 'src', 'api', '**', '*.ts')).forEach((file) => tree.delete(file));
      treeGlob(tree, path.posix.join(targetPath, 'src', 'models', 'base', '**', '!(index).ts')).forEach((file) => tree.delete(file));
      treeGlob(tree, path.posix.join(targetPath, 'src', 'spec', '!(operation-adapter|index).ts')).forEach((file) => tree.delete(file));
      return tree;
    };

    const generateOperationFinder = async (): Promise<PathObject[]> => {
      const swayOptions = {
        definition: path.resolve(generatorOptions.specPath!)
      };
      const swayApi = await sway.create(swayOptions);
      const extraction = swayApi.getPaths().map((obj) => ({
        path: obj.path,
        regexp: obj.regexp as RegExp,
        operations: obj.getOperations().map((op: any) => ({method: op.method, operationId: op.operationId} as Operation))
      }));
      return extraction || [];
    };

    /**
     * rule to update readme and generate mandatory code source
     */
    const generateSource = async () => {
      const pathObjects = await generateOperationFinder();
      const swayOperationAdapter = `[${pathObjects.map((pathObj) => getPathObjectTemplate(pathObj)).join(',')}]`;

      return mergeWith(apply(url('./templates'), [
        template({
          ...options,
          swayOperationAdapter,
          empty: ''
        }),
        move(targetPath),
        renameTemplateFiles()
      ]), MergeStrategy.Overwrite);
    };

    /**
     * Update local swagger spec file
     */
    const updateSpec = () => {
      const readmeFile = path.posix.join(targetPath, 'readme.md');
      const specContent = readFileSync(generatorOptions.specPath!).toString();
      if (tree.exists(readmeFile)) {
        const specVersion = /version: *([0-9]+\.[0-9]+\.[0-9]+(?:-[^ ]+)?)/.exec(specContent);

        if (specVersion) {
          const readmeContent = tree.read(readmeFile)!.toString('utf8');
          tree.overwrite(readmeFile, readmeContent.replace(/Based on (OpenAPI|Swagger) spec .*/i, `Based on $1 spec ${specVersion[1]}`));
        }
      }

      if (tree.exists(path.posix.join(targetPath, 'swagger-spec.yaml'))) {
        tree.overwrite(path.posix.join(targetPath, 'swagger-spec.yaml'), specContent);
      } else {
        tree.create(path.posix.join(targetPath, 'swagger-spec.yaml'), specContent);
      }
      return () => tree;
    };

    const runGeneratorRule = () => {
      return () => (new OpenApiCliGenerator(options)).getGeneratorRunSchematic(
        (options.generatorKey && JAVA_OPTIONS.every((optionName) => options[optionName] === undefined)) ?
          {
            generatorKey: options.generatorKey,
            ...(generatorOptions.generatorVersion ? {generatorVersion: generatorOptions.generatorVersion} : {}),
            ...(options.openapiNormalizer ? {openapiNormalizer: options.openapiNormalizer} : {})
          } : generatorOptions,
        {rootDirectory: options.directory || undefined}
      );
    };

    return chain([
      clearGeneratedCode,
      generateSource,
      updateSpec,
      runGeneratorRule
    ]);
  };
}

/**
 * Generate a typescript SDK source code base on swagger specification
 * @param options
 */
export const ngGenerateTypescriptSDK = (options: NgGenerateTypescriptSDKCoreSchematicsSchema) => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngGenerateTypescriptSDKFn)(options);
};
