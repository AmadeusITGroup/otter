import * as path from 'node:path';
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
  schematic,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getComponentFileName,
  getComponentFolderName,
  getComponentName,
  getComponentSelectorWithoutSuffix,
  getDestinationPath,
  getInputComponentName,
  getLibraryNameFromPath,
  getWorkspaceConfig,
} from '@o3r/schematics';
import {
  getAddAnalyticsRules,
} from '../../rule-factories/component/analytics';
import {
  getAddConfigurationRules,
} from '../../rule-factories/component/configuration';
import {
  getAddContextRules,
} from '../../rule-factories/component/context';
import {
  getAddDesignTokenRules,
} from '../../rule-factories/component/design-token';
import {
  getAddFixtureRules,
} from '../../rule-factories/component/fixture';
import {
  getAddLocalizationRules,
} from '../../rule-factories/component/localization';
import {
  getAddThemingRules,
} from '../../rule-factories/component/theming';
import {
  NgGenerateComponentSchematicsSchema,
} from '../schema';
import {
  ComponentStructureDef,
} from '../structures.types';

export const PRESENTER_FOLDER = 'presenter';

/**
 * Generates the template properties
 * @param options
 * @param componentStructureDef
 * @param prefix
 */
const getTemplateProperties = (options: NgGenerateComponentSchematicsSchema, componentStructureDef: ComponentStructureDef, prefix?: string) => {
  const inputComponentName = getInputComponentName(options.componentName);
  const folderName = getComponentFolderName(inputComponentName);
  const structure: string = componentStructureDef === ComponentStructureDef.Simple ? '' : componentStructureDef;

  return {
    ...options,
    componentName: getComponentName(inputComponentName, structure).replace(/Component$/, ''),
    componentSelector: getComponentSelectorWithoutSuffix(options.componentName, prefix || null),
    projectName: options.projectName || getLibraryNameFromPath(options.path),
    folderName,
    name: getComponentFileName(options.componentName, structure),
    suffix: structure.toLowerCase(),
    description: options.description || ''
  };
};

/**
 * Add Otter component to an Angular Project
 * @param options
 */
function ngGenerateComponentPresenterFn(options: NgGenerateComponentSchematicsSchema): Rule {
  const fullStructureRequested = options.componentStructure === 'full';

  const generateFiles = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    const properties = getTemplateProperties(
      options,
      options.componentStructure === 'simple' ? ComponentStructureDef.Simple : ComponentStructureDef.Pres,
      options.prefix || workspaceProject?.prefix
    );

    const destination = getDestinationPath('@o3r/core:component', options.path, tree, options.projectName);
    const componentDestination = path.posix.join(destination, fullStructureRequested ? path.posix.join(properties.folderName, PRESENTER_FOLDER) : properties.folderName);
    const componentPath = path.posix.join(componentDestination, `${properties.name}.ts`);
    const stylePath = path.posix.join(componentDestination, `${properties.name}.scss`);
    const o3rDesignTokenPath = path.posix.join(componentDestination, `${properties.name}.theme.json`);
    const componentSelector = `${properties.componentSelector}${properties.suffix ? ('-' + properties.suffix) : ''}`;

    const rules: Rule[] = [];

    if (!options.standalone) {
      rules.push(
        externalSchematic('@schematics/angular', 'module', {
          project: properties.projectName,
          path: componentDestination,
          flat: true,
          name: properties.componentName
        })
      );
    }

    rules.push(
      mergeWith(apply(url('./templates'), [
        template(properties),
        renameTemplateFiles(),
        move(componentDestination)
      ]), MergeStrategy.Overwrite),
      externalSchematic('@schematics/angular', 'component', {
        project: properties.projectName,
        selector: componentSelector,
        path: componentDestination,
        name: properties.componentName,
        inlineStyle: false,
        inlineTemplate: false,
        viewEncapsulation: 'None',
        changeDetection: 'OnPush',
        style: 'scss',
        skipSelector: false,
        standalone: options.standalone,
        ...(
          options.standalone
            ? {
              skipImport: true
            }
            : {
              module: `${properties.name}-module.ts`,
              export: true
            }
        ),
        flat: true
      }),
      schematic('convert-component', {
        path: componentPath,
        skipLinter: options.skipLinter
      }),
      getAddConfigurationRules(
        componentPath,
        options
      ),
      getAddThemingRules(
        stylePath,
        options
      ),
      getAddDesignTokenRules(
        stylePath,
        o3rDesignTokenPath,
        options
      ),
      getAddLocalizationRules(
        componentPath,
        options
      ),
      getAddFixtureRules(
        componentPath,
        options
      ),
      getAddAnalyticsRules(
        componentPath,
        options
      ),
      getAddContextRules(
        componentPath,
        options
      )
    );

    return chain(rules);
  };

  return chain([
    generateFiles,
    fullStructureRequested ? noop() : (options.skipLinter ? noop() : applyEsLintFix())
  ]);
}

/**
 * Add Otter component to an Angular Project
 * @param options
 */
export const ngGenerateComponentPresenter = createOtterSchematic(ngGenerateComponentPresenterFn);
