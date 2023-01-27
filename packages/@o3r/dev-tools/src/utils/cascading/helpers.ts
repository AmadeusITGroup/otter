import { Logger } from 'winston';

/**
 * Ensure that the sorting based on git have been done correctly, update the list if there is an issue
 *
 * @param branches
 */
export function verifyBranches(branches: string[]) {
  return branches.sort((branchA, branchB) => {
    const aExtract = branchA.match(/release\/([0-9]+)\.([0-9]+)/);
    const bExtract = branchB.match(/release\/([0-9]+)\.([0-9]+)/);
    if (!aExtract || !bExtract) {
      throw new Error(`Format of branch doesnt match the release pattern ${branches.join(',')}`);
    }
    const aMin = aExtract[2];
    const aMaj = aExtract[1];
    const bMin = bExtract[2];
    const bMaj = bExtract[1];
    if (parseInt(aMaj, 10) > parseInt(bMaj, 10)) {
      return 1;
    } else if (parseInt(aMaj, 10) < parseInt(bMaj, 10)) {
      return -1;
    }
    return parseInt(aMin, 10) - parseInt(bMin, 10);
  });
}

/**
 * Extract just the branches matching the release/min.maj[.0-alpha|beta|next] format,
 *
 * @param gitOutput
 */
export function formatGitBranchOutput(gitOutput: string) {
  return gitOutput.split(/\r?\n\s*/)
    .map((val) => val.replace(/ /g, ''))
    .map((val) => val.replace('remotes/origin/', ''))
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
 */
export async function handlePromisifiedExecLog(promise: Promise<any>, logger: Logger): Promise<{ stdout: string; stderr: string }> {
  const result = await promise;
  // Git is logging on stderr even if the result is successful, but the exit code is still relevant so we just rely on it for errors instead of stderr
  logger.info(result.stdout || result.stderr);
  return result;
}
