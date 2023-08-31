import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, Schematic, SchematicContext, strings, template, Tree, url } from '@angular-devkit/schematics';
import { getPackagesBaseRootFolder, getWorkspaceConfig, isNxContext } from '@o3r/schematics';
import * as path from 'node:path';
import type { NgGenerateApplicationSchema } from './schema';
import type { PackageJson } from 'type-fest';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { NgAddSchematicsSchema } from '../ng-add/schema';
import { type Schema as ApplicationOptions } from '@schematics/angular/application/schema';
import { Style } from '@schematics/angular/application/schema';

/**
 * Add an Otter application to a monorepo
 *
 * @param options Schematic options
 */
export function generateApplication(options: NgGenerateApplicationSchema): Rule {
  const cleanName = strings.dasherize(options.name);

  const addProjectSpecificFiles = (targetPath: string, rootDependencies: Record<string, string | undefined>) => {

    return mergeWith(apply(url('./templates'), [
      template({
        ...options,
        name: cleanName,
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

    /** Path to the folder where to generate the new application */
    const targetPath = path.posix.join('/', options.path || defaultRoot, cleanName);
    const extendedOptions = { ...options, targetPath, name: cleanName, projectName: cleanName };

    const rootPackageJson = tree.readJson('/package.json') as PackageJson;

    const rootDependencies = { ...rootPackageJson.dependencies, ...rootPackageJson.devDependencies };

    const angularAppSchema = context.engine.createCollection('@schematics/angular').createSchematic('application');

    const getOptions = (schema: Schematic<any, any>) => {
      const schemaOptions = schema.description.schemaJson?.properties || {};
      return Object.keys(schemaOptions);
    };
    const angularOptions = getOptions(angularAppSchema);

    return chain([
      externalSchematic<Partial<ApplicationOptions>>('@schematics/angular', 'application', {
        ...Object.entries(extendedOptions).reduce((acc, [key, value]) => (angularOptions.includes(key) ? {...acc, [key]: value} : acc), {}),
        name: extendedOptions.name,
        projectRoot: extendedOptions.targetPath,
        style: Style.Scss}),
      addProjectSpecificFiles(targetPath, rootDependencies),
      (_host: Tree, c: SchematicContext) => {
        c.addTask(new RunSchematicTask <Partial<NgAddSchematicsSchema>>('ng-add', extendedOptions));
      }
    ])(tree, context);
  };

  return ngCliUpdate;

}
