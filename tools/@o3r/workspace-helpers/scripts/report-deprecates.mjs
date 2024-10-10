/*
 * The purpose of this script is to generate a report of the deprecated items in the repository code
 * @param root Root folder from which the script is executed
 * @param output Output path to the migration file file
 * @param ignore List of ignore file patterns (comma separated)
 * @param versionPattern RegExp to find the version in the deprecated message
 */

import { readFile, writeFile } from 'node:fs/promises';
import { globby as glob } from 'globby';
import { resolve, relative, sep } from 'node:path';
import minimist from 'minimist';
import { createSourceFile, ScriptTarget, isJSDoc, isIdentifier, isVariableDeclarationList } from 'typescript';
import { existsSync } from 'node:fs';

const argv = minimist(process.argv.slice(2));
const root = argv.root ? resolve(process.cwd(), argv.root) : process.cwd();
const version = argv.version || argv._.at(0) || '0';
const output = resolve(process.cwd(), argv.output || argv.o || 'migration-guides/{VERSION}.0.md').replaceAll('{VERSION}', version);
const ignore = argv.ignore ? argv.ignore.split(',') : [
  '**/dist/**'
];
const versionPattern = argv.versionPattern ? new RegExp(argv.versionPattern) : /[vV]([0-9]+(?:[.][0-9]+)?)/;

/**
 * Work through the TS Node to find the deprecated node
 * @param {import("typescript").SourceFile} sourceFile
 * @param {import("typescript").Node} node
 * @returns {import("typescript").Node}
 */
const workThroughTypescript = (sourceFile, node, index) => {
  const children = node.getChildren(sourceFile)
    .filter((n) => !isJSDoc(n) && n.getStart(sourceFile, true) <= index && n.getEnd() > index)

  return children.reduce((acc, n) => workThroughTypescript(sourceFile, n, index) || acc, node)
};

/** Get deprecated items in TS files */
const getTypescriptDeprecations = async () => {
  const deprecateRegExp = /@deprecated/g;
  const deprecateLineRegExp = /@deprecated(.*)$/mg;
  const files = await glob('**/*.{c,m,}ts', {cwd: root, ignore});
  const reports = [];
  for (let file of files) {
    file = resolve(root, file);
    const content = await readFile(file, { encoding: 'utf8' });
    const match = [...content.matchAll(deprecateRegExp)];
    if (!match.length) {
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
        ].map(([, description]) => description.trim()).join('\n')

        let nodeLabel = node.getText(sourceFile);
        if (typeof node.name !== 'undefined' && isIdentifier(node.name)) {
          nodeLabel = node.name.getText();
        } else if (typeof node.declarationList !== 'undefined' && isVariableDeclarationList(node.declarationList)) {
          nodeLabel = node.declarationList.declarations.map(({name}) => name.getText()).join(', ')
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
 * Work through the JSON fields do find the deprecated item
 * @param {Object} json
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
  }

  return rec(json, '', memory);
}

/** Get deprecated items in JSON files */
const getJsonDeprecations = async () => {
  const deprecateNodeRegExp = /"[$]?deprecated"/;
  const files = await glob('**/*.json', { cwd: root, ignore });
  const contents = await Promise.all(files
    .map((file) => resolve(root, file))
    .map(async (file) => ({ file, content: await readFile(file, { encoding: 'utf8' }) }))
  );

  return contents
    .filter(({ content }) => !!content.match(deprecateNodeRegExp))
    .map(({ file, content }) => ({
      file,
      content: JSON.parse(content)
    }))
    .map(({ file, content }) => ({
      file,
      report: workThroughJson(content, deprecateNodeRegExp)
    }))
    .filter(({report}) => !!report.length);
};

// Executed at CLI call
void (async() => {
  const startTag = '<!-- generated deprecated - start -->';
  const endTag = '<!-- generated deprecated - end -->';
  let template = `${startTag}
## Deprecated this version

The following items are deprecated and will be removed in next major version:

`;
  const changeMap = (await Promise.all([getJsonDeprecations(), getTypescriptDeprecations()]))
    .flat()
    .filter(({report}) => +report.version === +version + 1)
    .reduce((acc, {file, report}) => {
      const relativeFile = relative(root, file)
      const pck = /@[^/\\]+[/\\][^/\\]+/.exec(relativeFile)?.[0] || relativeFile;
      (acc[pck] ||= []).push(report);
      return acc;
    },{});

  Object.entries(changeMap)
    .sort(([pck1], [pck2]) => pck1.localeCompare(pck2))
    .forEach(([pck, reports]) => {
      template += `\n### From [${pck}](https://npmjs.com/package/${pck}):\n\n`;
      reports
        .sort(({node}, report) => node.localeCompare(report.node))
        .forEach(({ node, deprecationInfo }) => template += `- \`${node}\` will deprecated with the following message:</br>*${deprecationInfo}*\n`)
    });

  template += endTag;

  let outputFileContent = existsSync(output) ? await readFile(output, {encoding: 'utf8'}) : '';
  const startIdx = outputFileContent.indexOf(startTag);
  const endIdx = outputFileContent.indexOf(endTag);
  if (startIdx > -1 && endIdx > -1) {
    outputFileContent = outputFileContent.slice(0, startIdx) + template + outputFileContent.slice(endIdx + endTag.length);
  } else {
    outputFileContent += template;
  }
  writeFile(output, outputFileContent);
})();
