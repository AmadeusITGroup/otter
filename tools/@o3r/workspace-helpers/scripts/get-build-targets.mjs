/*
 * The purpose of this script is to determine and print the list of build targets available in the current environment according to the machine setup.
 * It is used to define default the behavior of the `yarn build` command.
 * NOTE: The default target is `build` and the final target can be enforced by the environment variable `OTTER_BUILD_NX_TARGETS`.
 */

import {
  exec,
} from 'node:child_process';
import {
  promisify,
} from 'node:util';
import {
  gte,
  valid,
} from 'semver';

/** Name of the environment variable to override the target */
const environmentVariableName = 'OTTER_BUILD_NX_TARGETS';
/** default build targets */
const defaultBuildTargets = ['build'];
/** build targets to build Open Api templates */
const openApiTemplateBuildTargets = ['build-swagger'];

/** RegExp to retrieve JDK version */
const jdkVersionRegExp = /openjdk\s([^\s]*)/;

/**
 * Determine if the environment is ready to support the OpenApi templates build
 */
const hasOpenApiRequiredEnvironment = async () => {
  const pExec = promisify(exec);
  const javaVersionCmd = pExec('java --version');
  const mavenVersionCmd = pExec('mvn --version');

  try {
    const [javaVersion] = await Promise.all([javaVersionCmd, mavenVersionCmd]);
    const jdkVersion = javaVersion.stdout?.match(jdkVersionRegExp)?.[1];
    const isAcceptedVersion = !valid(jdkVersion) || gte(jdkVersion, '17.0.0');

    return isAcceptedVersion;
  } catch {
    return false;
  }
};

/**
 * Print the targets as output
 * @param {string[]} targets List of targets to print
 */
const printTargets = (targets) => process.stdout.write(targets.join(','));

void (async () => {
  let targets = process.env[environmentVariableName]?.split(',');
  if (targets) {
    return printTargets(targets);
  }

  const openApiTargets = await hasOpenApiRequiredEnvironment() ? openApiTemplateBuildTargets : [];

  printTargets([
    ...defaultBuildTargets,
    ...openApiTargets
  ]);
})();
