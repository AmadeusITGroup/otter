const {readdir, readFile, writeFile} = require('node:fs/promises');
const {getFilesTree} = require('@o3r/training-tools');
const {dirname, join, resolve} = require('node:path');
const glob = require('globby');

/**
 * The purpose of this script is to generate the exercise and solution files for the code editor
 */

void (async () => {
  const root = resolve(__dirname, '..', '..');
  const files = await glob('src/assets/trainings/**/(exercise|solution)/**', {cwd: root, dot: true});
  const paths = files.reduce((exercisePaths, file) => {
    const exerciseDirectory = dirname(file).match('(.*/(?:exercise|solution))')?.[0];
    if (exerciseDirectory) {
      exercisePaths.add(exerciseDirectory);
    }
    return exercisePaths;
  }, new Set());
  for (const folder of paths) {
    const filePath = join(root, folder);
    const exerciseStructure = await getFilesTree([{isDir: true, path: `${filePath}`}], {readdir, readFile});
    const [_, commonPath, folderName] = folder.match('(.*)/(exercise|solution)');
    const targetPath = join(commonPath, `${folderName}.json`);
    const content = JSON.stringify(exerciseStructure);
    await writeFile(targetPath, content);
  }
})();
