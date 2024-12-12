#!/usr/bin/env node
import {
  execSync,
  spawnSync,
} from 'node:child_process';
import {
  dirname,
  extname,
  join,
  parse,
  relative,
  resolve,
} from 'node:path';
import {
  LOCAL_SPEC_FILENAME,
  SPEC_JSON_EXTENSION,
  SPEC_YAML_EXTENSION,
} from '@ama-sdk/schematics';
import type {
  CliWrapper,
} from '@o3r/telemetry';
import * as minimist from 'minimist';

const packageManagerEnv = process.env.npm_config_user_agent?.split('/')[0];
const binPath = resolve(require.resolve('@angular-devkit/schematics-cli/package.json'), '../bin/schematics.js');
const args = process.argv.slice(2);
const argv = minimist(args);

let defaultPackageManager = 'npm';
if (packageManagerEnv && ['npm', 'yarn'].includes(packageManagerEnv)) {
  defaultPackageManager = packageManagerEnv;
}

const packageManager: string = argv['package-manager'] || (argv.yarn && 'yarn') || defaultPackageManager;

if (argv._.length < 2) {
  console.error('The SDK type and project name are mandatory');
  console.info(`usage: ${packageManager} create @ama-sdk typescript <@scope/package>`);
  process.exit(-1);
}

const sdkType = argv._[0];

if (sdkType !== 'typescript') {
  console.error('Only the generation of "typescript" SDK is available');
  process.exit(-2);
}

const fullPackage = argv._[1];
const packageMatch = /^(?:@([^/@]+)\/)?([^/@]+)$/.exec(fullPackage);
if (!packageMatch) {
  console.error('Invalid package name');
  process.exit(-3);
}
const [, name, pck] = packageMatch;

const targetDirectory = name ? join('.', name, pck) : join('.', pck);
const schematicsPackage = dirname(require.resolve('@ama-sdk/schematics/package.json'));

const getYarnVersion = () => {
  try {
    return execSync('yarn --version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: {
        ...process.env,
        //  NPM updater notifier will prevents the child process from closing until it timeout after 3 minutes.
        NO_UPDATE_NOTIFIER: '1',
        NPM_CONFIG_UPDATE_NOTIFIER: 'false'
      }
    }).trim();
  } catch {
    return 'latest';
  }
};

if (argv['spec-path'] && argv['spec-package-name']) {
  console.error('--spec-path cannot be set with --spec-package-name');
  process.exit(-4);
}

/* The local file (path) which will be created in case of generation using specs from an npm module */
let localFilePathToBeCreated: string | undefined;

if (argv['spec-package-name']) {
  const localSpecFileComputedExtension = argv['spec-package-path'] && extname(argv['spec-package-path']) === '.json' ? `.${SPEC_JSON_EXTENSION}` : `.${SPEC_YAML_EXTENSION}`;
  localFilePathToBeCreated = `./${LOCAL_SPEC_FILENAME}${localSpecFileComputedExtension}`;
}

const commonSchematicArgs = [
  argv.debug === undefined ? '--debug=false' : `--debug=${argv.debug as string}`, // schematics enable debug mode per default when using schematics with relative path
  ...(name ? ['--name', name] : []),
  '--package', pck,
  '--package-manager', packageManager,
  ...(argv['exact-o3r-version'] ? ['--exact-o3r-version'] : []),
  ...(typeof argv['dry-run'] === 'undefined' ? [] : [`--${!argv['dry-run'] || argv['dry-run'] === 'false' ? 'no-' : ''}dry-run`]),
  ...(typeof argv['o3r-metrics'] === 'undefined' ? [] : [`--${!argv['o3r-metrics'] || argv['o3r-metrics'] === 'false' ? 'no-' : ''}o3r-metrics`])
];

const resolveTargetDirectory = resolve(process.cwd(), targetDirectory);

const run = () => {
  const isSpecRelativePath = !!argv['spec-path'] && !parse(argv['spec-path']).root;
  const shellSchematicArgs = [
    ...commonSchematicArgs,
    ...(argv['spec-package-name'] ? ['--spec-package-name', argv['spec-package-name']] : []),
    ...(argv['spec-package-registry'] ? ['--spec-package-registry', argv['spec-package-registry']] : []),
    ...(argv['spec-package-path'] ? ['--spec-package-path', argv['spec-package-path']] : []),
    ...(argv['spec-package-version'] ? ['--spec-package-version', argv['spec-package-version']] : [])
  ];
  const coreSchematicArgs = [
    ...commonSchematicArgs,
    '--spec-path',
    localFilePathToBeCreated || (isSpecRelativePath ? relative(resolveTargetDirectory, resolve(process.cwd(), argv['spec-path'])) : argv['spec-path'])
  ];

  const runner = process.platform === 'win32' ? `${packageManager}.cmd` : packageManager;
  const steps: { args: string[]; cwd?: string; runner?: string }[] = [
    { args: [binPath, `${schematicsPackage}:typescript-shell`, ...shellSchematicArgs, '--directory', targetDirectory] },
    ...(
      packageManager === 'yarn'
        ? [{ runner, args: ['set', 'version', getYarnVersion()], cwd: resolveTargetDirectory }]
        : []
    ),
    ...(argv['spec-package-name']
      ? [{
        runner,
        args: [
          'exec',
          'amasdk-update-spec-from-npm',
          argv['spec-package-name'],
          ...packageManager === 'npm' ? ['--'] : [],
          '--package-path', argv['spec-package-path']
        ],
        cwd: resolveTargetDirectory
      }]
      : []),
    ...((argv['spec-path'] || argv['spec-package-name'])
      ? [{
        args: [
          binPath,
          `${schematicsPackage}:typescript-core`,
          ...coreSchematicArgs
        ],
        cwd: resolveTargetDirectory
      }]
      : [])
  ];

  const errors = steps
    .map((step) => spawnSync(step.runner || `"${process.execPath}"`, step.args, { stdio: 'inherit', cwd: step.cwd || process.cwd(), shell: true }))
    .filter(({ error, status }) => (error || status !== 0));

  if (errors.length > 0) {
    errors.forEach(({ error }) => {
      if (error) {
        console.error(error);
      }
    });
    process.exit(1);
  }
};

run();

void (async () => {
  let wrapper: CliWrapper = (fn: any) => fn;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    wrapper = createCliWithMetrics;
  } catch {
    // Do not throw if `@o3r/telemetry` is not installed
  }
  return wrapper(run, '@o3r/create:create')();
})();
