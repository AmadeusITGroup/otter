import type { OpenApiToolsConfiguration, OpenApiToolsGenerator, PathObject } from '@ama-sdk/core';
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
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { URL } from 'node:url';
import * as semver from 'semver';
import type { JsonObject } from 'type-fest';

import { OpenApiCliOptions } from '../../code-generator/open-api-cli-generator/open-api-cli.options';
import { treeGlob } from '../../helpers/tree-glob';
import { NgGenerateTypescriptSDKCoreSchematicsSchema } from './schema';
import { OpenApiCliGenerator } from '../../code-generator/open-api-cli-generator/open-api-cli.generator';
import { generateOperationFinderFromSingleFile } from './helpers/path-extractor';

const JAVA_OPTIONS = ['specPath', 'specConfigPath', 'globalProperty', 'outputPath'];
const OPEN_API_TOOLS_OPTIONS = ['generatorName', 'output', 'inputSpec', 'config', 'globalProperty'];

// TODO: Change to `open-api` when #1735 is done
/** Name of the specification file copied locally (without extension) */
export const LOCAL_SPEC_FILENAME = 'swagger-spec';
/** Extension of the Specification file in YAML format */
export const SPEC_YAML_EXTENSION = 'yaml';
// TODO: Change to `json` when #1735 is done
/** Extension of the Specification file in JSON format */
export const SPEC_JSON_EXTENSION = 'yaml';

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
      openApiToolsJson = tree.readJson(openApiToolsPath) as JsonObject & OpenApiToolsConfiguration;
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
  if (options.generatorKey && openApiToolsJsonGenerator && JAVA_OPTIONS.some((optionName) => typeof options[optionName] !== 'undefined')) {
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

  return async (tree, context) => {
    const targetPath = options.directory || '';
    const generatorOptions = getGeneratorOptions(tree, context, options);
    let isJson = false;
    let specDefaultPath = path.posix.join(targetPath, `${LOCAL_SPEC_FILENAME}.${SPEC_JSON_EXTENSION}`);
    specDefaultPath = existsSync(specDefaultPath) ? specDefaultPath : path.posix.join(targetPath, `${LOCAL_SPEC_FILENAME}.${SPEC_YAML_EXTENSION}`);
    generatorOptions.specPath ||= specDefaultPath;

    let specContent!: string;
    if (URL.canParse(generatorOptions.specPath) && (new URL(generatorOptions.specPath)).protocol.startsWith('http')) {
      specContent = await (await fetch(generatorOptions.specPath)).text();
    } else {
      const specPath = path.isAbsolute(generatorOptions.specPath) || !options.directory ?
        generatorOptions.specPath : path.join(options.directory, generatorOptions.specPath);
      specContent = readFileSync(specPath, {encoding: 'utf-8'}).toString();
    }

    try {
      JSON.parse(specContent);
      isJson = true;
    } catch (e) {
      isJson = false;
    }
    const defaultFileName = `${LOCAL_SPEC_FILENAME}.${isJson ? SPEC_JSON_EXTENSION : SPEC_YAML_EXTENSION}`;
    specDefaultPath = path.posix.join(targetPath, defaultFileName);
    generatorOptions.specPath = defaultFileName;

    if (tree.exists(specDefaultPath)) {
      tree.overwrite(specDefaultPath, specContent);
    } else {
      tree.create(specDefaultPath, specContent);
    }

    /**
     * rule to clear previous SDK generation
     */
    const clearGeneratedCode: Rule = () => {
      treeGlob(tree, path.posix.join(targetPath, 'src', 'api', '**', '*.ts')).forEach((file) => tree.delete(file));
      treeGlob(tree, path.posix.join(targetPath, 'src', 'models', 'base', '**', '!(index).ts')).forEach((file) => tree.delete(file));
      treeGlob(tree, path.posix.join(targetPath, 'src', 'spec', '!(operation-adapter|index).ts')).forEach((file) => tree.delete(file));
      return tree;
    };

    const generateOperationFinder = async (): Promise<PathObject[]> => {
      const specification: any = isJson ? tree.readJson(specDefaultPath) : (await import('js-yaml')).load(tree.readText(specDefaultPath));
      const extraction = generateOperationFinderFromSingleFile(specification);
      return extraction || [];
    };

    /**
     * rule to update readme and generate mandatory code source
     */
    const generateSource: Rule = async () => {
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
     * Update readme version
     */
    const updateSpecVersion: Rule = () => {
      const readmeFile = path.posix.join(targetPath, 'readme.md');
      if (tree.exists(readmeFile)) {
        const specVersion = /version: *([0-9]+\.[0-9]+\.[0-9]+(?:-[^ ]+)?)/.exec(specContent);

        if (specVersion) {
          const readmeContent = tree.read(readmeFile)!.toString('utf8');
          tree.overwrite(readmeFile, readmeContent.replace(/Based on (.+) spec .*/i, `Based on $1 spec ${specVersion[1]}`));
        }
      }
      return tree;
    };

    const adaptDefaultFile: Rule = () => {
      const openApiToolsPath = path.posix.join(targetPath, 'openapitools.json');
      if (tree.exists(openApiToolsPath)) {
        const openApiTools = tree.readJson(openApiToolsPath) as JsonObject & OpenApiToolsConfiguration;
        const generators = openApiTools['generator-cli']?.generators;
        if (generators) {
          Object.keys(generators)
            .filter((key) => !openApiTools['generator-cli'].generators[key].inputSpec)
            .forEach((key) => openApiTools['generator-cli'].generators[key].inputSpec = `./${defaultFileName}`);
          tree.overwrite(openApiToolsPath, JSON.stringify(openApiTools, null, 2));
        }
      }
      return tree;
    };

    const runGeneratorRule: Rule = () => {
      return (new OpenApiCliGenerator(options)).getGeneratorRunSchematic(
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
      updateSpecVersion,
      adaptDefaultFile,
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
