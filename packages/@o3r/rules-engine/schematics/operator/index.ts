import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, template, url } from '@angular-devkit/schematics';
import { applyEsLintFix, createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import type { NgGenerateOperatorSchematicsSchema } from './schema';
import { classify, dasherize } from '@angular-devkit/core/src/utils/strings';
import * as path from 'node:path';

/**
 * Generate the operator
 * @param options
 */
function ngGenerateOperatorFn(options: NgGenerateOperatorSchematicsSchema): Rule {

  const generateFiles = () => {
    const name = dasherize(options.name);
    const operatorFolderPath = path.posix.join(options.path, name);
    const operatorName = `${name.at(0)!.toLowerCase()}${classify(name).slice(1)}`;
    return mergeWith(apply(url('./templates'), [
      template({
        ...options,
        name,
        operatorName,
        addTyping: options.lhsType !== 'unknown' && options.rhsType !== 'unknown',
        addValidateLhs: options.lhsType === 'string' || options.lhsType === 'number' || options.lhsType === 'Date',
        addValidateRhs: !options.unaryOperator && (options.rhsType === 'string' || options.rhsType === 'number' || options.rhsType === 'Date')
      }),
      renameTemplateFiles(),
      move(operatorFolderPath)
    ]), MergeStrategy.Overwrite);
  };

  return chain([
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * Generate the operator
 * @param options
 */
export const ngGenerateOperator = createSchematicWithMetricsIfInstalled(ngGenerateOperatorFn);
