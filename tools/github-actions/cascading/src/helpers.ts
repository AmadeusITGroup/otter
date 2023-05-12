import type {BaseLogger} from './cascading';

/**
 * Sort branches according to semantic versioning
 *
 * @param branches
 */
export function sortBranches(branches: string[]) {
  return branches.map(branch => {
    const extract = branch.match(/release\/([0-9]+)\.([0-9]+)/);
    if (!extract) {
      throw new Error(`Format of branch does not match the release pattern ${branches.join(',')}`);
    }
    return {
      maj: parseInt(extract[1], 10),
      min: parseInt(extract[2], 10),
      branch
    };
  }).sort((branchObjectA, branchObjectB) => {
    if (branchObjectA.maj > branchObjectB.maj) {
      return 1;
    } else if (branchObjectA.maj < branchObjectB.maj) {
      return -1;
    }
    return branchObjectA.min - branchObjectB.min;
  }).map(branchObject => branchObject.branch);
}

/**
 * Extract just the branches matching the release/min.maj[.0-alpha|beta|next|rc] format
 *
 * @param gitOutput
 */
export function extractBranchesFromGitOutput(gitOutput: string) {
  return gitOutput.split(/\r?\n\s*/)
    .map((val) => val
      .replace(/ /g, '')
      .replace('remotes/origin/', '')
    )
    .filter((val) => /release\/(0|[1-9]\d*)\.(0|[1-9]\d*)(\.0-(alpha|beta|next|rc))?$/.test(val));
}

/**
 * Extract the packages names from a multi-line string coming from a git diff
 *
 * @param diffOutput
 */
export function extractPackageLine(diffOutput: string): string[] {
  const results = diffOutput.matchAll(/"([^"]+)":\s+/g);
  return [...results].map(result => result[1]);
}

/**
 * Extract the list of old and new packages from a multi-line string coming from a git diff
 * old packages are the packages between '<<<<<<< HEAD' and '======='
 * new packages are the packages between '=======' and '>>>>>>>'
 *
 * @param diffOutput
 */
export function extractPackages(diffOutput: string): { oldPackages: string[]; newPackages: string[] } {
  // Extract old packages and new packages multilines with two different capture groups
  const results = [...diffOutput.matchAll(/<{3,}[^\n]*\n(.*?)\+*={3,}[^\n]*(.*?)\+*>{3,}/gs)];

  const oldPackages: string[] = [];
  const newPackages: string[] = [];
  results.forEach((regexpResult) => {
    oldPackages.push(...extractPackageLine(regexpResult[1]));
    newPackages.push(...extractPackageLine(regexpResult[2]));
  });
  return {oldPackages, newPackages};
}

/**
 * This function is just meant to handle the result object, it's a bit of boilerplate since we cannot rely on stderr/stdout because
 * Git is logging on stderr even if the result is successful, but the exit code is still relevant : we just rely on it for errors
 *
 * @param promise
 * @param logger
 */
export async function handlePromisifiedExecLog<T extends BaseLogger>(promise: Promise<any>, logger: T): Promise<{ stdout: string; stderr: string }> {
  const result = await promise;
  // Git is logging on stderr even if the result is successful, but the exit code is still relevant so we just rely on it for errors instead of stderr
  logger.info(result.stdout || result.stderr);
  return result;
}

/**
 *
 *  Extract the list of package changes from git diff output result
 *
 * @param gitDiffResult
 * @param logger
 */
export function extractPackageChanges<T extends BaseLogger>(gitDiffResult: string, logger: T) {
  return gitDiffResult.split('diff --cc ').reduce((result: { packageChanges: { file: string; oldPackages: string[]; newPackages: string[] }[]; yarnLockFile?: string }, fileDiff) => {
    // Only do the processing on the interesting parts
    if (fileDiff.length > 10) {
      const filenameResults = fileDiff.match(/(\S+\.\w+)/);
      logger.info(`File being processed: ${fileDiff}`);
      const filename = filenameResults && filenameResults[0];
      if (filename) {
        if (filename.includes('package.json')) {
          result.packageChanges.push({file: filename, ...extractPackages(fileDiff)});
        } else {
          result.yarnLockFile = filename;
        }
      }
    }
    return result;
  }, {packageChanges: []});
}

/**
 *  Filter packages changed to keep only the one that can't be handled automatically
 *
 * @param packageChanges
 * @param conflictsIgnoredPackages
 */
export function notIgnorablePackages(packageChanges: { file: string; oldPackages: string[]; newPackages: string[] }[], conflictsIgnoredPackages : string[]) {
  return packageChanges.reduce((remaining: { file: string; addedPackages: string[]; commonPackages: string[]; removedPackages: string[] }[], fileWithPackages) => {
    if (fileWithPackages.oldPackages.length || fileWithPackages.newPackages.length) {
      const removedPackages: string[] = [];
      const commonPackages: string[] = [];
      fileWithPackages.oldPackages.forEach((oldPackage) => {
        if (!fileWithPackages.newPackages.includes(oldPackage)) {
          removedPackages.push(oldPackage);
        } else {
          if (!conflictsIgnoredPackages.includes(oldPackage)) {
            // We keep it only if it is not ignored
            commonPackages.push(oldPackage);
          }
        }
      });
      const addedPackages = fileWithPackages.newPackages.filter((newPackage) => !fileWithPackages.oldPackages.includes(newPackage));
      if (addedPackages.length || commonPackages.length || removedPackages.length) {
        remaining.push({
          file: fileWithPackages.file,
          addedPackages,
          commonPackages,
          removedPackages
        });
      }
    }
    return remaining;
  }, []);
}
