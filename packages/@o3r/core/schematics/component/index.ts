import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, noop, Rule, schematic, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { applyEsLintFix, getComponentFolderName, getDestinationPath, getInputComponentName, moduleHasSubEntryPoints, writeSubEntryPointPackageJson } from '@o3r/schematics';
import * as path from 'node:path';
import { NgGenerateComponentSchematicsSchema } from './schema';

/**
 * Execute component container schematic with provided options
 *
 * @param options
 */
function generateComponentContainer(options: NgGenerateComponentSchematicsSchema): Rule {
  return schematic('component-container', {
    projectName: options.projectName || undefined,
    componentName: options.componentName || undefined,
    prefix: options.prefix || undefined,
    componentStructure: options.componentStructure,
    description: options.description || '',
    useComponentFixtures: options.useComponentFixtures,
    useOtterConfig: options.useOtterConfig,
    useRulesEngine: options.useRulesEngine,
    path: options.path,
    useContext: options.useContext,
    skipLinter: options.skipLinter,
    standalone: options.standalone
  });
}

/**
 * Execute component presenter schematic with provided options
 *
 * @param options
 */
function generateComponentPresenter(options: NgGenerateComponentSchematicsSchema): Rule {
  return schematic('component-presenter', {
    projectName: options.projectName || undefined,
    componentName: options.componentName,
    prefix: options.prefix || undefined,
    componentStructure: options.componentStructure,
    description: options.description || '',
    useComponentFixtures: options.useComponentFixtures,
    useOtterTheming: options.useOtterTheming,
    useOtterConfig: options.useOtterConfig,
    path: options.path,
    useLocalization: options.useLocalization,
    useContext: options.useContext,
    activateDummy: options.activateDummy,
    useOtterAnalytics: options.useOtterAnalytics,
    skipLinter: options.skipLinter,
    standalone: options.standalone
  });
}

/**
 * Add Otter component to an Angular Project
 *
 * @param options
 */
export function ngGenerateComponent(options: NgGenerateComponentSchematicsSchema): Rule {

  const generateRootBarrel: Rule = (tree: Tree, _context: SchematicContext) => {
    const inputComponentName = getInputComponentName(options.componentName);
    const folderName = getComponentFolderName(inputComponentName);
    const destination = getDestinationPath('@o3r/core:component', options.path, tree, options.projectName);

    let currentComponentIndex = '';
    const barrelPath = path.posix.join(destination, 'index.ts');
    if (moduleHasSubEntryPoints(tree, destination)) {
      writeSubEntryPointPackageJson(tree, destination, strings.dasherize(options.componentName));
    } else {
      if (tree.exists(barrelPath)) {
        const currentComponentIndexBuffer = tree.read(barrelPath);
        currentComponentIndex = currentComponentIndexBuffer ? currentComponentIndexBuffer.toString() : '';
        if (!(new RegExp(`\\.[\\\\/]${folderName}[\\\\/]index`).test(currentComponentIndex))) {
          currentComponentIndex = `export * from './${folderName}/index';\n` + currentComponentIndex;
        }
        tree.overwrite(barrelPath, currentComponentIndex);
      }
    }

    if (options.useComponentFixtures) {
      const barrelFixturePath = path.posix.join(destination, 'fixtures.ts');
      if (tree.exists(barrelFixturePath)) {
        const currentComponentFixtureBuffer = tree.read(barrelFixturePath);
        let currentComponentFixture = currentComponentFixtureBuffer ? currentComponentFixtureBuffer.toString() : '';
        if (!(new RegExp(`\\.[\\\\/]${folderName}[\\\\/]fixtures`).test(currentComponentFixture))) {
          currentComponentFixture = `export * from './${folderName}/fixtures';\n` + currentComponentFixture;
        }
        tree.overwrite(barrelFixturePath, currentComponentFixture);
      }
    }
    return tree;
  };

  switch (options.componentStructure) {
    case 'container':
      return chain([
        generateRootBarrel,
        generateComponentContainer(options)
      ]);
    case 'presenter':
      return chain([
        generateRootBarrel,
        generateComponentPresenter(options)
      ]);
    default: {
      const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {

        const inputComponentName = getInputComponentName(options.componentName);
        const folderName = getComponentFolderName(inputComponentName);

        const destination = getDestinationPath('@o3r/core:component', options.path, tree, options.projectName);
        const componentDestination = path.posix.join(destination, folderName);

        return mergeWith(apply(url('./templates'), [
          template({
            ...options,
            folderName,
            generateComponentIndex: true
          }),
          move(componentDestination)
        ]), MergeStrategy.Overwrite)(tree, context);

      };

      return chain([
        generateRootBarrel,
        generateComponentPresenter(options),
        generateComponentContainer(options),
        generateFiles,
        options.skipLinter ? noop() : applyEsLintFix()
      ]);
    }
  }
}
