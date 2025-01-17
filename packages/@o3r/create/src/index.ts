#!/usr/bin/env node

import {
  spawnSync,
  type SpawnSyncOptionsWithBufferEncoding,
} from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {
  join,
  resolve,
} from 'node:path';
import type {
  CliWrapper,
} from '@o3r/telemetry';
import * as minimist from 'minimist';
import {
  quote,
} from 'shell-quote';
import type {
  PackageJson,
} from 'type-fest';

const { properties } = JSON.parse(
  readFileSync(require.resolve('@schematics/angular/ng-new/schema').replace(/\.js$/, '.json'), { encoding: 'utf8' })
) as { properties: Record<string, { alias?: string }> };
const { version, dependencies, devDependencies } = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), { encoding: 'utf8' })
) as PackageJson;

const optionsList = [
  'yarn-version'
];

const logo = `
                                ..                        .
                             -+=-=*-:-==+++++++++++==-::*+-=+=
                            :*:::--===================+*=-:::*:
                             **--==========================-+*
                             +*=============================++
                           :#=================================*:
                          -*=======++=====-------======+=======*=
                         -*:::..::+##--::.*@@@@@+.:--+#%=-:::::-+=
                        .#....-:..........:=##*=............=....*:
                       :#-....*:.............:..............#....:%:
                       -%:::::-*-......:-=========-:......:*-::::.#-.
                        +-.::::.-==-===-:.........:-==--===.::::.:*
                       .-*:...............:====--...............:*-.
                          ==...................................=+.
                            -+=:...........................:=+=.
                  ****-     -*=++=.................::::..-++=*=
                 +*++++*.  ++=====:.....:===+++===:.....:=====++
                 +**++++#=-+=====++...-=**%@@@@@%**=-...++=====+=
                 :%**++++*#========*+*+%@@#****#@@@%+*+*========#.
                  *****++#+===========*#%@+---: .%@#*============*
                   #****+%===+*==========#@##** .#==========++===%
                   .#****#=====***++++++**..===  %*++++++*#*+====#:
                     *#**#=======:-=#*%@@: =##*  *@@%**==========#.
                      =%*%======-...:++%@%=---+=-#@%++...-=======#
                       .+@+=====-.....=+*#%@@@@@%#*==....-======+*
                   -=++**+=======-......:===+++===:.....-========+**++=-
                  *+===============-:::.............::-================+*
                  *++====================---------====================++%
                  .**++++++=====+++****+++++++===++++++**++=======++++*#.
                    :==+++++==--:..                      .::-==++++++=:


                           ..|''||     .     .
                          .|'    ||  .||.  .||.    ....  ... ..
                          ||      ||  ||    ||   .|...||  ||' ''
                          '|.     ||  ||    ||   ||       ||
                           ''|...|'   '|.'  '|.'  '|...' .||.
`;

const binPath = join(require.resolve('@angular/cli/package.json'), '../bin/ng.js');
const args = process.argv.slice(2).filter((a) => a !== '--create-application');

// Default styling to Sass
if (!args.some((a) => a.startsWith('--style'))) {
  args.push('--style', 'scss');
}

// Default Preset to Basic
if (!args.some((a) => a.startsWith('--preset'))) {
  args.push('--preset', 'basic');
}

args.push('--no-create-application');

const supportedPackageManager = ['npm', 'yarn'];
const supportedPackageManagerRegExp = new RegExp(`^(${supportedPackageManager.join('|')})$`);

const argv = minimist(args);
const packageManagerEnv = process.env.npm_config_user_agent?.split('/')[0];
let defaultPackageManager = supportedPackageManager[0];
if (packageManagerEnv && supportedPackageManager.includes(packageManagerEnv)) {
  defaultPackageManager = packageManagerEnv;
}
const argvPackageManager = argv['package-manager'] || (argv.yarn && 'yarn');
let packageManager = supportedPackageManagerRegExp.test(argvPackageManager) ? argvPackageManager : defaultPackageManager;
if (argvPackageManager && supportedPackageManagerRegExp.test(argvPackageManager)) {
  packageManager = argvPackageManager;
} else if (argvPackageManager) {
  console.error(`The package manager option supports only npm and yarn, you provided "${argvPackageManager}"`);
  process.exit(-1);
}
const exactO3rVersion = !!argv['exact-o3r-version'];

if (argv._.length === 0) {
  console.error('The project name is mandatory');
  process.exit(-1);
}

/**
 * Determine if the argument is part of the Angular ng new declared option
 * @param arg CLI argument
 */
const isNgNewOptions = (arg: string) => {
  const entries = Object.entries(properties);
  if (arg.startsWith('--')) {
    return entries.some(([key]) => [`--${key}`, `--no-${key}`, `--${key.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}`, `--no-${key.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}`].includes(arg));
  } else if (arg.startsWith('-')) {
    return entries.some(([, { alias }]) => alias && arg === `-${alias}`);
  }

  return true;
};

const NG_NEW_ERROR_CODE = 1;
const YARN_SET_VERSION_ERROR_CODE = 2;
const ADD_O3R_CORE_ERROR_CODE = 3;
const NPM_CONFIG_REGISTRY_ERROR_CODE = 4;
const YARN_CONFIG_REGISTRY_ERROR_CODE = 5;
const INSTALL_PROCESS_ERROR_CODE = 6;

const exitProcessIfErrorInSpawnSync = (exitCode: number, { error, status }: ReturnType<typeof spawnSync>) => {
  if (error || status !== 0) {
    if (error) {
      console.error(error);
    }
    process.exit(exitCode);
  }
};

