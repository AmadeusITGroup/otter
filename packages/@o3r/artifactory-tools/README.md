<h1 align="center">Artifactory tools</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/artifactory-tools)](https://www.npmjs.com/package/@o3r/artifactory-tools)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/artifactory-tools?color=green)](https://www.npmjs.com/package/@o3r/artifactory-tools)

This module provides various tools for the supported repository manager [JFrog](https://jfrog.com/artifactory/), including deleting old artifacts and deleting a specified amount of PR build artifacts.

## Artifact cleaner (JFrog)

Cleans old artifacts from JFrog artifactory repositories. Based on the provided (or default) milliseconds value, this script will delete artifacts created before the specified date
and artifacts that have not been downloaded since the specified date. The search for the artifacts to delete is limited to the specified repositories.

Further information can be found in the JFrog documentation [here](https://jfrog.com/help/r/jfrog-rest-apis/artifacts-not-downloaded-since).

### Usage

```shell
o3r-artifact-cleaner [options]
```

The required options include:
* the JFrog artifactory URL (`--artifactory-url`)
* the authentication (`--basicAuth <basicAuth>`)
* the artifact repositories to clean up (`--repositories <repositories>`)

### Options

| Option                                                   | Alias | Value Type           | Default Value                   | Description                                                                                    |
|----------------------------------------------------------|:-----:|----------------------|---------------------------------|------------------------------------------------------------------------------------------------|
| `--artifactory-url <artifactoryUrl>` <br> **(Required)** |       | `string`             |                                 | JFrog artifactory URL                                                                          |
| `--basicAuth <basicAuth>` <br> **(Required)**            | `-b`  | `string`             |                                 | Base64 encoding of username:password (password already encrypted from artifactory UI)          |
| `--repositories <repositories>` <br> **(Required)**      | `-r`  | `string`             |                                 | Artifact repositories to clean up (comma separated) <br> ex: `'repo1,repo2'`                   |
| `--dry-run <dryRun>`                                     |       | `boolean`            | `false`                         | List all files that would be deleted without actually deleting them                            |
| `--duration-kept <durationKept>`                         | `-d`  | `number` or `string` | `604800000` <br> (i.e., 7 days) | All artifacts older than this value (in ms) or not downloaded since this value will be deleted |
| `--type-filter <typeFilter>`                             | `-t`  | `string`             | `'tgz,json'`                    | List of artifact types that should be deleted (comma separated) <br> ex: `'jar,tgz'`           |
| `--help`                                                 | `-h`  |                      |                                 | Output usage information                                                                       |

### Example

```shell
yarn o3r-artifact-cleaner --artifactory-url "https://jfrog.io/repoName" -b thisismybase64tokenwithuserandencryptedpassword
```

## PR Artifact cleaner (JFrog)

Cleans old PR artifacts from JFrog by using the build version that is present in the path. If the build version is not present in the path, this tool cannot be used.
Based on the provided (or default) days value, this script will delete artifacts created before the specified date, within the provided repository matching the provided path.

Further information can be found in the JFrog documentation [here](https://jfrog.com/help/r/jfrog-rest-apis/artifactory-query-language-aql).

### Usage

```shell
o3r-pr-artifact-cleaner [options]
```

The required options include:
* the JFrog artifactory URL (`--artifactory-url <artifactoryUrl>`)
* a method of authentication (`--api-key <apiKey>` or `--basicAuth <base64>`)
* the artifact repository to clean up (`--repository <repository>`)
* the artifact paths to clean up (`--path <path>`)

### Options

| Option                                                   | Alias | Value Type | Default Value | Description                                                                                                                                          |
|----------------------------------------------------------|:-----:|------------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--artifactory-url <artifactoryUrl>` <br> **(Required)** | `-u`  | `string`   |               | JFrog artifactory URL                                                                                                                                |
| `--path <path>` <br> **(Required)**                      | `-p`  | `string`   |               | Artifact paths to clean up (using matcher from AQL language). Be careful not to include release artifacts in the path. <br> ex: `sample/path/*-PR-*` |
| `--repository <repository>` <br> **(Required)**          | `-r`  | `string`   |               | Artifact repository to clean up                                                                                                                      |
| `--api-key <apiKey>`                                     | `-a`  | `string`   |               | Artifactory API key of the user that can be used to log in                                                                                           |
| `--basicAuth <base64>`                                   | `-b`  | `string`   |               | Base64 encoding of username:password (password already encrypted from artifactory UI)                                                                |
| `--dry-run <dryRun>`                                     |       | `boolean`  | `false`       | List all files that would be deleted without actually deleting them                                                                                  |
| `--duration-kept <durationKept>`                         | `-d`  | `number`   | `1`           | All artifacts older than this value (in days) will be deleted                                                                                        |
| `--pr-builds <prBuilds>`                                 | `-n`  | `number`   | `1`           | Number of PR build artifacts that will be kept                                                                                                       |
| `--verbose`                                              | `-v`  |            |               | Display the executed AQL query                                                                                                                       |
| `--help`                                                 | `-h`  |            |               | Output usage information                                                                                                                             |

### Example

```shell
yarn o3r-pr-artifact-cleaner --artifactory-url "https://jfrog.io/repoName" -b thisismybase64tokenwithuserandencryptedpassword
```
