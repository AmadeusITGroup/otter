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
const stringifyBigObject = (jsonObject: any): string => {
  if (typeof jsonObject === 'string') {
    return JSON.stringify(jsonObject);
  }
  if (Array.isArray(jsonObject)) {
    return '[' + (jsonObject as any[])
      .map((value) =>  stringifyBigObject(value))
      .join(', ') +
      ']';
  }
  return '{' +
    Object.entries(jsonObject)
      .map(([key, value]) => `"${key}": ${stringifyBigObject(value)}`)
      .join(', ') +
    '}';
}
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
  // TODO add a test not to exit the project;
  const targetPath = join(cwd, options.output || 'folder-structure.json');
  const content = stringifyBigObject(folderStructure);
  await writeFile(targetPath, content);
})()
