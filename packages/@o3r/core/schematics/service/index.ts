import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { applyEsLintFix, getDestinationPath, getProjectFromTree, moduleHasSubEntryPoints, writeSubEntryPointPackageJson } from '@o3r/schematics';
import * as path from 'node:path';
import { NgGenerateServiceSchematicsSchema } from './schema';


/**
 * add a Service to an Otter project
 *
 * @param options
 */
export function ngGenerateService(options: NgGenerateServiceSchematicsSchema): Rule {

  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const destination = getDestinationPath('@o3r/core:service', options.path, tree, options.projectName);

    const featureName = strings.dasherize(options.featureName);
    const name = strings.dasherize(options.name);

    let currentServiceIndex = '';
    const barrelPath = path.join(destination, 'index.ts');
    if (tree.exists(barrelPath) && !moduleHasSubEntryPoints(tree, destination)) {
      const currentServiceIndexBuffer = tree.read(barrelPath);
      currentServiceIndex = currentServiceIndexBuffer ? currentServiceIndexBuffer.toString() : '';
      if (!(new RegExp(`\\.[\\\\/]${name}[\\\\/]index`).test(currentServiceIndex))) {
        currentServiceIndex = `export * from './${name}/index';\n` + currentServiceIndex;
      }
      tree.overwrite(barrelPath, currentServiceIndex);
    }

    const barrelJasminePath = path.join(destination, name, 'fixture', 'jasmine', 'index.ts');
    const currentFixtureJasmineIndex = tree.exists(barrelJasminePath) && tree.read(barrelJasminePath)?.toString() || '';

    const barrelJestPath = path.join(destination, name, 'fixture', 'jest', 'index.ts');
    const currentFixtureJestIndex = tree.exists(barrelJestPath) && tree.read(barrelJestPath)?.toString() || '';

    const inServiceBarrelPath = path.join(destination, name, 'index.ts');
    if (tree.exists(inServiceBarrelPath)) {
      const currentServiceIndexBuffer = tree.read(inServiceBarrelPath);
      currentServiceIndex = currentServiceIndexBuffer ? currentServiceIndexBuffer.toString() : '';
    } else {
      currentServiceIndex = '';
    }

    const workspaceProject = getProjectFromTree(tree);

    let packageName = destination;
    if (workspaceProject.projectType !== 'application') {
      let rec = '..';
      while (!tree.exists(path.resolve(destination, rec, 'package.json')) && path.resolve(destination, rec) !== '/') {
        rec = path.join('..', rec);
      }
      packageName = JSON.parse(tree.read(path.resolve(destination, rec, 'package.json'))!.toString()).name?.split('/')[0] || destination;
    }

    const templateSource = apply(url('./templates'), [
      template({
        ...strings,
        ...options,
        featureName,
        currentServiceIndex,
        currentFixtureJasmineIndex,
        currentFixtureJestIndex,
        serviceName: strings.capitalize(strings.camelize(options.name + ' ' + options.featureName)),
        packageName
      }),
      renameTemplateFiles(),
      move(destination)
    ]);
    if (moduleHasSubEntryPoints(tree, destination)) {
      writeSubEntryPointPackageJson(tree, destination, strings.dasherize(name));
    }
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);

    return rule(tree, context);
  };

  return chain([
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}
