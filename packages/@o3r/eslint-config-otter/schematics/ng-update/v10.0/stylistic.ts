import {
  readFileSync
} from 'node:fs';
import {
  resolve
} from 'node:path';
import {
  type Rule
} from '@angular-devkit/schematics';
import {
  setupDependencies
} from '@o3r/schematics';
import {
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';

/**
 * Add Stylistic package in the dependencies
 */
export const addStylistic: Rule = () => {
  const packageName = '@stylistic/eslint-plugin-ts';
  const packageJson = JSON.parse(readFileSync(resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf8' }));
  return setupDependencies({
    dependencies: {
      [packageName]: {
        inManifest: [{
          range: packageJson.peerDependencies[packageName],
          types: [NodeDependencyType.Dev]
        }]
      }
    }
  });
};
