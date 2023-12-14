import { execFileSync, ExecSyncOptions } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ENFORCED_PACKAGE_MANAGER?: string;
    }
  }
}

const PACKAGE_MANAGERS_CMD = {
  npm: {
    add: 'npm install',
    create: 'npm create',
    exec: 'npm exec',
    install: 'npm install',
    run: 'npm run',
    workspaceExec: 'npm exec -w',
    workspaceRun: 'npm run -w'
  },
  yarn: {
    add: 'yarn add',
    create: 'yarn create',
    exec: 'yarn',
    install: 'yarn install',
    run: 'yarn run',
    workspaceExec: 'yarn workspace',
    workspaceRun: 'yarn workspace'
  }
};

/**
 * Get the package manager to be used for the tests by reading environment variable ENFORCED_PACKAGE_MANAGER
 */
export function getPackageManager() {
  return (process.env.ENFORCED_PACKAGE_MANAGER && process.env.ENFORCED_PACKAGE_MANAGER in PACKAGE_MANAGERS_CMD) ?
    process.env.ENFORCED_PACKAGE_MANAGER as keyof typeof PACKAGE_MANAGERS_CMD :
    'yarn';
}

/**
 * Need to add additional dashes when running command like exec on npm
 * Convert `npm exec test --param` to `npm exec test -- --param`
 * @param command
 */
export function addDashesForNpmCommand(command: string) {
  return command.replace(/(?<!--)--(.*)$/, '-- --$1');
}

function execCmd(cmd: string, args: string, options: ExecSyncOptions) {
  try {
    const startTime = performance.now();
    const output = execFileSync(
      cmd.split(' ')[0],
      [...cmd.split(' ').slice(1), ...args.split(' ')].filter((arg) => !!arg),
      {...options, shell: process.platform === 'win32', stdio: 'pipe', encoding: 'utf8'}
    );
    // eslint-disable-next-line no-console
    console.log(`${cmd} ${args} [${Math.ceil(performance.now() - startTime)}ms]\n${output}`);
    return output;
  } catch (err: any) {
    // Yarn doesn't log errors on stderr, so we need to get them from stdout to have them in the reports
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Command failed: ${cmd} ${args}\nSTDERR:\n${err.stderr?.toString() || ''}\nOUTPUT:\n${err.output?.toString() || ''}`);
  }
}

/**
 * Add a new package to the project (npm install / yarn add)
 * @param packages
 * @param options
 */
export function packageManagerAdd(packages: string, options: ExecSyncOptions) {
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].add, packages, options);
}

/**
 * Create a new project (npm create / yarn create)
 * @param script
 * @param options
 */
export function packageManagerCreate(script: string, options: ExecSyncOptions) {
  if (getPackageManager() === 'npm') {
    script = `--yes ${addDashesForNpmCommand(script)}`;
  }
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].create, script, options);
}

/**
 * Execute a binary command (npx / yarn exec)
 * @param script
 * @param options
 */
export function packageManagerExec(script: string, options: ExecSyncOptions) {
  if (getPackageManager() === 'npm') {
    script = addDashesForNpmCommand(script);
  }
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].exec, script, options);
}

/**
 * Execute a binary command (npx / yarn exec) for a specific workspace
 * @param workspace
 * @param script
 * @param options
 */
export function packageManagerWorkspaceExec(workspace: string, script: string, options: ExecSyncOptions) {
  if (getPackageManager() === 'npm') {
    script = addDashesForNpmCommand(script);
  }
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].workspaceExec, `${workspace} ${script}`, options);
}

/**
 * Install the dependencies (npm install / yarn install)
 * @param options
 */
export function packageManagerInstall(options: ExecSyncOptions) {
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].install, '', options);
}

/**
 * Execute a script from the package.json (npm run / yarn run)
 * @param script
 * @param options
 */
export function packageManagerRun(script: string, options: ExecSyncOptions) {
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].run, script, options);
}

/**
 * Execute a script from the package.json (npm run / yarn run) for a specific workspace
 * @param workspace
 * @param script
 * @param options
 */
export function packageManagerWorkspaceRun(workspace: string, script: string, options: ExecSyncOptions) {
  if (getPackageManager() === 'npm') {
    script = addDashesForNpmCommand(script);
  }
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].workspaceRun, `${workspace} ${script}`, options);
}

export interface PackageManagerConfig {
  /**
   * Yarn version to install
   */
  yarnVersion?: string;

  /**
   * Global folder location (used to share cache between multiple apps)
   */
  globalFolderPath?: string;

  /**
   * Custom registry used to fetch local packages
   */
  registry: string;
}

/**
 * Set configuration for package manager
 * @param options
 * @param execAppOptions
 */
export function setPackagerManagerConfig(options: PackageManagerConfig, execAppOptions: ExecSyncOptions) {
  const execOptions = {...execAppOptions, shell: process.platform === 'win32'};

  // Need to add this even for yarn because `ng add` only reads registry from .npmrc
  execFileSync('npm', ['config', 'set', `@ama-sdk:registry=${options.registry}`, '-L=project'], execOptions);
  execFileSync('npm', ['config', 'set', `@ama-terasu:registry=${options.registry}`, '-L=project'], execOptions);
  execFileSync('npm', ['config', 'set', `@o3r:registry=${options.registry}`, '-L=project'], execOptions);

  const packageJsonPath = join(execOptions.cwd as string, 'package.json');
  const shouldCleanPackageJson = !existsSync(packageJsonPath);
  switch (getPackageManager()) {
    case 'yarn': {
      // Set yarn version
      if (options.yarnVersion) {
        execFileSync('yarn', ['set', 'version', options.yarnVersion], execOptions);
      }

      // Set config to target local registry
      execFileSync('yarn', ['config', 'set', 'checksumBehavior', 'update'], execOptions);
      execFileSync('yarn', ['config', 'set', 'enableImmutableInstalls', 'false'], execOptions);
      if (options.globalFolderPath) {
        execFileSync('yarn', ['config', 'set', 'enableGlobalCache', 'true'], execOptions);
        execFileSync('yarn', ['config', 'set', 'globalFolder', options.globalFolderPath], execOptions);
      }
      execFileSync('yarn', ['config', 'set', 'nodeLinker', 'pnp'], execOptions);
      execFileSync('yarn', ['config', 'set', 'npmScopes.ama-sdk.npmRegistryServer', options.registry], execOptions);
      execFileSync('yarn', ['config', 'set', 'npmScopes.ama-terasu.npmRegistryServer', options.registry], execOptions);
      execFileSync('yarn', ['config', 'set', 'npmScopes.o3r.npmRegistryServer', options.registry], execOptions);
      execFileSync('yarn', ['config', 'set', 'unsafeHttpWhitelist', '127.0.0.1'], execOptions);
      break;
    }
  }

  execFileSync('npm', ['config', 'set', 'audit=false', '-L=project'], execOptions);
  execFileSync('npm', ['config', 'set', 'fund=false', '-L=project'], execOptions);
  execFileSync('npm', ['config', 'set', 'legacy-peer-deps=true', '-L=project'], execOptions);
  execFileSync('npm', ['config', 'set', 'prefer-offline=true', '-L=project'], execOptions);

  if (options.globalFolderPath) {
    execFileSync('npm', ['config', 'set', `cache=${options.globalFolderPath}/npm-cache`, '-L=project'], execOptions);
  }

  if (shouldCleanPackageJson && existsSync(packageJsonPath)) {
    rmSync(packageJsonPath);
  }
}
