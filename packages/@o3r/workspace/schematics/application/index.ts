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
 * Add an Otter application to a monorepo
 * @param options Schematic options
 */
function generateApplicationFn(options: NgGenerateApplicationSchema): Rule {
  const ownPackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson;
  const packageJsonName = strings.dasherize(options.name);
  const cleanName = packageJsonName.replace(/^@/, '').replaceAll(/\//g, '-');

  const addProjectSpecificFiles = (targetPath: string, rootDependencies: Record<string, string | undefined>) => {
    return mergeWith(apply(url('./templates'), [
      template({
        ...options,
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

    return chain([
      externalSchematic<Partial<ApplicationOptions>>('@schematics/angular', 'application', {
        ...Object.entries(extendedOptions).reduce((acc, [key, value]) => (angularOptions.includes(key) ? { ...acc, [key]: value } : acc), {}),
        name: cleanName,
        projectRoot,
        style: Style.Scss }),
      addProjectSpecificFiles(targetPath, rootDependencies),
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
