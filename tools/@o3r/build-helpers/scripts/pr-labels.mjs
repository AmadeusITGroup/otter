import { EOL } from 'node:os';
import { spawnSync } from 'node:child_process';
import { promises as fs, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import minimist from 'minimist'

/** Default configuration */
const defaultConfig = {
  enableProjectLabel: true,
  enableCommitMessageLabel: true,
  projectLabelPrefix: 'project:',
  ignoredProjects: [],
  ignoreProjectForLabels: []
};

/**
 * Get labels from the git log output command
 *
 * @param {string} targetBranch
 * @return {Promise<string[]>}
 */
async function getLabelsFromMessage(targetBranch, config) {
  if (!config.enableCommitMessageLabel) {
    return [];
  }

  const commitLabels = [];
  const commitMessages = spawnSync('git', ['log', `${targetBranch}..HEAD`, '--pretty=%B'], { encoding: 'utf-8', shell: true }).stdout.trim() || '';
  const lines = commitMessages?.split(EOL) || [];

  lines.forEach((line) => {
    if (line.match(/^feat(ures?)?\b/)) {
      commitLabels.push('enhancement');
    } else if (line.match(/^(bug)?fix(es)?\b/)) {
      commitLabels.push('bug');
    }

    if (line.match(/\bbreaking([- ]changes?)?\b/)) {
      commitLabels.push('breaking change');
    }

    const docRegExps = [
      /\bdoc(s|umentation)?\b/,
      /\breadme\b/i
    ];
    if (docRegExps.some((docRegExp) => docRegExp.test(line))) {
      commitLabels.push('documentation');
    }
  });

  return commitLabels;
}

/**
 * Get labels from project names
 *
 * @param {string} targetBranch
 * @returns {Promise<string[]>}
 */
async function getLabelsFromProjects(targetBranch, config) {
  if (!config.enableProjectLabel) {
    return [];
  }

  const /** @type {string[]} */ listTouchedFiles = spawnSync('git', ['log', `${targetBranch}..HEAD`, '--name-only', '--pretty=format:""'], { encoding: 'utf-8', shell: true }).stdout.trim()
    .split(EOL)
    .map((file) => file.replace(/\\/g, '/')) || [];
  const commitMessages = spawnSync('yarn', ['nx', 'show', 'projects', '--affected', `--base=${targetBranch}`], { encoding: 'utf-8', shell: true }).stdout.trim() || '';
  const lines = commitMessages?.split(EOL).filter((line) => !!line) || [];
  const labels = [];
  // console.log(lines);

  for(const projectName of lines) {
    const projectString = spawnSync('yarn', ['nx', 'show', 'project', projectName, '--json'], { encoding: 'utf-8', shell: true }).stdout.trim();
    try {
      const project = JSON.parse(projectString);
      if (listTouchedFiles.some((file) => file.startsWith(project.root))) {
        const packageJson = join(project.root, 'package.json');
        const /** @type {string | undefined} */ packageName = JSON.parse(await fs.readFile(packageJson, { encoding: 'utf-8' })).name;
        if (!packageName) {
          process.stderr.write(`No package name found for ${projectName}${EOL}`);
          continue;
        }
        if (!config.ignoredProjects.includes(packageName)) {
          labels.push(`${config.projectLabelPrefix}${packageName}`);
        }
      }
    } catch(e) {
      process.stderr.write(`Failed to analyze ${projectName}${EOL}`);
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

  const config = JSON.parse(await fs.readFile(configPath, {encoding: 'utf-8'}));

  return {
    ...defaultConfig,
    ...config
  };
}

void(async () => {
  const /** @type {{target: string | undefined}} */ args = minimist(process.argv.slice(2))
  if (!args.target) {
    throw new Error('No Target provided');
  }


  const config = await getConfig();
  const target = `remotes/origin/${args.target}`;
  const labelFromMessage = await getLabelsFromMessage(target, config);
  const labelFromProject =  !config.ignoreProjectForLabels.some((label) => labelFromMessage.includes(label)) ?
    await getLabelsFromProjects(target, config) :
    [];

  process.stdout.write(JSON.stringify([...(new Set([...labelFromMessage, ...labelFromProject]))]));
})();
