import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import {clean, compare, major, prerelease, valid} from 'semver';

async function run(): Promise<void> {
  try {
    const isPreRelease = core.getInput('is-prerelease') === 'true';
    const version = core.getInput('version', {required: true});
    const [owner, repo] = core.getInput('repository', {required: true}).split('/');

    if (!valid(version)) {
      core.setFailed(`Invalid version (version: ${version})`);
      return;
    }

    const releaseResponse = await getOctokit(core.getInput('token', {required: true})).rest.repos.listReleases({
      owner,
      repo
    });
    const latestVersion = releaseResponse.data
      .filter((release) => !release.draft && !release.prerelease)
      .map((release) => release.tag_name.replace(/^v/i, ''))
      .map((tagWithoutV) => clean(tagWithoutV))
      .filter((cleanedTag) : cleanedTag is string => cleanedTag !== null)
      .sort(compare)
      .pop();
    const isLatest = latestVersion ? compare(latestVersion, version) <= 0 : true;

    const preRelease = prerelease(version);
    if (!preRelease || !preRelease.length) {
      if (isPreRelease) {
        core.setFailed(`No pre-release found for version ${version}`);
      } else {
        const tag = isLatest ? 'latest' : `v${major(version)}-updated`;
        core.info(`Version "${version}" is a released version, tag "${tag}" will be used`);
        core.setOutput('tag', tag);
      }
      return;
    }
    core.info(`Tag "${preRelease[0]}" will be used for version "${version}"`);
    core.setOutput('tag', preRelease[0]);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Caught an error during NPM tag calculation';
    core.setFailed(errorMessage);
  }
}

void run();
