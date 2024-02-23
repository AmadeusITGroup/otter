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
    add: ['npm', 'install'],
    create: ['npm', 'create'],
    exec: ['npm', 'exec'],
    install: ['npm', 'install'],
    run: ['npm', 'run'],
    workspaceExec: ['npm', 'exec', '--workspace'],
    workspaceRun: ['npm', 'run', '--workspace']
  },
  yarn: {
    add: ['yarn', 'add'],
    create: ['yarn', 'create'],
    exec: ['yarn'],
    install: ['yarn', 'install'],
    run: ['yarn', 'run'],
    workspaceExec: ['yarn', 'workspace'],
    workspaceRun: ['yarn', 'workspace']
  }
};

type CommandArguments = {
  /** Script to run or execute */
  script: string;
  /** Arguments to pass to the script */
  args?: string[];
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
 * @param args
 * @param packageManager
 */
export function addDashesForNpmCommand(args?: string[], packageManager = getPackageManager()) {
  if (!args) {
    return [];
  }
  if (packageManager !== 'npm') {
    return args;
  }
  const firstArgIndex = args.findIndex((arg) => arg.startsWith('-'));
  if (firstArgIndex < 0) {
    return args;
  }
  return [...args.slice(0, firstArgIndex), '--',...args.slice(firstArgIndex)];
}

function execCmd(args: string[], execOptions: ExecSyncOptions) {
  try {
    const startTime = performance.now();
    const [runner, ...options] = args.filter((arg) => !!arg);
    const output = execFileSync(runner, options, { ...execOptions, shell: process.platform === 'win32', stdio: 'pipe', encoding: 'utf8'});
    // eslint-disable-next-line no-console
    console.log(`${args.join(' ')} [${Math.ceil(performance.now() - startTime)}ms]\n${output}`);
    return output;
  } catch (err: any) {
    // Yarn doesn't log errors on stderr, so we need to get them from stdout to have them in the reports
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Command failed: ${args.join(' ') }\nSTDERR:\n${err.stderr?.toString() || ''}\nOUTPUT:\n${err.output?.toString() || ''}`);
  }
}

/**
 * Add a new package to the project (npm install / yarn add)
 * @param packages
 * @param options
 */
export function packageManagerAdd(packages: string, options: ExecSyncOptions) {
  return execCmd([...PACKAGE_MANAGERS_CMD[getPackageManager()].add, packages], options);
}

/**
 * Create a new project (npm create / yarn create)
 * @param command
 * @param options
 * @param packageManagerOverride
 */
export function packageManagerCreate(command: CommandArguments, options: ExecSyncOptions, packageManagerOverride?: keyof typeof PACKAGE_MANAGERS_CMD) {
  const { script, args } = command;
  const packageManager = packageManagerOverride || getPackageManager();
  return execCmd([...PACKAGE_MANAGERS_CMD[packageManager].create, script, ...addDashesForNpmCommand(args, packageManager)], options);
}

/**
 * Execute a binary command (npx / yarn exec)
 * @param command
 * @param options
 */
export function packageManagerExec(command: CommandArguments, options: ExecSyncOptions) {
  const { script, args } = command;
  return execCmd([...PACKAGE_MANAGERS_CMD[getPackageManager()].exec, script, ...addDashesForNpmCommand(args)], options);
}

/**
 * Execute a binary command (npx / yarn exec) for a specific workspace
 * @param workspaceProjectName
 * @param command
 * @param options
 */
export function packageManagerWorkspaceExec(workspaceProjectName: string, command: CommandArguments, options: ExecSyncOptions) {
  const { script, args } = command;
  return execCmd([...PACKAGE_MANAGERS_CMD[getPackageManager()].workspaceExec, workspaceProjectName, script, ...addDashesForNpmCommand(args)], options);
}

/**
 * Execute a binary command (npx / yarn exec) for a specific workspace
 * @param projectName
 * @param isInWorkspace
 * @param command
 * @param options
 */
export function packageManagerExecOnProject(projectName: string, isInWorkspace: boolean, command: CommandArguments, options: ExecSyncOptions) {
  return isInWorkspace ? packageManagerWorkspaceExec(projectName, command, options) : packageManagerExec(command, options);
}

/**
 * Install the dependencies (npm install / yarn install)
 * @param options
 */
export function packageManagerInstall(options: ExecSyncOptions) {
  return execCmd(PACKAGE_MANAGERS_CMD[getPackageManager()].install, options);
}

/**
 * Execute a script from the package.json (npm run / yarn run)
 * @param command
 * @param options
 */
export function packageManagerRun(command: CommandArguments, options: ExecSyncOptions) {
  const { script, args } = command;
  return execCmd([...PACKAGE_MANAGERS_CMD[getPackageManager()].run, script, ...addDashesForNpmCommand(args)], options);
}

/**
 * Execute a script from the package.json (npm run / yarn run) for a specific workspace
 * @param workspaceProjectName
 * @param command
 * @param options
 */
export function packageManagerWorkspaceRun(workspaceProjectName: string, command: CommandArguments, options: ExecSyncOptions) {
  const { script, args } = command;
  return execCmd([...PACKAGE_MANAGERS_CMD[getPackageManager()].workspaceRun, workspaceProjectName, script, ...addDashesForNpmCommand(args)], options);
}

/**
 * Execute a script from the package.json (npx / yarn run) for a specific workspace
 * @param projectName
 * @param isInWorkspace
 * @param command
 * @param options
 */
export function packageManagerRunOnProject(projectName: string, isInWorkspace: boolean, command: CommandArguments, options: ExecSyncOptions) {
  return isInWorkspace ? packageManagerWorkspaceRun(projectName, command, options) : packageManagerRun(command, options);
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
      execFileSync('yarn', ['config', 'set', 'enableScripts', 'false'], execOptions);
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
  execFileSync('npm', ['config', 'set', 'prefer-offline=true', '-L=project'], execOptions);
  execFileSync('npm', ['config', 'set', 'ignore-scripts=true', '-L=project'], execOptions);

  if (options.globalFolderPath) {
    execFileSync('npm', ['config', 'set', `cache=${options.globalFolderPath}/npm-cache`, '-L=project'], execOptions);
  }

  if (shouldCleanPackageJson && existsSync(packageJsonPath)) {
    rmSync(packageJsonPath);
  }
}
