import {SchematicContext, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import {
  addImportToModule,
  addProviderToModule,
  getRouterModuleDeclaration,
  insertImport, isImported
} from '@schematics/angular/utility/ast-utils';
import {InsertChange} from '@schematics/angular/utility/change';
import * as chalk from 'chalk';
import * as fs from 'node:fs';
import {sync as globbySync} from 'globby';
import * as path from 'node:path';
import { get } from 'node:https';
import { EOL } from 'node:os';
import {getExportedSymbolsFromFile} from './ast';
import {getProjectFromTree} from './loaders';
import type { IncomingMessage } from 'node:http';
import type { JsonObject, PackageJson } from 'type-fest';
import type { logging } from '@angular-devkit/core';
import { findClosestPackageJson } from './package-version';
import { satisfies } from 'semver';

/** Package as return by the NPM Registry */
export type NpmRegistryPackage = Pick<PackageJson, 'name' | 'description' | 'version' | 'keywords'> &
{
  /** Package name */
  name: string;
  /** Scope of the package */
  scope?: string;
  /** Links provided for the package */
  links?: {
    npm: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  };
  /** */
  package?: PackageJson;
};

/** Message Return by the NPM Registry Search commend */
export type NPMRegistrySearchResponse = {
  objects: {package ?: NpmRegistryPackage}[];
};
/**
 * Get the path to the app.module.ts
 *
 * @param tree File tree
 * @param context Context of the rule
 */
export function getAppModuleFilePath(tree: Tree, context: SchematicContext) {
  const workspaceProject = getProjectFromTree(tree, null, 'application');
  // exit if not an application
  if (!workspaceProject) {
    context.logger.debug('Register localization on main module only in application project');
    return undefined;
  }

  const mainFilePath: string = workspaceProject.architect!.build.options.main;
  const mainFile = tree.read(mainFilePath)!.toString();

  const bootstrapModuleRegexpResult = mainFile.match(/bootstrapModule\(([^)]*)\)/m);
  if (!bootstrapModuleRegexpResult || !bootstrapModuleRegexpResult[1]) {
    throw new SchematicsException('Could not find bootstrap module');
  }

  const bootstrapModule = bootstrapModuleRegexpResult[1];
  const findSource = new RegExp(`import +\\{[^}]*${bootstrapModule}[^}]*\\} +from +['"]([^'"]+)['"] *;`, 'm');

  const bootstrapModuleFileRegExpResult = mainFile.match(findSource);
  if (!bootstrapModuleFileRegExpResult || !bootstrapModuleFileRegExpResult[1]) {
    throw new SchematicsException('Could not find bootstrap module');
  }

  /** Path to the main module file */
  const moduleFilePath = path.join(path.dirname(workspaceProject.architect!.build.options.main), bootstrapModuleFileRegExpResult[1] + '.ts');

  const exportAppModuleClassRegExp = new RegExp(`class\\s+${bootstrapModule}`, 'gm');

  if (tree.exists(moduleFilePath) && tree.read(moduleFilePath)!.toString().match(exportAppModuleClassRegExp)) {
    return moduleFilePath;
  }

  const possibleAppModule = path.join(path.dirname(workspaceProject.architect!.build.options.main), path.dirname(bootstrapModuleFileRegExpResult[1]), 'app.module.ts');
  if (tree.exists(possibleAppModule) && tree.read(possibleAppModule)!.toString().match(exportAppModuleClassRegExp)) {
    return possibleAppModule;
  }

  // search app module source file in tree
  const normalizedFilePath = moduleFilePath.split(path.sep).join(path.posix.sep);
  const prog = ts.createProgram([normalizedFilePath], {});

  const symbols = getExportedSymbolsFromFile(prog, normalizedFilePath);

  const bootstrapModuleSymbol = symbols.find(s => s.name === bootstrapModule);
  const checker = prog.getTypeChecker();

  if (bootstrapModuleSymbol) {
    const pathPlusModuleString = checker.getFullyQualifiedName(bootstrapModuleSymbol);
    const filePath = pathPlusModuleString?.replace(new RegExp(`.${bootstrapModule}`), '').replace(/['"]/g, '');
    const relativeFilePath = filePath ? path.relative(path.dirname(workspaceProject.architect!.build.options.main), `${filePath}.ts`) : undefined;
    const filePathInTree = relativeFilePath ? path.join(path.dirname(workspaceProject.architect!.build.options.main), relativeFilePath) : undefined;
    if (filePathInTree && tree.exists(filePathInTree) && tree.read(filePathInTree)!.toString().match(exportAppModuleClassRegExp)) {
      return filePathInTree;
    }
  }
  throw new SchematicsException(`Could not find ${bootstrapModule} source file`);

}

/**
 * Get the path to the main.ts
 *
 * @param tree File tree
 * @param context Context of the rule
 */
export function getMainFilePath(tree: Tree, context: SchematicContext) {
  const workspaceProject = getProjectFromTree(tree, null, 'application');
  // exit if not an application
  if (!workspaceProject) {
    context.logger.debug('Register localization on main module only in application project');
    return undefined;
  }

  const mainFilePath: string = workspaceProject.architect!.build.options.main;
  return mainFilePath;
}

/**
 * Returns true if the project is an application and contains a TS file that imports the angular RouterModule in
 * one of its modules.
 *
 * @param tree
 */
export function isApplicationThatUsesRouterModule(tree: Tree) {
  const workspaceProject = getProjectFromTree(tree, null, 'application');
  return workspaceProject?.sourceRoot &&
    globbySync(path.posix.join(workspaceProject.sourceRoot, '**', '*.ts')).some((filePath) => {
      const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath).toString(), ts.ScriptTarget.ES2015, true);
      try {
        return !!getRouterModuleDeclaration(sourceFile);
      } catch {}
      return false;
    });
}

