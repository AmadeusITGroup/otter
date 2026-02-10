import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import util from 'node:util';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const paramPath = argv._[0];

if (!/^[.a-zA-Z0-9-]+(?:\/[.a-zA-Z0-9-]+)*\/?$/.test(paramPath)) {
  throw new Error(`Invalid docs folder path ${paramPath}`);
}
const docsFolder = path.join(process.cwd(), paramPath);
const summaryFilePath = path.resolve(docsFolder, 'summary.json');

const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

/**
 * Generate MarkDown files for folders
 * @param {string} folderPath
 */
function generateFolderMdFiles(folderPath) {
  return readdir(folderPath)
    .then((files) => Promise.all(
      files
        .map((file) => [path.join(folderPath, file), file])
        .filter(([file]) => fs.lstatSync(file).isDirectory())
        .map(async ([subFolderPath, subFolderName]) => {
          await generateFolderMdFiles(subFolderPath);
          const subFiles = (await readdir(subFolderPath))
            .filter((subFolderFileName) =>
              !fs.lstatSync(path.join(folderPath, subFolderName, subFolderFileName))
                .isDirectory()
            );
          await writeFile(
            path.join(folderPath, `${subFolderName}.md`),
            `# ${
              subFolderName.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
            }\n\n${
              subFiles.map((f) => `- [${f.replace('.md', '')}](./${subFolderName}/${f})`).join('\n')
            }\n`,
            { encoding: 'utf8' }
          );
        })
    ));
}

/**
 * Generate CompoDoc summary object
 * @param {string} folderPath Path to the folder containing MarkDown files
 */
function generateSummary(folderPath) {
  return readdir(folderPath)
    .then((files) => {
      const ret = files
        .filter((file) => /\.?md$/i.test(path.extname(file)))
        .map((file) => ({
          title: path.basename(file, '.md').replace(/_/g, ' '),
          file: path.relative(docsFolder, path.join(folderPath, file)).replace(/[/\\]/g, '/')
        }));

      const folders = files
        .map((file) => path.join(folderPath, file))
        .filter((file) => fs.lstatSync(file).isDirectory())
        .map((folder) =>
          generateSummary(folder)
            .then((list) => {
              const folderName = path.basename(folder);
              let ref = ret.find((item) => new RegExp(`${folderName}\\.md`, 'i').test(item.file));
              if (!ref) {
                ref = { title: folderName };
                ret.push(ref);
              }
              ref.children = list;
              return ref;
            })
        );

      return Promise.all(folders).then(() => ret);
    });
}

void generateFolderMdFiles(docsFolder).then(() =>
  generateSummary(docsFolder).then((summary) =>
    writeFile(summaryFilePath, JSON.stringify(summary, null, 2), { encoding: 'utf8' })
  )
);
