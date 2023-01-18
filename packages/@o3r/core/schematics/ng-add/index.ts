import { chain, noop, Rule } from '@angular-devkit/schematics';
import { applyEsLintFix, createAzurePipeline, generateRenovateConfig, ngAddPackages, updateAdditionalModules, updateCmsAdapter,
  updateCustomizationEnvironment, updateDapiDependencies, updateDependencies, updateDifferentialLoading, updateFixtureConfig,
  updateLinter, updateOtterEnvironmentAdapter, updatePlaywright,
  updatePrefetchBuilder, updateStore } from '@o3r/schematics';
import { updateComponentDecorators } from './component-decorator/index';
import { NgAddSchematicsSchema } from './schema';


/**
 * Add Otter library to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  const packagesToInstallWithNgAdd = [
    ...(options.enableStorybook ? ['@o3r/storybook'] : []),
    ...(options.enableLocalization ? ['@o3r/localization'] : [])
  ];
  return chain([
    updateDependencies(options, __dirname),
    updateDapiDependencies(options, __dirname),
    updateCmsAdapter(options, __dirname),
    updateOtterEnvironmentAdapter(options, __dirname),
    updateStore(options, __dirname),
    updateFixtureConfig(options, __dirname),
    updateCustomizationEnvironment(__dirname),
    options.generateAzurePipeline ? createAzurePipeline(options, __dirname) : noop,
    updatePlaywright(__dirname),
    updateLinter(options, __dirname),
    updatePrefetchBuilder(options),
    updateDifferentialLoading(options),
    updateAdditionalModules(options, __dirname),
    generateRenovateConfig(__dirname),
    ngAddPackages(packagesToInstallWithNgAdd, {skipConfirmation: true}),
    updateComponentDecorators,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}
