import type { Rule } from '@angular-devkit/schematics';
import type { PackageJson } from 'type-fest';
import { readPackageJson } from '../../../helpers/read-package';
import { DevInstall } from '../../../helpers/node-install';

/**
 * Update the scrips from package.json
 */
export const updateScriptPackageJson = (): Rule => (tree, context) => {
  if (!tree.exists('/package.json')) {
    context.logger.warn('Can not find package.json, update process will be skipped');
    return tree;
  }

  const pck = tree.readJson('/package.json') as PackageJson;
  if (pck.scripts?.['doc:generate'] === 'node scripts/override-readme.js && typedoc && node scripts/restore-readme.js') {
    pck.scripts['doc:generate'] = 'cpx ./readme.md ./.readme-backup && typedoc && cpx ./.readme-backup ./readme.md && rimraf ./.readme-backup';
  }
  if (pck.scripts?.['files:pack'] === 'node scripts/files-pack.js') {
    pck.scripts['files:pack'] = 'amasdk-files-pack';
  }
  if (pck.scripts?.['spec:regen'] && /[^ ]+ run generate && [^ ]+ run clear-index/.test(pck.scripts['spec:regen'])) {
    pck.scripts['spec:regen'] = pck.scripts['spec:regen'].replace(/^(.+) run generate && .*/, '$1 run generate && amasdk-clear-index');
  }

  tree.overwrite('/package.json', JSON.stringify(pck, null, 2));
  return tree;
};

/**
 * Deprecate the scripts folder
 */
export const deprecateScriptsFolder = (): Rule => (tree) => {
  if (tree.exists('/scripts')) {
    tree.create('/scripts/readme.md', `## Deprecation

The following scripts of this folder are not used anymore, if there is no custom code inside, it can be removed:

- clear-index.js
- files-pack.js
- override-readme.js
- restore-readme.js
`);
  }
  return tree;
};

/**
 * Add the CPY dependencies
 */
export const addCpyDependencies = (): Rule => async (tree, context) => {
  const amaSdkSchematicsPackageJson = await readPackageJson();
  context.addTask(new DevInstall({ packageName: `cpy@${amaSdkSchematicsPackageJson.devDependencies!.cpy as string}`}));
  context.addTask(new DevInstall({ packageName: `cpy-cli@${amaSdkSchematicsPackageJson.devDependencies!['cpy-cli'] as string}` }));
  return () => tree;
};
