import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';

import { getComponentConfigKey, getLibraryNameFromPath } from '@o3r/schematics';
import { NgGenerateStorybookComponentSchematicsSchema } from './schema';
/**
 * add a Storybook stories file to an existing component
 *
 * @param options
 */
export function ngGenerateStorybookComponent(options: NgGenerateStorybookComponentSchematicsSchema): Rule {

  const componentFileRegExp = /\.component\.ts$/;

  const generateFiles = (tree: Tree, context: SchematicContext) => {
    const componentDirPath = path.resolve(process.cwd(), options.relativePathToComponentDir);
    const subFiles = tree.getDir(options.relativePathToComponentDir).subfiles;

    if (!subFiles.length) {
      context.logger.error('Component files not found. Please make sure you run the generator from the root of your project !');
      return;
    }

    const isComponentFolder = subFiles.some((file) => componentFileRegExp.test(file)) && subFiles.some((file) => /\.scss$/.test(file));

    if (!isComponentFolder) {
      context.logger.error(`The directory (${componentDirPath}) is not a presenter component directory.`);
      return;
    }

    const hasStoriesfile = subFiles.some((file) => /\.stories\.ts$/.test(file));

    if (hasStoriesfile) {
      context.logger.error(`The directory (${componentDirPath}) already contains a storybook file`);
      return;
    }

    const name = subFiles.find((file) => componentFileRegExp.test(file))?.replace(componentFileRegExp, '')!;

    const componentName = strings.capitalize(strings.camelize(name)) + 'Component';
    const componentConfig = strings.capitalize(strings.camelize(name)) + 'Config';
    const componentTranslation = strings.capitalize(strings.camelize(name)) + 'Translation';
    const projectName = options.projectName || getLibraryNameFromPath(process.cwd());
    const configKey = getComponentConfigKey(name, '');

    const templateFolder = path.join('..', 'component', 'presenter', 'templates', 'storybook');

    const templateSource = apply(url(templateFolder), [
      template({
        ...strings,
        ...options,
        name,
        componentName,
        componentConfig,
        configKey,
        componentTranslation,
        projectName
      }),
      renameTemplateFiles(),
      move('.', options.relativePathToComponentDir)
    ]);

    return mergeWith(templateSource, MergeStrategy.Error);
  };

  return generateFiles;
}
