import {
  spawnSync,
} from 'node:child_process';
import {
  existsSync,
  promises as fs,
  rmSync,
} from 'node:fs';
import {
  EOL,
  tmpdir,
} from 'node:os';
import {
  join,
  resolve,
} from 'node:path';
import minimist from 'minimist';

/**
 * On Windows, use cmd.exe to find .cmd files in PATH:
 * - /d prevents cmd.exe from executing AutoRun commands which can interfere with the output parsing
 * - /s prevents cmd.exe from stripping quotes which are needed for arguments with spaces
 * - /c makes cmd.exe run the command and exit
 *
 * On other platforms, call the command directly without a shell.
 * @param {string} command
 * @param {string[]} args
 * @param {import('child_process').SpawnSyncOptions} options
 */
function crossPlatformSpawnSync(command, args, options) {
  if (process.platform === 'win32') {
    return spawnSync(
      process.env.comspec || 'cmd.exe',
      ['/d', '/s', '/c', command, ...args],
      { ...options, windowsVerbatimArguments: true }
    );
  }
  return spawnSync(command, args, options);
}

/** Default configuration */
const defaultConfig = {
  enableProjectLabel: true,
  enableCommitMessageLabel: true,
  projectLabelPrefix: 'project:',
  ignoredProjects: [],
  ignoreProjectForLabels: []
};

/** @type {Record<string, RegExp[]>} */
const messageTagMaps = {
  enhancement: [
    /^feat(ures?)?\b/
  ],
  bug: [
    /^(bug)?fix(es)?\b/
  ],
  'breaking change': [
    /\bbreaking([ -]changes?)?\b/
  ],
  documentation: [
    /\bdoc(s|umentation)?\b/,
    /\breadme\b/i
  ],
  deprecate: [
    /^deprecate\b/
  ]
};

/**
 * Get labels from the git log output command
 * @param {string} targetBranch
 * @param {typeof defaultConfig} config
 * @returns {string[]}
 */
function getLabelsFromMessage(targetBranch, config) {
  if (!config.enableCommitMessageLabel) {
    return [];
  }

  /** @type {Set<string>} */const commitLabels = new Set();
  const commitMessages = crossPlatformSpawnSync('git', ['log', `${targetBranch}..HEAD`, '--pretty=%B'], { encoding: 'utf8' }).stdout.trim() || '';
  const lines = commitMessages?.split(EOL) || [];

  lines.forEach((line) =>
    Object.entries(messageTagMaps)
      .filter(([, regExps]) => regExps.some((r) => r.test(line)))
      .forEach(([tag]) => commitLabels.add(tag))
  );

  return [...commitLabels];
}

/**
 * Get labels from project names
 * @param {string} targetBranch
 * @param {typeof defaultConfig} config
 * @returns {Promise<string[]>}
 */
async function getLabelsFromProjects(targetBranch, config) {
  if (!config.enableProjectLabel) {
    return [];
  }

  const /** @type {string[]} */ listTouchedFiles = crossPlatformSpawnSync('git', ['log', `${targetBranch}..HEAD`, '--name-only', '--pretty=format:""'], { encoding: 'utf8' }).stdout.trim()
    .split(EOL)
    .map((file) => file.replace(/\\/g, '/')) || [];

  const tempDirPath = join(tmpdir(), 'pr-labels');
  const graphJsonPath = join(tempDirPath, 'graph.json');
  crossPlatformSpawnSync('yarn', ['nx', 'graph', '--file', graphJsonPath], { encoding: 'utf8' });
  const { graph } = JSON.parse(await fs.readFile(graphJsonPath, { encoding: 'utf8' }));
  rmSync(tempDirPath, { recursive: true });
  const projects = Object.entries(graph.nodes);
  const labels = [];
  for (const [projectName, { data: project }] of projects) {
    if (listTouchedFiles.some((file) => file.startsWith(project.root))) {
      const packageJson = join(project.root, 'package.json');
      const /** @type {string | undefined} */ packageName = JSON.parse(await fs.readFile(packageJson, { encoding: 'utf8' })).name;
      if (!packageName) {
        process.stderr.write(`No package name found for ${projectName}${EOL}`);
        continue;
      }
      if (!config.ignoredProjects.includes(packageName)) {
        labels.push(`${config.projectLabelPrefix}${packageName}`);
      }
    }
  }

  return labels;
}

/**
 * Get the configuration from a local file
 * @returns {typeof defaultConfig}
 */
async function getConfig() {
  const configPath = resolve('.github', '.pr-labelrc.json');
  if (!existsSync(configPath)) {
    process.stderr.write(`No configuration found in the repository at ${configPath}${EOL}`);
    return defaultConfig;
  }

  const config = JSON.parse(await fs.readFile(configPath, { encoding: 'utf8' }));

  return {
    ...defaultConfig,
    ...config
  };
}

void (async () => {
  const /** @type {{target: string | undefined}} */ args = minimist(process.argv.slice(2));
  if (!args.target) {
    throw new Error('No Target provided');
  }

  const config = await getConfig();
  const target = `remotes/origin/${args.target}`;
  const labelFromMessage = getLabelsFromMessage(target, config);
  const labelFromProject = config.ignoreProjectForLabels.some((label) => labelFromMessage.includes(label))
    ? []
    : await getLabelsFromProjects(target, config);

  process.stdout.write(JSON.stringify([...(new Set([...labelFromMessage, ...labelFromProject]))]));
})();
