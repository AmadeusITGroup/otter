import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  removePackages,
} from '@o3r/schematics';

/**
 * Rule to remove dependencies to `@o3r/styling` and `@o3r/design` packages
 * These packages are no longer needed as dependencies in `@o3r/core`
 */
export const removeStylingDesignDependencies: Rule = removePackages([
  '@o3r/styling',
  '@o3r/design'
]);
