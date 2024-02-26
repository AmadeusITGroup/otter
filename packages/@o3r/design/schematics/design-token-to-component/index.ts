import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  template,
  url
} from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import { basename, dirname, relative } from 'node:path';
import type { NgAddDesignTokenSchematicsSchema } from './schema';

/**
 * Add Design Token to an existing component
 * @param options
 */
export function ngAddDesignTokenFn(options: NgAddDesignTokenSchematicsSchema): Rule {
  const fileName = basename(options.path.endsWith('.json') ? options.path : `${options.path}.json`);
  const name = fileName.slice(0, fileName.indexOf('.') > -1 ? fileName.indexOf('.') : undefined);

  const createDesignTokenFilesRule: Rule = mergeWith(apply(url('./templates'), [
    template({
      name,
      fileName,
      stylingFile: options.stylePath ? relative(dirname(options.path), options.stylePath) : undefined
    }),
    renameTemplateFiles(),
    move(dirname(options.path))
  ]), MergeStrategy.Overwrite);

  return createDesignTokenFilesRule;
}

/**
 * Add Design Token to an existing component
 * @param options
 */
export const ngAddDesignToken = createSchematicWithMetricsIfInstalled(ngAddDesignTokenFn);
