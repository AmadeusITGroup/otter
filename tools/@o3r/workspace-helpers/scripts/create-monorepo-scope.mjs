import {
  readFile,
  writeFile,
} from 'node:fs/promises';
import {
  resolve,
} from 'node:path';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();
const scopeName = argv._.at(0);

/**
 * Update Verdaccio configuration to allow the new scope
 * @param {string} scopeName
 */
const updateVerdaccioConfig = async (scopeName) => {
  const configWithoutDockerPath = resolve(root, '.verdaccio/conf/config-without-docker.yaml');
  const configPath = resolve(root, '.verdaccio/conf/config.yaml');

  const packagesConfig = `
  '@${scopeName}/*':
    access: $all
    publish: $authenticated
    proxy: no-proxy`;

  /**
   * Add the package rule to the given file
   * @param {string} filePath
   */
  const addPackageRule = async (filePath) =>
    writeFile(filePath, (await readFile(filePath, { encoding: 'utf8' })).replace(/^packages:$/m, `packages:${packagesConfig}`));

  await Promise.all([
    addPackageRule(configWithoutDockerPath),
    addPackageRule(configPath)
  ]);
};

/**
 * Update IT test workflow to cache the new scope
 * @param {string} scopeName
 */
const updateItTestWorkflow = async (scopeName) => {
  const itTestPath = resolve(root, '.github/workflows/it-tests.yml');

  await writeFile(itTestPath, (await readFile(itTestPath, { encoding: 'utf8' })).replace(/^( +)\.cache\/test-app:$/m, `$1.cache/test-app\n$1!.cache/test-app/cache/@${scopeName}*`));
};

/**
 * Update .npmrc. for PR to allow the new scope
 * @param {string} scopeName
 */
const updateNpmrcPr = async (scopeName) => {
  const npmrcPrPath = resolve(root, '.npmrc.pr');

  const registryLine = `@${scopeName}:registry=https://pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter-pr/npm/registry/`;

  await writeFile(npmrcPrPath, (await readFile(npmrcPrPath, { encoding: 'utf8' })).replace(/^(registry=.*)$/m, `$1\n${registryLine}`));
};

/**
 * Update Renovate group to allow the new
 * @param {string} scopeName
 */
const updateRenovateGroup = async (scopeName) => {
  const renovateGroupPath = resolve(root, 'tools/renovate/group/otter.json');

  const renovateGroup = JSON.parse(await readFile(renovateGroupPath, { encoding: 'utf8' }));
  renovateGroup.packageRules
    .forEach(({ matchPackageNames }) => matchPackageNames.push(`/^@${scopeName}/`));

  await writeFile(renovateGroupPath, JSON.stringify(renovateGroup, null, 2) + '\n');
};

/**
 * Update package.json to include the new scope in the workspaces
 * @param {string} scopeName
 */
const updatePackageJson = async (scopeName) => {
  const packageJsonPath = resolve(root, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, { encoding: 'utf8' }));
  packageJson.workspaces.push(`packages/@${scopeName}/*`);
  packageJson.scripts['verdaccio:publish'] += ` --@${scopeName}:registry=http://127.0.0.1:4873`;
  packageJson.scripts['verdaccio:clean'] = packageJson.scripts['verdaccio:clean'].replace(/\}/g, `,${scopeName}}`);
  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
};

const updateMcp = async (scopeName) => {
  const path = resolve(root, 'tools/@o3r/mcp/src/tools/find-repositories-using-otter.ts');
  const content = await readFile(path, { encoding: 'utf8' });
  const newContent = content.replace(/(const\s*OTTER_SCOPES\s*=\s*\[)(\s*)([^]]*\])/m, `$1$2'${scopeName}',$2$3`);
  await writeFile(path, newContent);
};

(() => {
  if (!scopeName) {
    throw new Error('No scope name provided');
  }

  return Promise.all([
    updateVerdaccioConfig(scopeName),
    updateItTestWorkflow(scopeName),
    updateNpmrcPr(scopeName),
    updateRenovateGroup(scopeName),
    updatePackageJson(scopeName),
    updateMcp(scopeName)
  ]);
})();
