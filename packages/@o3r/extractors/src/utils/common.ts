import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  O3rCliError
} from '@o3r/schematics';
import type {
  DeclarationReflection,
  ReferenceType
} from 'typedoc';
import type {
  CmsMetadataData,
  DocumentationNode
} from '../interfaces';

/**
 * Check if a component implements an interface given as a parameter
 * @param {DocumentationNode} node
 * @param {string} interfaceName
 */
export function checkComponentImplementsInterface(node: DocumentationNode, interfaceName: string) {
  return !!(
    node.reflection && node.reflection.implementedTypes
    && node.reflection.implementedTypes.find((type) => (type as ReferenceType).name === interfaceName));
}

/**
 * Check if an interface extends an interface given as a parameter
 * @param DocumentationNode} node
 * @param node
 * @param {string} interfaceName
 */
export function checkInterfaceExtendsInterface(node: DocumentationNode, interfaceName: string) {
  return !!(
    node.reflection && node.reflection.extendedTypes
    && node.reflection.extendedTypes.find((type) => (type as ReferenceType).name === interfaceName));
}

/**
 * Return the default value of the given reflection.
 * The value is cleaned to be usable by the CMS.
 * @param reflection Code reflection
 */
export function getReflectionDefaultValue(reflection: DeclarationReflection) {
  if (reflection.type?.toString() === 'string' && reflection.defaultValue) {
    // Remove leading and trailing double quotes added to strings by Typedoc
    return reflection.defaultValue.replace(/^"(.*)"$/g, '$1');
  }
  return reflection.defaultValue ? reflection.defaultValue.trim() : '';
}

/**
 * Get absolute path of a provided library
 * @param libraryName Library name (ex: @my-lib/components)
 * @param executionDir
 */
export function getLibraryModulePath(libraryName: string, executionDir: string = process.cwd()) {
  const packageJson = path.posix.join(libraryName, 'package.json');
  const packageJsonInDist = path.posix.join(libraryName, 'dist', 'package.json');

  const getPackagePath = (packageJsonPath: string) => {
    try {
      return require.resolve(packageJsonPath, {
        paths: [
          // base folder in monorepo
          path.resolve(__dirname, '..', '..', '..', '..', '..', '..'),
          // base folder in case of installed package
          path.resolve(__dirname, '..', '..', '..', '..', '..'),
          executionDir
        ]
      });
    } catch {
      return undefined;
    }
  };

  const moduleIndexPath = getPackagePath(packageJsonInDist) || getPackagePath(packageJson);
  const libraryNameForRegExp = libraryName.replace(/[\\/]+/g, '[\\\\/]').replace(/-/g, '[\\\\/-]');
  const libraryReg = new RegExp('^(.*?)' + libraryNameForRegExp + '[\\\\/]?(dist)?');
  const matches = moduleIndexPath?.match(libraryReg);
  if (!matches) {
    throw new O3rCliError(`Cannot find specified ${libraryName} in the npm packages`);
  }
  return matches[0];
}

/**
 * Get cms metadata files from the node_modules package of the provided library
 * @param modulePath Absolute path of the library (ex: my/absolute/path/@my-lib/components)
 */
export function getLibraryCmsMetadataFileNames(modulePath: string) {
  return JSON.parse(fs.readFileSync(path.join(modulePath, 'package.json')).toString()).cmsMetadata || {};
}

/**
 * Get cms metadata file paths from the node_modules package of the provided library
 * @param libraryName Library name (ex: @my-lib/components)
 * @param executionDir
 */
export function getLibraryCmsMetadata(libraryName: string, executionDir: string = process.cwd()) {
  const modulePath = getLibraryModulePath(libraryName, executionDir);
  const cmsMetadata = getLibraryCmsMetadataFileNames(modulePath) as CmsMetadataData;
  return {
    componentFilePath: cmsMetadata.componentFilePath && path.join(modulePath, cmsMetadata.componentFilePath),
    configurationFilePath: cmsMetadata.configurationFilePath && path.join(modulePath, cmsMetadata.configurationFilePath),
    localizationFilePath: cmsMetadata.localizationFilePath && path.join(modulePath, cmsMetadata.localizationFilePath),
    styleFilePath: cmsMetadata.styleFilePath && path.join(modulePath, cmsMetadata.styleFilePath),
    rulesEngineFactsFilePath: cmsMetadata.rulesEngineFactsFilePath && path.join(modulePath, cmsMetadata.rulesEngineFactsFilePath),
    rulesEngineOperatorsFilePath: cmsMetadata.rulesEngineOperatorsFilePath && path.join(modulePath, cmsMetadata.rulesEngineOperatorsFilePath),
    libraryName
  } as CmsMetadataData;
}