const schematicsCliOptions: any[][] = Object.entries(argv)
  .filter(([key]) => key !== '_' && !optionsList.includes(key))
  .map(([key, value]) => value === true ? [key] : (value === false && key.length > 1 ? [`no-${key}`] : [key, value]))
  .map(([key, value]) => {
    const optionKey = key.length > 1 ? `--${key}` : `-${key}`;
    return typeof value === 'undefined' ? [optionKey] : [optionKey, value];
  });

const createNgProject = () => {
  const options = schematicsCliOptions
    .filter(([key]) => isNgNewOptions(key))
    .flat();
  exitProcessIfErrorInSpawnSync(
    NG_NEW_ERROR_CODE,
    spawnSync(
      `"${process.execPath}"`,
      [
        binPath,
        'new',
        ...argv._.map((arg) => arg && quote([arg])),
        ...options.map((opt) => opt && quote([opt]))
      ],
      {
        stdio: 'inherit',
        shell: true
      }
    )
  );
};

const prepareWorkspace = (relativeDirectory = '.', projectPackageManager = 'npm') => {
  const cwd = resolve(process.cwd(), relativeDirectory);
  const spawnSyncOpts = {
    stdio: 'inherit',
    shell: true,
    cwd
  } as const satisfies SpawnSyncOptionsWithBufferEncoding;
  const runner = process.platform === 'win32' ? `${projectPackageManager}.cmd` : projectPackageManager;
  const mandatoryDependencies = [
    '@angular-devkit/schematics',
    '@schematics/angular',
    '@angular-devkit/core',
    '@angular-devkit/architect',
    '@o3r/schematics'
  ];

  const packageJsonPath = resolve(cwd, 'package.json');
  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, { encoding: 'utf8' })
      // Replace the ^ with ~ to use the same minor version for angular packages as @angular/cli
      .replace(/(@(?:angular|schematics).*)\^/g, '$1~')
  );
  packageJson.devDependencies ||= {};
  mandatoryDependencies.forEach((dep) => {
    packageJson.devDependencies![dep] = dependencies?.[dep] || devDependencies?.[dep] || 'latest';
  });
  if (exactO3rVersion) {
    const o3rPackages = ['@o3r/core', '@o3r/schematics', '@o3r/workspace'];
    const resolutions: PackageJson['resolutions'] = {};
    o3rPackages.forEach((pkg) => {
      if (packageJson.devDependencies?.[pkg]) {
        packageJson.devDependencies[pkg] = version;
      }
      resolutions[pkg] = version;
    });
    if (projectPackageManager === 'yarn') {
      packageJson.resolutions = resolutions;
    } else {
      (packageJson as any).overrides = resolutions;
    }
  }
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  if (projectPackageManager === 'yarn') {
    const yarnVersion = quote([argv['yarn-version'] || 'stable']);
    exitProcessIfErrorInSpawnSync(YARN_SET_VERSION_ERROR_CODE, spawnSync(
      runner,
      ['set', 'version', yarnVersion],
      spawnSyncOpts
    ));
  }

  const registry = process.env.npm_config_registry || (argv.registry && quote([argv.registry]));

  if (registry) {
    // Need to add this even for yarn because `ng add` only reads registry from .npmrc
    exitProcessIfErrorInSpawnSync(NPM_CONFIG_REGISTRY_ERROR_CODE, spawnSync(
      runner,
      ['config', 'set', '-L', 'project', 'registry', registry],
      spawnSyncOpts
    ));
    if (projectPackageManager === 'yarn') {
      exitProcessIfErrorInSpawnSync(YARN_CONFIG_REGISTRY_ERROR_CODE, spawnSync(
        runner,
        ['config', 'set', 'npmRegistryServer', registry],
        spawnSyncOpts
      ));
    }
  }

  writeFileSync(
    resolve(cwd, '.gitattributes'),
    [
      '* text eol=lf',
      '',
      '# Binary files',
      '*.png binary',
      '*.jpg binary',
      '*.gif binary',
      '*.jar binary',
      '*.ico binary',
      ''
    ].join('\n')
  );

  exitProcessIfErrorInSpawnSync(INSTALL_PROCESS_ERROR_CODE, spawnSync(runner, ['install'], spawnSyncOpts));
};

const addOtterFramework = (relativeDirectory = '.', projectPackageManager = 'npm') => {
  const cwd = resolve(process.cwd(), relativeDirectory);
  const runner = process.platform === 'win32' ? `${projectPackageManager}.cmd` : projectPackageManager;
  const options = schematicsCliOptions
    .flat();

  exitProcessIfErrorInSpawnSync(ADD_O3R_CORE_ERROR_CODE, spawnSync(
    runner,
    ['exec', 'ng', 'add', `@o3r/core@${exactO3rVersion ? '' : '~'}${version}`, ...(projectPackageManager === 'npm' ? ['--'] : []), ...options],
    {
      stdio: 'inherit',
      cwd,
      shell: true,
      env: exactO3rVersion && projectPackageManager === 'npm'
        ? {
          ...process.env,
          NPM_CONFIG_SAVE_EXACT: 'true'
        }
        : undefined
    }
  ));
};

const projectFolder = argv._[0]?.replaceAll(' ', '-').toLowerCase() || '.';

console.info(logo);

const run = () => {
  createNgProject();
  prepareWorkspace(projectFolder, packageManager);
  addOtterFramework(projectFolder, packageManager);
};

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
