import * as fsPromises from 'node:fs/promises';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { SemVer } from 'semver';
import * as util from 'node:util';
import { exec as cpExec } from 'node:child_process';
import * as winston from 'winston';

const exec = util.promisify(cpExec);

/**
 * Computes current alpha or next branch based on a semver
 * @deprecated will be removed in Otter v12.
 * @param  version
 * @returns {string} current alpha or next branch
 */
export function getCurrentAlphaOrNextBranch(version: SemVer) {
  const suffix = version.minor === 0 ? 'next' : 'alpha';
  return `release/${version.major}.${version.minor}.0-${suffix}`;
}

/**
 * Computes current release candidate branch based on a semver
 * @deprecated will be removed in Otter v12.
 * @param  version
 * @returns {string} current RC branch
 */
export function getCrtRcBranch(version: SemVer) {
  return `release/${version.major}.${version.minor}.0-rc`;
}

/**
 * Deletes a given branch
 * @deprecated will be removed in Otter v12.
 * @param {string} branch the branch to be deleted
 * @param logger
 */
export async function deleteBranch(branch: string, logger: winston.Logger) {
  try {
    await exec(`git show-branch remotes/origin/${branch}`);
    await exec(`git push origin --delete ${branch}`);
    logger.info(`${branch} has been deleted.`);
  } catch (e: any) {
    if (e.code === 128) {
      logger.info(`${branch} does not exist.`);
    } else {
      logger.error(`Error while deleting ${branch}.`, e);
    }
  }
}

/**
 * Checkout a given branch
 * @deprecated will be removed in Otter v12.
 * @param {string} branch the branch to be checked out
 * @param logger
 */