/**
 * Add import to the main module
 *
 * @param name
 * @param file
 * @param sourceFile
 * @param sourceFileContent
 * @param context
 * @param moduleFilePath
 * @param moduleIndex
 * @param recorder
 * @param moduleFunction
 * @param override
 */
export function addImportToModuleFile(name: string, file: string, sourceFile: ts.SourceFile, sourceFileContent: string, context: SchematicContext, recorder: UpdateRecorder,
                                      moduleFilePath: string, moduleIndex: number, moduleFunction?: string, override = false) {
  const importMatch = sourceFileContent.slice(moduleIndex).match(new RegExp(`(${name})(\\.[a-zA-Z\\s\\n]+\\()?(,\\n?)?`));
  if (!!importMatch && !override) {
    context.logger.warn(`Skipped ${name} (already imported)`);
    return recorder;
  } else if (importMatch?.[2]) {
    context.logger.warn(`Skipped ${name}${moduleFunction || ''} (already imported with method). Cannot override automatically`);
    return recorder;
  } else if (override && isImported(sourceFile, name, file) && !!importMatch && !Number.isNaN(importMatch.index)) {
    recorder = recorder.remove(moduleIndex + importMatch.index!, importMatch[0].length);
    recorder = recorder.insertLeft(moduleIndex + importMatch.index!, moduleIndex + importMatch.index! > moduleIndex ? name + moduleFunction! + (importMatch[3] || '') : name);
  } else {
    addImportToModule(sourceFile, moduleFilePath, name, file)
      .forEach((change) => {
        if (change instanceof InsertChange) {
          recorder = recorder.insertLeft(change.pos, moduleFunction && change.pos > moduleIndex ? change.toAdd.replace(name, name + moduleFunction) : change.toAdd);
        }
      });
  }
  return recorder;
}

/**
 * Insert import on top of the main module file
 *
 * @param name
 * @param file
 * @param sourceFile
 * @param recorder
 * @param moduleFilePath
 * @param isDefault
 */
export function insertImportToModuleFile(name: string, file: string, sourceFile: ts.SourceFile, recorder: UpdateRecorder, moduleFilePath: string, isDefault?: boolean) {
  const importChange = insertImport(sourceFile, moduleFilePath, name, file, isDefault);
  if (importChange instanceof InsertChange) {
    return recorder.insertLeft(importChange.pos, importChange.toAdd);
  }
  return recorder;
}


/**
 * Add providers to the main module
 *
 * @param name
 * @param file
 * @param sourceFile
 * @param sourceFileContent
 * @param context
 * @param recorder
 * @param moduleFilePath
 * @param moduleIndex
 * @param customProvider
 */
export function addProviderToModuleFile(name: string, file: string, sourceFile: ts.SourceFile, sourceFileContent: string, context: SchematicContext, recorder: UpdateRecorder,
                                        moduleFilePath: string, moduleIndex: number, customProvider?: string) {
  if (new RegExp(name).test(sourceFileContent.substr(moduleIndex))) {
    context.logger.warn(`Skipped ${name} (already provided)`);
    return recorder;
  }
  addProviderToModule(sourceFile, moduleFilePath, name, file)
    .forEach((change) => {
      if (change instanceof InsertChange) {
        recorder = recorder.insertLeft(change.pos, customProvider && change.pos > moduleIndex ? change.toAdd.replace(name, customProvider) : change.toAdd);
      }
    });
  return recorder;
}

/**
 * Add custom code before the module definition
 *
 * @param line
 * @param file
 * @param recorder
 * @param moduleIndex
 */
