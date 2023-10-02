import type { Rule } from '@angular-devkit/schematics';
import { eslintFix } from '@o3r/schematics';
import type { EslintSchematicsSchema } from './schema';

/**
 * Eslint Schematics
 */
export function eslint(options: EslintSchematicsSchema): Rule {
  const { files: optionsFiles, ...linterOptions } = options;
  const files = (typeof optionsFiles === 'string' ? [optionsFiles] : optionsFiles)
    .reduce((acc: string[], file: string) => acc.concat(file.split(',')), []);
  return eslintFix(files, linterOptions);
}