export async function checkoutBranch(branch: string, logger: winston.Logger) {
  try {
    await exec(`git checkout ${branch}`);
    logger.info(`Checked out ${branch}.`);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
}

/**
 * Checkout the current alpha branch
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 */
export async function checkoutCurrentAlphaOrNextBranch(version: SemVer, logger: winston.Logger) {
  const currentAlphaOrNextBranch = getCurrentAlphaOrNextBranch(version);
  await checkoutBranch(currentAlphaOrNextBranch, logger);
}

/**
 * Update the renovate base branch to the next alpha branch
 * Workaround until https://github.com/renovatebot/renovate/issues/5027 is provided
 * @deprecated will be removed in Otter v12.
 * @param branchName
 * @param renovatePath
 * @param logger
 */
export async function updateRenovateBaseBranch(branchName: string, renovatePath: string, logger: winston.Logger) {
  const renovateRcPath = path.resolve(renovatePath, '.renovaterc.json');
  if (fs.existsSync(renovateRcPath)) {
    logger.info(`Renovate file found : ${renovateRcPath}`);
    // Extract npm tag (rc | alpha)
    const suffix = branchName.split('-')[1];
    const suffixRegExp = new RegExp(`${suffix}$`);
    const renovateRc = JSON.parse(await fsPromises.readFile(renovateRcPath, {encoding: 'utf8'}));
    logger.info(`Current base branches : ${(renovateRc.baseBranches || []).join(' ') as string}`);
    // Filters branching with same npm tag than the one being created
    // For example, [release/7.0.0-next release/6.1.0-rc release/6.2.0-alpha] will become [release/7.0.0-next release/6.2.0-alpha]
    renovateRc.baseBranches = (renovateRc.baseBranches || []).filter((branch: string) => !suffix || !suffixRegExp.test(branch));
    // Add the current branch
    renovateRc.baseBranches.push(branchName);
    logger.info(`Updated base branches : ${(renovateRc.baseBranches || []).join(' ') as string}`);
    await fsPromises.writeFile(renovateRcPath, `${JSON.stringify(renovateRc, null, 2)}\n`);
    await exec('git add .renovaterc.json');
    await exec('git commit -m "ci: update renovate bot base branch" -m "[skip ci]"');
    logger.info('Renovate file successfully updated and committed');
  }
}

/**
 * Create a rc branch based on a version
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 */
export async function createRcBranch(version: SemVer, logger: winston.Logger) {
  const rcBranch = getCrtRcBranch(version);
  try {
    await exec(`git show-branch remotes/origin/${rcBranch}`);
    logger.info(`${rcBranch} already exists.`);
  } catch (e) {
    logger.info(`Creating release candidate branch ${rcBranch}.`);
    await exec(`git checkout -b ${rcBranch}`);
    await exec(`git push --set-upstream origin ${rcBranch}`);
  }
}

/**
 * Create an alpha branch for the next release based on a version
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 * @param renovatePath
 */
export async function createNextAlphaBranch(version: SemVer, logger: winston.Logger, renovatePath?: string) {
  const alphaBranchName = `${version.major}.${version.minor + 1}.0-alpha`;
  const alphaBranch = `release/${alphaBranchName}`;
  try {
    await exec(`git show-branch remotes/origin/${alphaBranch}`);
    logger.info(`${alphaBranch} already exists.`);
  } catch (e) {
    logger.info(`Creating alpha branch ${alphaBranch}.`);
    await exec(`git checkout -b ${alphaBranch}`);
    if (renovatePath) {
      await updateRenovateBaseBranch(alphaBranch, renovatePath, logger);
    }
    await exec(`git push --set-upstream origin ${alphaBranch}`);
  }
}

/**
 * Create a -next branch for the next major release based on a version
 * @deprecated will be removed in Otter v12.
 * @param  version
 * @param logger
 * @param renovatePath
 */
export async function createNextMajorBranch(version: SemVer, logger: winston.Logger, renovatePath?: string) {
  const nextBranchName = `release/${version.major + 1}.0.0-next`;
  try {
    await exec(`git show-branch remotes/origin/${nextBranchName}`);
    logger.info(`${nextBranchName} already exists.`);
  } catch (e) {
    logger.info(`Creating -next branch for next major version ${nextBranchName}.`);
    await exec(`git checkout -b ${nextBranchName}`);
    if (renovatePath) {
      await updateRenovateBaseBranch(nextBranchName, renovatePath, logger);
    }
    await exec(`git push --set-upstream origin ${nextBranchName}`);
  }
}

/**
 * Deletes the alpha branch for a given version
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 */
export async function deleteCurrentAlphaOrNextBranch(version: SemVer, logger: winston.Logger) {
  const currentAlphaOrNextBranch = getCurrentAlphaOrNextBranch(version);
  await deleteBranch(currentAlphaOrNextBranch, logger);
}

/**
 * Checkout the current RC branch
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 */
export async function checkoutCrtRcBranch(version: SemVer, logger: winston.Logger) {
  const crtRcBranch = getCrtRcBranch(version);
  await checkoutBranch(crtRcBranch, logger);
}

/**
 * Commits the content of the change-logs folder in order to prepare the new release.
 * @deprecated will be removed in Otter v12.
 * @param version
 */
export async function commitChangeLogs(version: SemVer) {
  await exec('git add ./change-logs');
  await exec(`git commit -m "chore: prepare change-logs for release ${version.version}"`);
}

/**
 * Create a release branch based on a version
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 */
export async function createReleaseBranch(version: SemVer, logger: winston.Logger) {
  const releaseBranch = `release/${version.major}.${version.minor}`;
  try {
    await exec(`git show-branch remotes/origin/${releaseBranch}`);
    logger.info(`${releaseBranch} already exists.`);
  } catch (e) {
    logger.info(`Creating release branch ${releaseBranch}.`);
    await exec(`git checkout -b ${releaseBranch}`);
    await exec(`git push --set-upstream origin ${releaseBranch}`);
  }
}

/**
 * Deletes the previous release branch for a given version
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 */
export async function deletePreviousReleaseBranch(version: SemVer, logger: winston.Logger) {
  const prevReleaseBranch = `release/${version.major}.${version.minor - 1}`;
  await deleteBranch(prevReleaseBranch, logger);
}

/**
 * Deletes the current RC branch for a given version
 * @deprecated will be removed in Otter v12.
 * @param version
 * @param logger
 */
export async function deleteCrtRcBranch(version: SemVer, logger: winston.Logger) {
  const crtRcBranch = getCrtRcBranch(version);
  await deleteBranch(crtRcBranch, logger);
}
