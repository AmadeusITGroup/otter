import { sync as globbySync } from 'globby';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'readline';
import { SemVer } from 'semver';

/**
 * From the changelogs of the alpha and rc versions, produces the aggregated changelog for a release, removing duplicates
 * as well as any change mentioned in a former change log.
 *
 * @param version
 * @returns {Promise<void>}
 */
export async function sanitizeChangeLogs(version: SemVer) {
  const changeLogsFolder = path.resolve('change-logs');
  const newChangeLogsFile = path.join(changeLogsFolder, `CHANGELOG_${version.major}.${version.minor}.md`);

  if (fs.existsSync(newChangeLogsFile)) {
    // eslint-disable-next-line no-console
    throw new Error(`Destination file already exists: ${newChangeLogsFile}`);
  }

  const changeLogsFiles = globbySync(path.join(changeLogsFolder, '*.md'));
  const previousChangeLogs = changeLogsFiles.filter((filePath: string) => !filePath.includes(version.version));

  /** keep track of previous entries to avoid duplicates */
  const indexedChanges = new Set();
  for (const file of previousChangeLogs) {
    const lineReader = readline.createInterface({
      input: fs.createReadStream(file),
      historySize: 0
    });
    for await (const line of lineReader) {
      if (line.startsWith('*')) {
        indexedChanges.add(line);
      }
    }
  }

  /** Get what's new from the alpha and rc files */
  const currentLogFiles = changeLogsFiles.filter((filePath: string) => filePath.includes(version.version));
  const newChanges = {};
  const categoryRegexp = /^### ?(.*)/;
  let category;
  for (const file of currentLogFiles) {
    const lineReader = readline.createInterface({
      input: fs.createReadStream(file),
      historySize: 0
    });

    for await (const line of lineReader) {
      const categoryMatcher = categoryRegexp.exec(line);
      if (categoryMatcher) {
        category = categoryMatcher[1];
        if (!(category in newChanges)) {
          newChanges[category] = new Set();
        }
      } else if (category && line.startsWith('*') && !indexedChanges.has(line)) {
        newChanges[category].add(line.replace(/^(\* +)#/, '$1'));
      }
    }
  }

  const today = new Date();
  let fileContent = `## [${version.version}](https://dev.azure.com/AmadeusDigitalAirline/Otter/_git/library?version=GT${version.version}) ` +
    `(${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()})`;

  ['Features', 'Bug Fixes'].forEach((cat: string) => {
    fileContent += `

### ${cat}

${Array.from(newChanges[cat] || []).join('\n')}`;
  });

  fs.writeFileSync(newChangeLogsFile, fileContent.endsWith('\n') ? fileContent : `${fileContent}\n`);
  changeLogsFiles.filter((filePath: string) => filePath.includes(version.version))
    .forEach(fs.unlinkSync);
}
