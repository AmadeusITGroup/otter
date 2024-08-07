import {lstat, readdir, readFile, writeFile} from 'node:fs/promises';
import {getFilesTree, type FileSystem} from '@o3r-training/tools';
import {join, resolve} from 'node:path';
import {program} from 'commander';

program
  .description('Extract folder structure')
  .requiredOption('--files <files>', 'List of files and folder to extract in addition to the path')
  .option('-r, --root <root>', 'Root of the extraction')
  .option('-o, --output <output>', 'Output folder path')
  .parse(process.argv);

const options: any = program.opts();
const cwd = options.root ? resolve(process.cwd(), options.root) : process.cwd();
// TODO add a test not to exit the repository;

(async () => {
  const filesDescriptor = [];
  for (const file of options.files.split(',')) {
    const filePath = join(cwd, file);
    filesDescriptor.push({isDir: (await lstat(file)).isDirectory(), path: filePath});
  }
  const folderStructure = await getFilesTree(filesDescriptor, {
    readdir: readdir,
    readFile: readFile
  } as FileSystem);
  const targetPath = join(cwd, options.output || 'folder-structure.json');
  await writeFile(targetPath, JSON.stringify(folderStructure));
})()
