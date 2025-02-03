import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  Schematic,
  strings,
  template,
  type Tree,
  url,
} from '@angular-devkit/schematics';
import {
  createSchematicWithMetricsIfInstalled,
  type DependencyToAdd,
  enforceTildeRange,
  getPackagesBaseRootFolder,
  getWorkspaceConfig,
  isNxContext,
  setupDependencies,
} from '@o3r/schematics';
import {
  type Schema as ApplicationOptions,
} from '@schematics/angular/application/schema';
import {
  Style,
} from '@schematics/angular/application/schema';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import type {
  PackageJson,
} from 'type-fest';
import {
  updateProjectTsConfig,
} from '../rule-factories/index';
import type {
  NgGenerateApplicationSchema,
} from './schema';

/**
 * Find the relative path to a configuration file at the monorepo root
 * Note: This function is a duplicate of {@link import('@o3r/schematics').findConfigFileRelativePath} required due to TS Import issue
 * @param tree
 * @param files List of files to look for, the first of the list will be used
 * @param originPath Path from where to calculate the relative path
 */
function findConfigFileRelativePath(tree: Tree, files: string[], originPath: string) {
  const foundFile = files.find((file) => tree.exists(`/${file}`));
  if (foundFile === undefined) {
    return '';
  }

  return path.posix.relative(originPath, `/${foundFile}`);
}

/**
 * Add an Otter application to a monorepo
 * @param options Schematic options
 */
function generateApplicationFn(options: NgGenerateApplicationSchema): Rule {
  const ownPackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson;
  const packageJsonName = strings.dasherize(options.name);
  const cleanName = packageJsonName.replace(/^@/, '').replaceAll(/\//g, '-');

  const addProjectSpecificFiles = (targetPath: string, rootDependencies: Record<string, string | undefined>, tsconfigBasePath: string) => {
    return mergeWith(apply(url('./templates'), [
      template({
        ...options,
        tsconfigBasePath,
        enforceTildeRange,
        name: packageJsonName,
        rootDependencies
      }),
      move(targetPath),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);
  };

  const ngCliUpdate: Rule = (tree, context) => {
    if (options.style && options.style !== 'scss') {
      context.logger.warn('The provided "style" option will be ignored. "SCSS" will be used.');
    }

    const config = getWorkspaceConfig(tree);
    if (!options.path && !config) {
      throw new Error('The `path` option is not provided and no workspace configuration file found to define it.');
    }
    if (isNxContext(tree)) {
      throw new Error('NX is not currently supported. Feature tracked via https://github.com/AmadeusITGroup/otter/issues/720');
    }

    const defaultRoot = getPackagesBaseRootFolder(tree, context, config!, 'application');

    /** Project Root used by the Angular application schematic */
    const projectRoot = path.posix.join(options.path || defaultRoot, cleanName);
    /** Path to the folder where to generate the new application */
    const targetPath = path.posix.join('/', projectRoot);
    const extendedOptions = { ...options, targetPath, name: cleanName, projectName: cleanName };

    const rootPackageJson = tree.readJson('/package.json') as PackageJson;

    const rootDependencies = { ...rootPackageJson.dependencies, ...rootPackageJson.devDependencies };

    const angularAppSchema = context.engine.createCollection('@schematics/angular').createSchematic('application');

    const getOptions = (schema: Schematic<any, any>) => {
      const schemaOptions = schema.description.schemaJson?.properties || {};
      return Object.keys(schemaOptions);
    };
    const angularOptions = getOptions(angularAppSchema);

    const dependencies = {
      '@o3r/core': {
        inManifest: [
          {
            range: `${options.exactO3rVersion ? '' : '~'}${ownPackageJsonContent.version!}`,
            types: [NodeDependencyType.Default]
          }
        ],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      }
    } as const satisfies Record<string, DependencyToAdd>;

    const tsconfigBasePath = findConfigFileRelativePath(tree, ['tsconfig.base.json', 'tsconfig.json'], targetPath);

    return chain([
      externalSchematic<Partial<ApplicationOptions>>('@schematics/angular', 'application', {
        ...Object.entries(extendedOptions).reduce((acc, [key, value]) => (angularOptions.includes(key) ? { ...acc, [key]: value } : acc), {}),
        name: cleanName,
        projectRoot,
        style: Style.Scss }),
      addProjectSpecificFiles(targetPath, rootDependencies, tsconfigBasePath),
      updateProjectTsConfig(targetPath, 'tsconfig.app.json', { updateInputFiles: true }),
      setupDependencies({
        dependencies,
        skipInstall: options.skipInstall,
        ngAddToRun: Object.keys(dependencies),
        projectName: cleanName
      })
    ])(tree, context);
  };

  return ngCliUpdate;
}

/**
 * Add an Otter application to a monorepo
 * @param options Schematic options
 */
export const generateApplication = createSchematicWithMetricsIfInstalled(generateApplicationFn);
