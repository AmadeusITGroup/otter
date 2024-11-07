import {
  lstat,
  readdir,
  readFile,
  writeFile
} from 'node:fs/promises';
import {
  join,
  resolve
} from 'node:path';
import {
  program
} from 'commander';
import {
  type FileSystem,
  getFilesTree
} from '../../src/public_api';

program
  .description('Extract folder structure')
  .requiredOption('--files <files>', 'List of files and folder to extract in addition to the path')
  .option('-r, --root <root>', 'Root of the extraction')
  .option('-o, --output <output>', 'Output folder path')
  .parse(process.argv);

const options = program.opts<{ root?: string; files: string; output?: string }>();
const cwd = options.root ? resolve(process.cwd(), options.root) : process.cwd();
void (async () => {
  const filesDescriptor = await Promise.all(
    options.files.split(',').map(async (file: string) => {
      const filePath = join(cwd, file);
      return { isDir: (await lstat(file)).isDirectory(), path: filePath };
    })
  );
  const folderStructure = await getFilesTree(filesDescriptor, {
    readdir: readdir,
    readFile: readFile
  } as FileSystem);
  const targetPath = join(cwd, options.output || 'folder-structure.json');
  const content = JSON.stringify(folderStructure);
  await writeFile(targetPath, content);
})();
