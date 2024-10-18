#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import commander from 'commander';
import {
  sync as globbySync
} from 'globby';
import semver from 'semver';
import {
  checkJson,
  isGlobPattern
} from '../core/utils';
import {
  buildSpecs
} from '../helpers/build';
import {
  ApisConfiguration,
  BuilderApiConfiguration
} from '../interfaces/apis-configuration';
import {
  BuilderConfiguration
} from '../interfaces/builder-configuration';

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

const apisConfigurationSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'schemas', 'apis-configuration.schema.json'), { encoding: 'utf8' }));
const buildConfigurationSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'schemas', 'builder-configuration.schema.json'), { encoding: 'utf8' }));
const myPackageJson: { version: string } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf8'));

const program = new commander.Command('swagger-build');
program.version(myPackageJson.version);
program.description('Merge swagger spec in inputs. The inputs can be `swagger file`, `api configuration file` or `npm package`');

program.option('--apis <path>', 'Path to the files containing a list of APIs to generate. Each APIs will be merged with the ones in argument.',
  (value: string) => {
    const apisConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), value), { encoding: 'utf8' }));
    checkJson(apisConfig, apisConfigurationSchema, `${value} is invalid`);
    return {
      ...apisConfig,
      path: value
    };
  }
);

program.option('-c, --configuration <path>', 'Configuration file',
  (value: string) => {
    const buildConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), value), { encoding: 'utf8' }));
    checkJson(buildConfig, buildConfigurationSchema, `${value} is invalid`);
    return buildConfig;
  }
);
program.option('-o, --output <path>', 'Path of the artifact generated', './result/spec');
program.option('-O, --output-format <yaml|split|json>', 'Type of artifact generated', /yaml|split|json/, 'yaml');
program.option('-v, --set-version <version>', 'Set the version of the final swagger spec', (value: string) => semver.valid(value));
program.option('-a, --artifact <name>', 'Generate package.json associated to the swagger specification with the given name as artifact name');

program.option('-i, --ignore-conflict', 'Ignore the conflict during merge of specifications (the merge will be done in the input order)');
program.option('-u, --set-version-auto', 'If enabled, the version from the current package.json will be applied to the final swagger specification');
program.option('--aws-compat', 'Change output to be compatible with AWS');
program.option('--tree-shaking', 'Apply tree shaking on swagger output (enable per default in case of black/white listing)');
program.option('--tree-shaking-strategy <bottom-up|top-down>',
  'Change tree shaking strategy\n-\'bottom-up\': recursively remove unreferenced definitions\n-\'top-down\': only keep definitions reachable from paths',
  /bottom-up|top-down/, 'bottom-up');
program.option('--no-validation', 'Deactivate bundle validation');
program.option('--flag-definition', 'Flag all definition with a vendor extension x-api-ref: {Definition name}');
program.option('--build-mdk-spec', 'Build the swagger spec to be MDK compliant');

program.arguments('[(swagger-spec|api-configuration|npm-package|glob)...]');
program.action(async (inputs: string[] = []) => {
  inputs = inputs.reduce<string[]>((acc, cur) => {
    if (isGlobPattern(cur)) {
      acc.push(...globbySync(cur, { cwd: process.cwd(), onlyFiles: false }));
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);

  const opts = program.opts();
  const buildConfig: BuilderConfiguration = opts.configuration ? { ...opts, ...opts.configuration } : opts;

  if (opts.apis) {
    const apiConfigs: BuilderApiConfiguration[] = (opts.apis as ApisConfiguration).apis;

    apiConfigs
      .forEach((api) => api.output = path.resolve(process.cwd(), path.dirname(opts.apis.path), api.output));

    for (const api of apiConfigs) {
      await buildSpecs({ ...buildConfig, ...api } as BuilderApiConfiguration,
        [
          ...inputs,
          {
            path: path.resolve(process.cwd(), opts.apis.path),
            config: api
          }
        ]
      );
    }
  } else {
    await buildSpecs(buildConfig, inputs);
  }
});

program.parse(process.argv);
