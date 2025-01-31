/*
 * The purpose of this script is to generate a report of the deprecated items in the repository code
 * @param root Root folder from which the script is executed
 * @param output Output path to the migration file
 * @param ignore List of ignore file patterns (comma separated)
 * @param versionPattern RegExp to find the version in the deprecated message
 */

import {
  existsSync,
} from 'node:fs';
import {
  readFile,
  writeFile,
} from 'node:fs/promises';
import {
  relative,
  resolve,
} from 'node:path';
import {
  globby as glob,
} from 'globby';
import minimist from 'minimist';
import {
  createSourceFile,
  isIdentifier,
  isJSDoc,
  isVariableDeclarationList,
  ScriptTarget,
} from 'typescript';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();
const version = argv.version || argv._.at(0) || '0';
const output = resolve(process.cwd(), argv.output || argv.o || 'migration-guides/{VERSION}.0.md').replaceAll('{VERSION}', version);
const ignore = argv.ignore
  ? argv.ignore.split(',')
  : ['**/dist/**'];
const versionPattern = argv.versionPattern ? new RegExp(argv.versionPattern) : /[vV]([0-9]+(?:[.][0-9]+)?)/;
const removalTargetVersion = +version + 1;
/**
 * Work through the TS Node to find the deprecated node
 * @param {import("typescript").SourceFile} sourceFile
 * @param {import("typescript").Node} node
 * @param {number} index
 * @returns {import("typescript").Node}
 */
const workThroughTypescript = (sourceFile, node, index) => {
  const children = node.getChildren(sourceFile)
    .filter((n) => !isJSDoc(n) && n.getStart(sourceFile, true) <= index && n.getEnd() > index);

  return children.reduce((acc, n) => workThroughTypescript(sourceFile, n, index) || acc, node);
};

/** Get deprecated items in TS files */
const getTypescriptDeprecations = async () => {
  const deprecateRegExp = /@deprecated/g;
  const deprecateLineRegExp = /@deprecated(.*?)(?: *\*\/)?$/mg;
  const files = await glob('**/*.{c,m,}ts', { cwd: root, ignore, gitignore: true });
  const reports = [];
  for (let file of files) {
    file = resolve(root, file);
    const content = await readFile(file, { encoding: 'utf8' });
    const match = [...content.matchAll(deprecateRegExp)];
    if (match.length === 0) {
      continue;
    }

    const sourceFile = createSourceFile(
      file,
      content,
      ScriptTarget.ESNext,
      true
    );
    reports.push(...match
      .map(({ index }) => workThroughTypescript(sourceFile, sourceFile, index))
      .map((node) => {
        const deprecationInfo = [
          ...node
            .getFullText(sourceFile)
            .matchAll(deprecateLineRegExp)
        ].map(([, description]) => description.trim()).join('\n');

        let nodeLabel = node.getText(sourceFile);
        if (typeof node.name !== 'undefined' && isIdentifier(node.name)) {
          nodeLabel = node.name.getText();
        } else if (typeof node.declarationList !== 'undefined' && isVariableDeclarationList(node.declarationList)) {
          nodeLabel = node.declarationList.declarations.map(({ name }) => name.getText()).join(', ');
        }
        return {
          file,
          report: {
            node: nodeLabel,
            deprecationInfo,
            version: deprecationInfo.match(versionPattern)?.[1]
          }
        };
      })
    );
  }
  return reports;
};

/**
 * Work through the JSON fields to find the deprecated items
 * @param {object} json
 * @param {RegExp} nodeNameToDetect
 */
const workThroughJson = (json, nodeNameToDetect) => {
  const memory = [];
  const rec = (node, ancestors, mem) => {
    if (Array.isArray(node)) {
      return node.reduce((acc, n) => rec(n, ancestors, acc), mem);
    } else if (node === null || typeof node !== 'object') {
      return mem;
    }

    const entries = Object.entries(node);
    entries
      .map(([key]) => key)
      .filter((key) => nodeNameToDetect.test(key))
      .forEach((key) => {
        const deprecationInfo = node[key];
        mem.push({
          node: ancestors,
          deprecationInfo,
          version: deprecationInfo.match(versionPattern)?.[1]
        });
      });

    return entries.reduce((acc, [key, value]) => rec(value, `${ancestors}.${key}`, acc), mem);
  };

  return rec(json, '', memory);
};

/** Get deprecated items in JSON files */
const getJsonDeprecations = async () => {
  const deprecateNodeRegExp = /"[$]?deprecated"/;
  const files = await glob('**/*.json', { cwd: root, ignore, gitignore: true });
  const contents = await Promise.all(files
    .map((file) => resolve(root, file))
    .map(async (file) => ({ file, content: await readFile(file, { encoding: 'utf8' }) }))
  );

  return contents
    .filter(({ content }) => !!deprecateNodeRegExp.test(content))
    .map(({ file, content }) => ({
      file,
      content: JSON.parse(content)
    }))
    .map(({ file, content }) => ({
      file,
      report: workThroughJson(content, deprecateNodeRegExp)
    }))
    .filter(({ report }) => report.length > 0);
};

/**
 * Format the note message
 * @param {string} message
 * @returns {string}
 */
const formatNoteMessage = (message) => {
  return message
    .replace(/\{@link ([^}]+)}/g, '`$1`')
    .replace(/(^|\s+)`?@([\w-]+)\/([\w-]+)`?/g, '$1[@$2/$3](https://npmjs.com/package/@$2/$3)');
};

// Executed at CLI call
void (async () => {
  const startTag = '<!-- generated deprecated - start -->';
  const endTag = '<!-- generated deprecated - end -->';
  let template = `${startTag}
## Deprecated this version

The following items are **deprecated** and **will be removed** in the version **${removalTargetVersion}**:
`;
  const changeMap = (await Promise.all([getJsonDeprecations(), getTypescriptDeprecations()]))
    .flat()
    .filter(({ report }) => +report.version <= removalTargetVersion)
    .reduce((acc, { file, report }) => {
      const relativeFile = relative(root, file).replaceAll('\\', '/');
      const pck = /@[^/\\]+[/\\][^/\\]+/.exec(relativeFile)?.[0] || relativeFile;
      (acc[pck] ||= []).push(report);
      return acc;
    }, {});

  Object.entries(changeMap)
    .sort(([pck1], [pck2]) => pck1.localeCompare(pck2))
    .forEach(([pck, reports]) => {
      template += `\n### From [${pck}](https://npmjs.com/package/${pck})\n\n`;
      reports
        .sort(({ node }, report) => node.localeCompare(report.node))
        .forEach(({ node, deprecationInfo }) => {
          const message = deprecationInfo.replace(new RegExp(`[, ]*(?:it )?will be removed in (:?otter ?)?v${removalTargetVersion}[,.\\s]*`, 'i'), '').trim();
          template += `- \`${node}\` is deprecated.` + (message ? `</br>Note: *${formatNoteMessage(message)}*` : '') + '\n';
        });
    });

  template += endTag;

  let outputFileContent = existsSync(output) ? await readFile(output, { encoding: 'utf8' }) : '';
  const startIdx = outputFileContent.indexOf(startTag);
  const endIdx = outputFileContent.indexOf(endTag);
  if (startIdx !== -1 && endIdx !== -1) {
    outputFileContent = outputFileContent.slice(0, startIdx) + template + outputFileContent.slice(endIdx + endTag.length);
  } else {
    outputFileContent += template;
  }
  writeFile(output, outputFileContent);
})();
