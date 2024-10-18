import type {
  SchematicContext
} from '@angular-devkit/schematics';
import type {
  AvailableTestFrameworks,
  WorkspaceSchema
} from '../../interfaces';
import {
  getSchematicOptions
} from '../../utility/index';

const testPackageMaps: Record<AvailableTestFrameworks, string[]> = {
  'jest': ['jest'],
  'jasmine': ['jasmine-core']
};

/**
 * Get the test framework
 * @param workspaceOptions the workspace options
 * @param context
 */
export function getTestFramework(workspaceOptions: WorkspaceSchema | null, context: SchematicContext): AvailableTestFrameworks | undefined {
  if (workspaceOptions) {
    const testFramework = getSchematicOptions(workspaceOptions, context)?.testFramework;
    if (testFramework) {
      return testFramework;
    }
  }
  return Object.entries(testPackageMaps)
    .find(([_, deps]) => {
      return deps.some((dep) => {
        try {
          return !!require.resolve(`${dep}/package.json`);
        } catch {
          return false;
        }
      });
    })?.[0] as AvailableTestFrameworks;
}
