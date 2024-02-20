#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import * as minimist from 'minimist';
import type { PackageJson } from 'type-fest';


const { properties } = JSON.parse(
  readFileSync(require.resolve('@schematics/angular/ng-new/schema').replace(/\.js$/, '.json'), { encoding: 'utf-8' })
) as { properties: Record<string, { alias?: string }> };
const { version, dependencies, devDependencies } = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), { encoding: 'utf-8' })
) as PackageJson;

const optionsList = [
  'yarn-version'
];

const logo = `

                        &BPPPB                    &                    &BPGB&
                      #Y7!!!!!J#    &#BGP5YYJJ??????????JJYY5PG#&     P7!!!!7JG
                     #!!!!!!!!!7Y5J?7!!!!!!!!!!!!!!!!!!!!!!!!!!!7?JPB5!!!!!!!!!G
                     #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!~5
                      BJ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!?5
                       &?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7B
                      G?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!75&
                    #J!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!?B
                   P7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Y&
                 &Y!!!!!!!!!!!!7??!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!777!!!!!!!!!!!!!?#
                &?!!!!!!!!!!!!J&J&#7!!!!!!!!7?Y5PPPP55J7!!!!!!!!!5B?&P!!!!!!!!!!!!!7B
               &?!!!!!!!!!!!!!?B##P!!!!!!!!!5          &?!!!!!!!!Y&&&P!!!!!!!!!!!!!!!B
               J!!!!!!!!J7!!!!!!7!!!!!!!!!!!7YB&      BY!!!!!!!!!!777!!!!!!!?7!!!!!!!7#
              P!!!!!!!!YB!!!!!!!!!!!!!!!!!!!!!!7JY5YJ?!!!!!!!!!!!!!!!!!!!!!!YG!!!!!!!!J
             &7!!!!!!!!GG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!J&7!!!!!!!!B
             B!!!!!!!!!Y&7!!!!!!!!!!!!!!!!!!77JY5PPP5YJ?7!!!!!!!!!!!!!!!!!!!BG!!!!!!!!!Y
             B!!!!!!!!!!P#Y7!!!!!!!!!!!!7JY5P5YJ????JJY5PP5J?!!!!!!!!!!!!!JBG7!!!!!!!!!J
             B!!!!!!!!!!!?PG5J?7777?JY5PPYJ7!!!!!!!!!!!!!7J5PPPYJ?77!77?5GBY!!!!!!!!!!!5
              J!!!!!!!!!!!!7JY555555YJ?7!!!!!!!!!!!!!!!!!!!!!7?JY5555555Y?!!!!!!!!!!!!!#
              #?!!!!!!!!!!!!!!!!!!!!!!!!!!!!7JYJJJ?JJJYY?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!P
               &J!!!!!!!!!!!!!!!!!!!!!!!!!!!!7?JYYYYJ??7!!!!!!!!!!!!!!!!!!!!!!!!!!!!7G
                 G?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!75&
                   BY?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7JG&
                      #PYJ?7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!77?YPB&
  &BPPB              &Y7JYYYJ7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7?YYYJ??B
 #?!!!!?P           B7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!5
 Y!!!!!!!?B        P!!!!!!!!7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Y
 Y!!!!!!!!!Y&     P!!!!!!!!!5Y!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!?Y7!!!!!!!!Y
 5!!!!!!!!!!7G   G!!!!!!!!!!75GY7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!?PP?!!!!!!!!!!5
 #!!!!!!!!!!!!Y&#7!!!!!!!!!!!!?5GPY7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7?5GPJ!!!!!!!!!!!!!G
  J!!!!!!!!!!!7&Y!!!!!!!!!!!!!!!7J5GPY?7!!!!!!!!!!!!!!!!!!!!!!7JPGPJ7!!!!!!!!!!!!!!!7&
  #7!!!!!!!!!!5#!!!!!!!!!!!!!!!!!!!!?Y5PPY?!!!!!!!!!!!!!!!7J5PPY?7!!!!!!!!!!!!!!!!!!!5
   G!!!!!!!!!7&Y!!!!!!!!!!!!!!!!!!!!!!!!?YGG7!!!!!!!!!!!!5BPJ7!!!!!!!!!!!!!!!!!7!!!!!7&
    P!!!!!!!!J&7!!!!!?P5?!!!!!!!!!!!!!!!!!!P&7!!!!!!!!!!P#7!!!!!!!!!!!!!!!!!7YPY!!!!!!B
     P!!!!!!!5#!!!!!!!7YGG5?7!!!!!!!!!!!!!!G#7!!!!!!!!!!P&7!!!!!!!!!!!!!!?YPBP?!!!!!!!P
      B7!!!!!PB!!!!!!!!!!?YPGP5J??777777J5GP7!!!!!!!!!!!7P#PJ?77!777?JYPGGPJ7!!!!!!!!!5
       &J!!!!PB!!!!!!!!!!!!!!?J5PPPPPPPP5Y7!!!!!!!!!!!!!!!7YPGGPPPPPP5YJ7!!!!!!!!!!!!!5
         P7!!5#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7!!!!!!!!!!!!!!!7!!!!!!!!!!!!!!!!!!!!!P
          &5!? ?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!YPY5Y!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!B
            #Y#G!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!75P5GJ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!?
                ?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7!!77!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7#
       &##BGPP557!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7Y5PPGBB#&
   &PJ?77!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7?J5#
  &?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!B
  B!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!5
  &?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!B
   #J!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!7777????JJJJJJJYYYYJJJJJJJ????7777!!!!!!!!!!!!!!!!!!!!!!!!!!!7G
     GJ?7!!!!!!!!!777??JJY55PGGBB##&&&&                          &&&##BBGPP5YJ??777!!!!!!!!!!7?5#
       &#BBGGGGBB##&&                                                           &&#BBGGPPPGGB#



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

const argv = minimist(args);
const packageManagerEnv = process.env.npm_config_user_agent?.split('/')[0];
let defaultPackageManager = 'npm';
if (packageManagerEnv && ['npm', 'yarn'].includes(packageManagerEnv)) {
  defaultPackageManager = packageManagerEnv;
}
const packageManager = argv['package-manager'] || defaultPackageManager;

if (argv._.length === 0) {
  // eslint-disable-next-line no-console
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

const schematicsCliOptions: any[][] = Object.entries(argv)
  .filter(([key]) => key !== '_' && !optionsList.includes(key))
  .map(([key, value]) => value === true && [key] || value === false && key.length > 1 && [`no-${key}`] || [key, value])
  .map(([key, value]) => {
    const optionKey = key.length > 1 ? `--${key}` : `-${key}`;
    return typeof value === 'undefined' ? [optionKey] : [optionKey, value];
  });

const createNgProject = () => {
  const options = schematicsCliOptions
    .filter(([key]) => isNgNewOptions(key))
    .flat();
  const { error } = spawnSync(process.execPath, [binPath, 'new', ...argv._, ...options], {
    stdio: 'inherit'
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

const prepareWorkspace = (relativeDirectory = '.', projectPackageManager = 'npm') => {
  const cwd = resolve(process.cwd(), relativeDirectory);
  const runner = process.platform === 'win32' ? `${projectPackageManager}.cmd` : projectPackageManager;
  const mandatoryDependencies = [
    '@angular-devkit/schematics',
    '@schematics/angular',
    '@angular-devkit/core',
    '@angular-devkit/architect'
  ];

  const packageJsonPath = resolve(cwd, 'package.json');
  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, { encoding: 'utf-8' })
      // Replace the ^ with ~ to use the same minor version for angular packages as @angular/cli
      .replace(/(@(?:angular|schematics).*)\^/g, '$1~')
  );
  packageJson.devDependencies ||= {};
  mandatoryDependencies.forEach((dep) => {
    packageJson.devDependencies![dep] = dependencies?.[dep] || devDependencies?.[dep] || 'latest';
  });
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  if (projectPackageManager === 'yarn') {
    const setVersionError = spawnSync(runner, ['set', 'version', argv['yarn-version'] || 'stable'], {
      stdio: 'inherit',
      cwd
    }).error;

    if (setVersionError) {
      // eslint-disable-next-line no-console
      console.error(setVersionError);
      process.exit(2);
    }
  }

  const installError = spawnSync(runner, ['install'], {
    stdio: 'inherit',
    cwd
  }).error;

  if (installError) {
    // eslint-disable-next-line no-console
    console.error(installError);
    process.exit(2);
  }
};

const addOtterFramework = (relativeDirectory = '.', projectPackageManager = 'npm') => {
  const cwd = resolve(process.cwd(), relativeDirectory);
  const runner = process.platform === 'win32' ? `${projectPackageManager}.cmd` : projectPackageManager;
  const options = schematicsCliOptions
    .flat();

  const { error } = spawnSync(runner, ['exec', 'ng', 'add', `@o3r/core@~${version}`, ...(projectPackageManager === 'npm' ? ['--'] : []), ...options], {
    stdio: 'inherit',
    cwd
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(3);
  }
};

const projectFolder = argv._[0]?.replaceAll(' ', '-').toLowerCase() || '.';

console.info(logo);
createNgProject();
prepareWorkspace(projectFolder, packageManager);
addOtterFramework(projectFolder, packageManager);
