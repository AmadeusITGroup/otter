import { getInput, setOutput, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { prerelease, valid, major, compare } from 'semver';

const execute = async () => {
  try {
    const isPreRelease = getInput('is-prerelease') === 'true';
    const version = getInput('version', { required: true });
    const [owner, repo] = getInput('repository', {required: true}).split('/');

    if (!valid(version)) {
      setFailed(`Invalid version (version: ${version})`);
      return;
    }

    const releaseResponse = await getOctokit(getInput('token', { required: true })).rest.repos.listReleases({owner, repo});
    const latestVersion = releaseResponse.data
      .filter((release) => !release.draft && !release.prerelease)
      .map((release) => release.tag_name.replace(/^v/i, ''))
      .sort(compare)
      .reverse()[0];
    const isLatest = latestVersion ? compare(latestVersion, version) <= 0 : true;

    const preRelease = prerelease(version);
    if (!preRelease || !preRelease.length) {
      if (isPreRelease) {
        setFailed(`No pre-release found for version ${version}`);
      } else {
        const tag = isLatest ? 'latest' : `v${major(version)}-updated`;
        console.info(`Version "${version}" is a released version, tag "${tag}" will be used`);
        setOutput('tag', tag);
      }
      return;
    }

    console.info(`Tag "${preRelease[0]}" will be used for version "${version}"`);
    setOutput('tag', preRelease[0]);
  } catch (error) {
    setFailed(error);
  }
};

void execute();
