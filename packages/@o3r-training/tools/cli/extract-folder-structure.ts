import { readdir, readFile, writeFile } from 'node:fs/promises';
import { getFilesTree, type FileSystem } from '@o3r-training/tools';
import { join, resolve } from 'node:path';
import { program } from 'commander';

program
  .description('Extract folder structure')
  .requiredOption('-p, --path <folderPath>', 'Relative path to the folder to extract')
  .option('-r, --root <root>', 'Root of the extraction')
  .option('-n, --name <name>', 'Name in target')
  .parse(process.argv);

const options: any = program.opts();
const cwd = options.root ? resolve(process.cwd(), options.root) : process.cwd();
// TODO add a test not to exit the repository;

const folderPath = join(cwd, options.path);
(async () => {
  const folderStructure = await getFilesTree(folderPath, {readdir, readFile} as unknown as FileSystem);
  const targetPath = join(cwd, options.name || 'folder-structure.json');
  await writeFile(targetPath, JSON.stringify(folderStructure));
})()
