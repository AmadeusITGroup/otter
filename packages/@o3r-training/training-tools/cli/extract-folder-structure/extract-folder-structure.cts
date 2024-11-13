import {lstat, mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {type FileSystem, getFilesTree} from '../../src/public_api';
import {join, parse, resolve} from 'node:path';
import {program} from 'commander';

program
  .description('Extract folder structure')
  .requiredOption('--files <files>', 'List of files and folder to extract in addition to the path')
  .requiredOption('-o, --output <output>', 'Output file path')
  .option('-r, --root <root>', 'Root of the extraction')
  .parse(process.argv);

const options: any = program.opts();
const cwd = options.root ? resolve(process.cwd(), options.root) : process.cwd();
void (async () => {
  const filesDescriptor = await Promise.all(
    options.files.split(',').map(async (file: string) => {
      const filePath = join(cwd, file);
      return {isDir: (await lstat(file)).isDirectory(), path: filePath};
    })
  );
  const folderStructure = await getFilesTree(filesDescriptor, {
    readdir: readdir,
    readFile: readFile
  } as FileSystem);
  const content = JSON.stringify(folderStructure);

  const targetPath = options.output.replace(/\\/g, "/");
  const parsedPath = parse(options.output);
  if (parsedPath.dir) {
    await mkdir(parsedPath.dir, {recursive: true});
  }
  await writeFile(targetPath, content);
})();
