import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { relative } from "node:path/posix";
import minimist from 'minimist';

const run = () => {
  const args = minimist(process.argv.slice(2));
  const { _, findRelatedTests, testPathPattern, coverage, listTests, ...rest } = args;

  if (listTests) {
    // Needed for vscode extension to retrieve and show all the available tests
    execSync(`yarn jest ${process.argv.slice(2).join(' ')}`, { stdio: 'inherit' })
    return;
  }
  const file = args._[0] && relative(process.cwd(), args._[0]);
  const findRelatedTestsRelative = findRelatedTests && relative(process.cwd(), findRelatedTests);
  const testPathPatternRelative = testPathPattern && relative(process.cwd(), testPathPattern.replaceAll(/\\./g, '.'));
  // rename param for @nx/jest:jest executors
  rest.codeCoverage = coverage;

  const runCommand = (cmd) => {
    const cmdWithArgs = `${cmd} ${Object.entries(rest).map(([name, value]) => {
      if (typeof value === 'boolean') {
        return `--${name}${value ? '' : '=false'}`;
      }
      if (Array.isArray(value)) {
        return value.map((v) => `--${name} ${v}`).join(' ')
      }
      return `--${name} ${value}`;
    }).join(' ')}`;
    console.log('Run:', cmdWithArgs)
    execSync(cmdWithArgs, { stdio: 'inherit' });
  }

  if (!file && !findRelatedTestsRelative && !testPathPatternRelative) {
    runCommand(`yarn test`);
  } else {
    const tmp = tmpdir();
    const outputFilePath = join(tmp, 'output.json');
    let nodes = {};

    execSync(`yarn nx graph --file="${outputFilePath}"`);

    const { graph } =  JSON.parse(readFileSync(outputFilePath, { encoding: 'utf8' }));
    nodes = graph.nodes ?? nodes;

    const virtualFolders = Object.values(nodes)
      .filter(({ data }) => data.targets?.test)
      .map(({ data, name }) => ({
        name,
        root: relative(process.cwd(), data.root)
      }));

    const folderInfos = virtualFolders.filter(({ root }) => {
      return file
        ? file.startsWith(root)
        : (
          findRelatedTestsRelative
            ? findRelatedTestsRelative.startsWith(root)
            : root.startsWith(testPathPatternRelative) || testPathPatternRelative.startsWith(root)
      )
    });

    if (folderInfos.length) {
      const relatedProjects = folderInfos.map(({ name }) => name);
      runCommand(`yarn test --projects=${relatedProjects.join(',')} --skip-nx-cache`);
    } else {
      console.warn(`No test target found for: ${file || findRelatedTestsRelative}`);
    }
  }
};

run();

