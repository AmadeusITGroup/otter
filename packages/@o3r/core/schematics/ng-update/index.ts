/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */

import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  install
} from '@o3r/schematics';
import { updateImports } from '@o3r/schematics';
import { updateCustomizationEnvironment } from '../rule-factories/customization-environment';
import { updatePlaywright } from '../rule-factories/playwright';
import { updateStoreReducerInterface } from './v4.2/store-reducer-interface';
import { updateSassFile } from './v4.3/material-theme-cssvar';
import { updatePlaywrightEnvironment } from './v4.3/playwright-update';
import { updateTypographiesCSSVar } from './v4.4/typographies-cssvar';
import { updateApiServices } from './v4/api-services';
import { updateStoreActions } from './v4/store-actions';
import { updateSubEntryImports } from './v4/sub-entries';
import { updateFixtureImport } from './v5.0/fixture-import';
import { removePonyfill } from './v6.1/remove-ponyfill';
import { useNgxPrefetch } from './v6.1/use-ngx-prefetch';
import { updateRenovateConfig } from './v6.3/update-renovate-config';
import { updatePrefetchTargetBuild } from './v6/update-angular-json';
import { updateLocalizationGeneration } from './v7.0/update-localization-generation';
import { mapImportAsyncStore } from './v8.2/import-map';
/**
 * update of Otter library V3.*
 */
export function updateV3(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateCustomizationEnvironment(__dirname),
      install
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V3.2.*
 */
export function updateV3_2(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateCustomizationEnvironment(__dirname),
      install
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V4.0.*
 */
export function updateV4_0(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateSubEntryImports(),
      updateStoreActions(),
      updateApiServices()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V4.2.*
 */
export function updateV4_2(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateStoreReducerInterface()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V4.3.*
 */
export function updateV4_3(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateSassFile(),
      updatePlaywright(__dirname),
      updatePlaywrightEnvironment()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V4.4.*
 */
export function updateV4_4(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateTypographiesCSSVar()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V5.0.*
 */
export function updateV5_0(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateFixtureImport()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V6.0.*
 */
export function updateV6_0(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updatePrefetchTargetBuild()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V6.1.*
 */
export function updateV6_1(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      useNgxPrefetch(),
      removePonyfill()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V6.3.15
 */
export function updateV6_3_15(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateRenovateConfig()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V7.0.*
 */
export function updateV7_0(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateLocalizationGeneration()
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * update of Otter library V7.1.11
 */
export function updateV7_1_11(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateRenovateConfig()
    ];

    return chain(updateRules)(tree, context);
  };
}


/**
 * update of Otter library V8.2
 */
export function updateV8_2(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateImports(mapImportAsyncStore)
    ];

    return chain(updateRules)(tree, context);
  };
}
