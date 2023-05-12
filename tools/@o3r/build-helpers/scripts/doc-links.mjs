/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const libRoot = path.resolve(process.cwd());
const rootGenerated = path.join(libRoot, argv['generated-doc']);
const additionalDocGenerated = path.resolve(rootGenerated, 'additional-documentation');
const rootSource = path.join(libRoot, argv['docs']);


/**
 * Get the list of files with the given extension from given folder
 * and its subfloders if isRecursive is true
 *
 * @param dirPath
 * @param arrayOfFiles
 * @param extension
 * @param isRecursive
 * @returns
 */
function getAllFiles(dirPath, arrayOfFiles, extension, isRecursive) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = [...arrayOfFiles];

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const fileInfo = fs.statSync(filePath);
    if (isRecursive && fileInfo.isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles, extension, isRecursive);
    } else if (fileInfo.isFile() && path.extname(file) === extension) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const linkRegex = /(href=|])[("]((\.|\/)[^)"]+)[)"]/;
const linkRegexGMI = new RegExp(linkRegex, 'gmi');
const linkRegexG = new RegExp(linkRegex, 'g');
const mdRegex = /\.md("?)$/;

/**
 * replace the .md links with .html links inside compodoc generated files
 *
 * @param filePath
 */
function replaceMdLinks(filePath) {
  const oldContent = fs.readFileSync(filePath, {encoding: 'utf8'});

  const newContent = oldContent.replace(linkRegexGMI, (match, group1, group2) => {
    if (group2.match(mdRegex)) {
      return match.toLowerCase().replace(mdRegex, '.html$1').replace(/_/g, '-');
    }
    return match;
  });

  if (oldContent !== newContent) {
    fs.writeFileSync(filePath, newContent, {encoding: 'utf-8'});

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Links modified in: ${filePath}`);
  }
}

/**
 * Checks the relative paths found in the given filePath, to .md files and to files inside .attachments folder
 *
 * @param  filePath
 * @returns the list of broken file paths from the checked file
 */
function checkInternalLinks(filePath) {
  const fileContent = fs.readFileSync(filePath, {encoding: 'utf8'});

  const wrongUrls = [];
  const matches = fileContent.matchAll(linkRegexG);
  if (matches) {
    const matchesArray = Array.from(matches);

    matchesArray.map(groups => groups[2].replace(/#.*$/, ''))
      .filter(relPath => relPath.match(mdRegex) || relPath.indexOf('.attachments') > -1)
      .forEach((relPath) => {
        const referencedPath = path.join(path.dirname(filePath), relPath);
        if (!fs.existsSync(referencedPath)) {
          wrongUrls.push(relPath);
        }
      });
  }

  return wrongUrls;
}

const additionalDocGeneratedFiles = getAllFiles(additionalDocGenerated, [], '.html', true);
const atRootGeneratedFilesPaths = getAllFiles(rootGenerated, [], '.html');
[...additionalDocGeneratedFiles, ...atRootGeneratedFilesPaths].forEach(filePath => replaceMdLinks(filePath));

const allSourceFilePaths = getAllFiles(rootSource, [], '.md', true);
const libMdFiles = getAllFiles(libRoot, [], '.md');
const wrongPaths = {};
[...allSourceFilePaths, ...libMdFiles].forEach(filePath => {
  const wrongFilesPaths = checkInternalLinks(filePath);
  if (wrongFilesPaths.length > 0) {
    wrongPaths[filePath] = wrongFilesPaths;
  }
});

if (Object.keys(wrongPaths).length) {
  let stringBuilder = '';
  Object.entries(wrongPaths).forEach(([key, value]) => {
    stringBuilder += `\n\nERROR: ${key} contain the following broken links: ${JSON.stringify(value)}`;
  });
  throw new Error('Documentation files contain broken links' + stringBuilder);
}



