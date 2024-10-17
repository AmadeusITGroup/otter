import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, isAbsolute, join, normalize, posix, relative, resolve, sep } from 'node:path';

const refMatcher = /\B['"]?[$]ref['"]?\s*:\s*([^#\n]+)/g;

/**
 * Extract the list of local references from a single spec file content
 * @param specContent
 * @param basePath
 */
function extractRefPaths(specContent: string, basePath: string): string[] {
  const refs = specContent.match(refMatcher);
  return refs ?
    refs
      .map((capture) => capture.replace(refMatcher, '$1')
        .replace(/['"]/g, '')
        .trim()
      )
      .filter((refPath) => refPath && !isAbsolute(refPath) && !/^https?:\//.test(refPath))
      .map((refPath) => join(basePath, refPath))
    : [];
}

/**
 * Recursively extract the list of local references starting from the input spec file
 * @param specFilePath
 * @param referenceFilePath
 * @param visited
 */
async function extractRefPathRecursive(specFilePath: string, referenceFilePath: string, visited: Set<string>): Promise<string[]> {
  const resolvedFilePath = resolve(specFilePath);
  if (!visited.has(resolvedFilePath)) {
    visited.add(resolvedFilePath);

    const specContent = await readFile(specFilePath, {encoding: 'utf8'});
    const refPaths = extractRefPaths(specContent, relative(dirname(referenceFilePath), dirname(specFilePath)));
    const recursiveRefPaths = await Promise.all(
      refPaths.map((refPath) => extractRefPathRecursive(join(dirname(referenceFilePath), refPath), referenceFilePath, visited))
    );
    return [
      ...refPaths,
      ...recursiveRefPaths.flat()
    ];
  }
  return [];
}

/**
 * Replace all the local relative references using the new base relative path
 * @param specContent
 * @param newBaseRelativePath
 */
export function updateLocalRelativeRefs(specContent: string, newBaseRelativePath: string) {
  const formatPath = (inputPath:string) => (inputPath.startsWith('.') ? inputPath : `./${inputPath}`).replace(/\\+/g, '/');
  return specContent.replace(refMatcher, (match, ref: string) => {
    const refPath = ref.replace(/['"]/g, '');
    return refPath.startsWith('.') ?
      match.replace(refPath, formatPath(normalize(posix.join(newBaseRelativePath.replaceAll(sep, posix.sep), refPath))))
      : match;
  });
}

/**
 * Copy the local files referenced in the input spec file to the output directory
 * @param specFilePath
 * @param outputDirectory
 */
export async function copyReferencedFiles(specFilePath: string, outputDirectory: string) {
  const dedupe = (paths: string[]) => ([...new Set(paths)]);
  const allRefPaths = await extractRefPathRecursive(specFilePath, specFilePath, new Set());
  const refPaths = dedupe(allRefPaths);
  if (refPaths.length) {
    if (existsSync(outputDirectory)) {
      await rm(outputDirectory, { recursive: true });
    }

    // Calculate the lowest level base path to keep the same directory structure
    const maxDepth = Math.max(...refPaths.map((refPath) => refPath.split('..').length));
    const basePath = join(specFilePath, '../'.repeat(maxDepth));
    const baseRelativePath = relative(basePath, dirname(specFilePath));

    // Copy the files
    await Promise.all(refPaths.map(async (refPath) => {
      const sourcePath = join(dirname(specFilePath), refPath);
      const destPath = join(outputDirectory, baseRelativePath, refPath);
      if (!existsSync(dirname(destPath))) {
        await mkdir(dirname(destPath), { recursive: true });
      }
      await copyFile(sourcePath, destPath);
    }));

    return join(outputDirectory, baseRelativePath);
  }
  return '';
}