export function insertBeforeModule(line: string, file: string, recorder: UpdateRecorder, moduleIndex: number) {
  if (file.indexOf(line.replace(/[\r\n ]*/g, '')) === -1) {
    return recorder.insertLeft(moduleIndex - 1, `${line}\n\n`);
  }
  return recorder;
}

async function promiseGetRequest<T extends JsonObject>(url: string) {
  const res = await new Promise<IncomingMessage>((resolve, reject) => get(url, resolve)
    .on('error', (err) => reject(err)));

  return new Promise<T>((resolve, reject) => {
    const data: Buffer[] = [];
    res.on('data', (chunk) => data.push(chunk));
    res.on('end', () => resolve(JSON.parse(Buffer.concat(data).toString())));
    res.on('error', reject);
  });
}

/**
 * Get Available Otter modules on NPMjs.org
 *
 * @param keyword Keyword to search for Otter modules
 * @param scopeWhitelist List of whitelisted scopes
 * @param onlyNotInstalled Determine if only the packages that are NOT installed should be returned
 */
export async function getAvailableModules(keyword: string, scopeWhitelist: string[] | readonly string[], onlyNotInstalled = false): Promise<NpmRegistryPackage[]> {

  const registry = await promiseGetRequest<NPMRegistrySearchResponse>(`https://registry.npmjs.org/-/v1/search?text=keywords:${keyword}&size=250`);

  let packages = registry.objects
    .filter((pck) => pck.package?.scope && scopeWhitelist.includes(pck.package?.scope))
    .map((pck) => pck.package!);

  if (onlyNotInstalled) {
    packages = packages
      .filter((pck) => {
        try {
          require(pck.name);
          return false;
        } catch {
          return true;
        }
      });
  }

  return packages;
}

/**
 * Get Available Otter modules on NPMjs.org and get latest package information
 * Similar to {@link getAvailableModules} with additional calls to retrieve all the package's information
 *
 * @param keyword Keyword to search for Otter modules
 * @param scopeWhitelist List of whitelisted scopes
 * @param onlyNotInstalled Determine if only the packages that are NOT installed should be returned
 * @param logger Logger to use to report call failure (as debug message)
 */
export async function getAvailableModulesWithLatestPackage(
    keyword: string,
    scopeWhitelist: string[] | readonly string[],
    onlyNotInstalled = false,
    logger?: logging.LoggerApi): Promise<NpmRegistryPackage[]> {

  const packages = await getAvailableModules(keyword, scopeWhitelist, onlyNotInstalled);

  return Promise.all(
    packages
      .map(async (pck) => {
        try {
          const pckInfo = await promiseGetRequest<PackageJson>(`https://registry.npmjs.org/${pck.name}/latest`);
          return {
            ...pck,
            package: pckInfo
          };
        } catch {
          logger?.debug(`Failed to retrieve information for ${pck.name}`);
          return pck;
        }
      })
  );
}

/**
 * Format a module description to be displayed in the terminal
 *
 * @param npmPackage Npm Package to display
 * @param runner runner according to the context
 * @param keywordTags Mapping of the NPM package Keywords and a displayed tag
 * @param logger Logger to use to report package read failure (as debug message)
 */
export function formatModuleDescription(npmPackage: NpmRegistryPackage, runner: 'npx' | 'yarn' = 'npx', keywordTags: Record<string, string> = {}, logger?: logging.LoggerApi) {
  let otterVersion: string | undefined;
  const otterCorePackageName = '@o3r/core';
  const otterCoreRange = npmPackage.package?.peerDependencies?.[otterCorePackageName];

  if (npmPackage.package) {
    try {
      const otterCorePackage = findClosestPackageJson(require.resolve(otterCorePackageName));
      if (otterCorePackage) {
        const {version} = JSON.parse(fs.readFileSync(otterCorePackage, { encoding: 'utf-8'})) as PackageJson;
        otterVersion = version;
      }
    } catch {
      logger?.debug('Fail to find local Otter installation');
    }
  }

  const flags = Object.entries(keywordTags)
    .filter(([key]) => npmPackage.keywords?.includes(key))
    .map(([, flag]) => flag);

  const outdatedWarning = otterVersion && otterCoreRange && !satisfies(otterVersion, otterCoreRange) ? ' ' + chalk.yellow(`(outdated, supporting ${otterCoreRange})`) : '';

  const lines = [
    chalk.bold(`${runner} ng add ${chalk.cyan(npmPackage.name)}`) + outdatedWarning,
    chalk.italic(npmPackage.description || '<no description>'),
    ...(npmPackage.links?.npm ? [chalk.italic.grey(`(details on ${npmPackage.links.npm})`)] : []),
    ...(flags.length > 0 ? [`Tags: ${flags.map((flag) => chalk.cyan(flag)).join(', ')}`] : [])
  ];
  return lines.join(EOL);
}
