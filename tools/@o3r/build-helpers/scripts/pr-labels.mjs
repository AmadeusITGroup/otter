import { EOL } from 'node:os';

/**
 * Get labels from the git log output command
 *
 * @param {string[] | undefined} commitMessage
 */
function getLabels(commitMessage) {
  const commitLabels = [];

  const lines = commitMessage?.split(EOL) || [];

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

  process.stdout.write(JSON.stringify([...(new Set(commitLabels))]));
}

getLabels(process.argv.slice(2)[0]);
