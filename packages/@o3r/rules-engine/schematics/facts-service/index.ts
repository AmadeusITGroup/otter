import * as path from 'node:path';
import {
  classify,
  dasherize,
} from '@angular-devkit/core/src/utils/strings';
import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  addImportsRule,
  applyEsLintFix,
  createOtterSchematic,
} from '@o3r/schematics';
import {
  NgGenerateFactsServiceSchematicsSchema,
} from './schema';

/**
 * Generate the facts service
 * @param options
 */
function ngGenerateFactsServiceFn(options: NgGenerateFactsServiceSchematicsSchema): Rule {
  const generateFiles = () => {
    const name = dasherize(options.name);
    const serviceFolderPath = path.posix.join(options.path, name);
    const ngServicePath = path.posix.join(serviceFolderPath, `${name}-facts.ts`);
    const o3rServicePath = path.posix.join(serviceFolderPath, `${name}-facts-service.ts`);
    const factsInterfaceName = `${classify(name)}Facts`;
    return chain([
      externalSchematic('@schematics/angular', 'service', {
        project: options.projectName,
        path: serviceFolderPath,
        flat: true,
        name: factsInterfaceName,
        skipTests: true
      }),
      // Angular schematics will generate this service file with this pattern: -facts.ts (since the factsInterfaceName ends with 'Facts')
      // We need to rename it to -facts-service.ts to avoid confusion with the facts file that is created just after
      move(ngServicePath, o3rServicePath),
      mergeWith(apply(url('./templates'), [
        template({
          name,
          factsInterfaceName
        }),
        renameTemplateFiles(),
        move(serviceFolderPath)
      ]), MergeStrategy.Overwrite),
      addImportsRule(o3rServicePath, [
        {
          from: '@o3r/rules-engine',
          importNames: ['FactsService', 'RulesEngineService']
        },
        {
          from: `./${name}-facts`,
          importNames: [factsInterfaceName]
        }
      ]),
      (t) => {
        const serviceText = t.readText(o3rServicePath);
        t.overwrite(
          o3rServicePath,
          serviceText
            .replace('constructor() { }', 'public facts = {};')
            .replace(`${factsInterfaceName} {`, `${factsInterfaceName} extends FactsService<${factsInterfaceName}> {`)
        );
        return t;
      }
    ]);
  };

  return chain([
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * Generate the facts service
 * @param options
 */
export const ngGenerateFactsService = createOtterSchematic(ngGenerateFactsServiceFn);
