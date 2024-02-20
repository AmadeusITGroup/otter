import type { JsonObject } from '@angular-devkit/core';
import type { Rule } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter telemetry to an Otter Project
 * @param options
 */
export function ngAdd(_options: NgAddSchematicsSchema): Rule {
  return (tree, context) => {
    if (tree.exists('/package.json')) {
      const packageJson = tree.readJson('/package.json') as JsonObject;
      packageJson.config ||= {};
      (packageJson.config as JsonObject).o3rMetrics = true;
      tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
    }
    context.logger.info(`
By installing '@o3r/telemetry', you have activated the collection of anonymous data for Otter builders and schematics usage.
You can deactivate it at any time by changing 'config.o3rMetrics' in 'package.json' or by setting 'O3R_METRICS' to false as environment variable.
You can also temporarily deactivate it by running your builder or schematic with '--no-o3r-metrics'.
    `);
  };
}
