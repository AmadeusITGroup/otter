<h1 align="center">Otter dev tools</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

Various CLI scripts to help your CI/CD and your dependency management

> :warning: **Deprecate**: `@o3r/dev-tools` package is deprecated and will no longer be updated as of Otter v12.
> The following CLI scripts have been moved to other otter packages:
> * `artifact-cleaner`: please use `o3r-artifact-cleaner` from the package `@o3r/artifactory-tools`
> * `pr-artifact-cleaner`: please use `o3r-pr-artifact-cleaner` from the package `@o3r/artifactory-tools`
> * `comment-pr`: please use `o3r-comment-pr` from the package `@o3r/azure-tools`
> * `version-harmonize`: replaced by the JSON ESLint rule [@o3r/json-dependency-versions-harmonize](https://github.com/AmadeusITGroup/otter/tree/main/docs/linter/eslint-plugin/rules/json-dependency-versions-harmonize.md)


## How to install

This package can be used via `npx` command to executed on of the listed command line interfaces.

```shell
npx -p @o3r/dev-tools ...
```

## Artifact Retriever

> :warning: **Deprecate**: This script is deprecated and will be removed in Otter v12.

Gets an artifact from the ArtiFactory

### Usage

```shell
Usage: artifact-retriever [options]

Get an artifact from Artifactory, artifact-group, artifact-name and artifact-version are mandatory

Options:

  --registry <url>                     Registry URL. It is ignored for Azure Artifacts.
  --repository-manager <manager>       Artifact repository manager. Supported managers are JFrog, Azure Artifacts (default: JFrog)
  --organization <organization>        Azure Artifacts organization
  --project <project>                  Azure Artifacts project
  --feed <feed>                        Azure Artifacts feed
  -a, --artifact-name <version>        Artifact name
  -v, --artifact-version <version>     Artifact version
  -g, --artifact-group <group>         Artifact group name
  -r, --artifact-repos <repositories>  Artifact repositories (default: )
  -u, --username <username>            Artifactory username (default from ARTIFACTORY_USERNAME)
  -p, --password <password>            Artifactory user password (default from ARTIFACTORY_PASSWORD)
  -o, --out <path>                     Output file name (default: ./built/${name}.jar)
  --use-package-version                Use the package version as artifact version
  -h, --help                           output usage information
```

> **Info**: *password* and *username* options can be provided via Environment variables.

### JFrog Example

```shell
artifact-retriever.js --registry "https://jfrog.io/repoName" -u <username> -p <password> -v "1.0.0" -g "io.swagger" -a "typescriptFetch-swagger-codegen" --out /path/to/typescriptFetch-swagger-codegen.jar
```

### Azure Artifacts Example

```shell
artifact-retriever.js --repository-manager "Azure Artifacts" --organization "AmadeusDigitalAirline" --project "Otter" --feed "otter" -u <username> -p <password> -v "1.0.0" -g "io.swagger" -a "typescriptFetch-swagger-codegen" --out /path/to/typescriptFetch-swagger-codegen.jar
```

## Set Version

> :warning: **Deprecate**: This script is deprecated and will be removed in Otter v12.

Replaces the value of the `version` field of the `package.json` matched by the pattern provided to the `--include` options.

### Usage

```shell
Usage: set-version [options] <version>

Replace the packages version in a monorepos

Options:

  -p, --placeholder <placeholder>  Pattern of the version placeholder (default: 0.0.0)
  --include <file>                 Add files pattern to apply the verison replacement (default: */lerna.json,**/package.json,!**/node_modules/**/{package,lerna}.json)
  -h, --help                       output usage information
```

## Artifact cleaner

> :warning: **Deprecate**: This script is deprecated, please use `o3r-artifact-cleaner` from the package `@o3r/artifactory-tools`

Cleans old artifacts from artifactory repositories

### Usage

```shell
Usage: artifact-cleaner -b <Base 64 encoding of username:password (password already encrypted from artifactory UI)> [options]

Clean old artifacts from artifactory repositories, base 64 encoding of username:password is mandatory

Options:

  --artifactory-url <artifactoryUrl>   Artifact URL (Required)
  -a, --duration-kept <durationKept>   All the artifact which have been created since more time than this value(ms) will be deleted (Default to 10080000ms (i.e. 7 days))
  -r, --repositories <repositories>    Artifact repositories to clean up (coma separated) ex : npm-otter-pr,npm-o3r-pr (Default to npm-otter-pr)
  -t, --type-filter <typeFilter>       List of artifact type that should be deleted coma separated (ex: jar,tgz) (Default : tgz)
  --dry-run <dryRun>                   List all files that should be deleted without actually deleting them. (Default to false)
  -h, --help                           Output usage information

Example : yarn artifact-cleaner -b thisismybase64tokenwithuserandencryptedpassword
```

## PR Artifact cleaner

> :warning: **Deprecate**: This is deprecated, please use `o3r-pr-artifact-cleaner` from the package `@o3r/artifactory-tools`

Cleans old PR artifacts by identifying using the the build version that is present in the path. If build version is not present in the path this tool cannot yet be used.

### Usage

```shell
Usage: pr-artifact-cleaner -b <Base 64 encoding of username:password (password already encrypted from artifactory UI)> [options]

Clean old artifacts from artifactory repositories, base 64 encoding of username:password is mandatory

Options:

  -u, --artifactory-url <artifactoryUrl>   Artifact URL
  -d, --duration-kept <durationKept>   Only artifacts which are older than this value (in days) will be deleted. (Default to 1 day)
  -r, --repository <repository>        Artifact repository to clean up. (Default to dga-maven-built-adt-nce)
  -pr, --pr-versions <prVersions>      Number of pr versions that will be kept. (Default to 2 last versions)
  --dry-run <dryRun>                   List all files that should be deleted without actually deleting them. (Default to false)
  -p, --path <path>                    Artifact paths to cleanup use matcher from AQL language. Be careful that the path do not include release artifacts (Default to com/amadeus/retailing/*-PR-*)
  -h, --help                           Output usage information

Example : yarn pr-artifact-cleaner -b thisismybase64tokenwithuserandencryptedpassword
```

## Peer dependencies updater

> :warning: **Deprecate**: This script is deprecated and will be removed in Otter v12.

Updates a package.json with the given dependencies' versions and their respective peer dependencies.
Relies on `npm info` to retrieve package information.

### Usage

```shell
Usage: peer-dependencies-updater <package@version> [other packages]

Update the given packages version and their peer dependencies range in the provided package.json file (defaulted to local ./package.json)

Options:

  -p, --package-json <packageJson>   Path to the package.json file to update. Default: ./package.json
  --verbose                          Display debug log message
  --silent                           Do not exit with error in case of metadata fetch error

Example : peer-dependencies-updater "@random/package@~2.21.0" "@o3r/core"
```

## Version Harmonize

> :warning: **Deprecate**: This script is deprecated and will be removed in Otter v12, it is replaced by the JSON ESLint rule [@o3r/json-dependency-versions-harmonize](https://github.com/AmadeusITGroup/otter/tree/main/docs/linter/eslint-plugin/rules/json-dependency-versions-harmonize.md).

Replaces the dependencies' version in a monorepos.
This align the dependencies' range of each package of a yarn monorepo to the latest range detected in the monorepo.

### Usage

```shell
Usage: version-harmonize [options]

Replace the dependencies version in a monorepos

Options:
  -m, --monorepo <package>          Path to the private package.json of the monorepo (default: "<process.cwd()>")
  -t, --dependencyTypes <...types>  List of dependency types to update, comma separated (default: ["optionalDependencies","dependencies","devDependencies","peerDependencies","generatorDependencies"])
  -v, --verbose                     Display debug logs
  -a, --alignPeerDependencies       Enforce to align the version of the dependencies with the latest range
  -h, --help                        display help for command
```

### Otter options

The `version-harmonize` command is reading the content of the package.json file to get the following options:

* ignore: List of dependency name patterns to ignore when updating the dependencies range.
* skipPackage: Determines if the current package should be ignored when updating the range of the dependencies.

The configuration can be provided in the package.json file as follows:

```json
{
  "name": "@o3r/my-package",
  "otter": {
    "versionHarmonize": {
      "ignore": [
        "typescript",
        "webpack"
      ]
    }
  }
}
```

## Generate Package Exports

> :warning: **Deprecate**: This script is deprecated and will be removed in Otter v12.

Edits the generated package.json file to add the exports of the packages based on defined sub-entries.
The sub-entries should be specified as JSON files (`package.json` per default) in the folder to expose.

### Usage

```shell
Usage: generate-package-exports [options]

Update package.json exports

Options:
  --cwd <path>               Path to the root of the project (default: "<process.cwd()>")
  -o, --outDir <path>        Path to folder containing the package.json to edit (default: "./dist")
  -s, --srcDir <path>        Path to source folder containing the source code (default: "./src")
  -p, --pattern <packages>   Pattern of the JSON filenames to read to determine sub entries (default: "package.json")
  --export-types <...types>  Add additional supported export types (default: ["typings","types","node","module","es2015","es2020","esm2015","esm2020","esm","default","require","import"])
  -v, --verbose              Display debug logs
  -h, --help                 display help for command
```
