# Otter utils library

Collection of tools to help to main a project with Otter Library

## Artifact Retriever

Get an artifact from the ArtiFactory

### Usage

```shell
Usage: o3r-artifact-retriever [options]

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

### JFrog Example

```shell
artifact-retriever.js --registry "https://jfrog.io/repoName" -u <username> -p <password> -v "1.0.0" -g "io.swagger" -a "typescriptFetch-swagger-codegen" --out /path/to/typescriptFetch-swagger-codegen.jar
```

### Azure Artifacts Example

```shell
artifact-retriever.js --repository-manager "Azure Artifacts" --organization "OrganizationName" --project "Otter" --feed "otter" -u <username> -p <password> -v "1.0.0" -g "io.swagger" -a "typescriptFetch-swagger-codegen" --out /path/to/typescriptFetch-swagger-codegen.jar
```

## Dependency Validator

Validator of dependencies.
The purpose is to check if the update is not breaking application using the current package.

### Usage

```shell
Usage: dep-validator [options] <gitUrl>

Execute dependency tests


Options:

  -u, --username <username>   Git username
  -p, --password <password>   Git user password
  -w, --workspace <path>      Path to the folder containing the repository to clone
  --workspace-project <path>  Path to the project root folder inside the workspace
  -b, --build <tasks>         Tasks to run to build the dependency
  -t, --test <tasks>          Tasks to run to test the dependency
  -P, --project <path>        Project root path
  --include <packages>        Packages to include in the process
  --exclude <packages>        Packages to exclude from the process
  --no-lerna                  Disable lerna file parsing
  --no-trustedVersionNumber   Determine if the version number is trusted (used for version number generated in Pull Request)
```

## Changelog Generator

Update changelog file with the new changes.
The purpose is to reduce the number of Pull Requests conflict caused by the edition of the Changelog file.

### Usage

```shell
Usage: changelog-generator [options] <project>

Update ChangeLog with new changes


Options:

  -g, --generate-on <major|minor|patch>  Versions change when generating a changelog (comma separated)
  -u, --username <username>              Git username
  -p, --password <password>              Git user password
  -o, --output <file>                    Path to the changelog file (default: README.md)
  --pattern <pattern>                    JIRA task pattern (default: '[A-Z]{2,}-[0-9]+')
  --config <path>                        Path to a configuration file
  --only-task-done                       Included only task done in this changelog
  -h, --help                             output usage information
```

## Set Version

Replace the packages version in a monorepo

### Usage

```shell
Usage: o3r-set-version [options] <version>

Replace the packages version in a monorepos

Options:

  -p, --placeholder <placeholder>  Pattern of the version placeholder (default: 0.0.0)
  --include <file>                 Add files pattern to apply the verison replacement (default: */lerna.json,**/package.json,!**/node_modules/**/{package,lerna}.json)
  -h, --help                       output usage information
```

## Artifact cleaner

Clean old artifacts from artifactory repositories

### Usage

```shell
Usage: o3r-artifact-cleaner -b <Base 64 encoding of username:password (password already encrypted from artifactory UI)> [options]

Clean old artifacts from artifactory repositories, base 64 encoding of username:password is mandatory

Options:

  --artifactory-url <artifactoryUrl>   Artifact URL (Required)
  -a, --duration-kept <durationKept>   All the artifact which have been created since more time than this value(ms) will be deleted (Default to 10080000ms (i.e. 7 days))
  -r, --repositories <repositories>    Artifact repositories to clean up (coma separated) ex : npm-otter-pr,npm-refx-pr (Default to npm-otter-pr)
  -t, --type-filter <typeFilter>       List of artifact type that should be deleted coma separated (ex: jar,tgz) (Default : tgz)
  --dry-run <dryRun>                   List all files that should be deleted without actually deleting them. (Default to false)
  -h, --help                           Output usage information

Example : yarn o3r-artifact-cleaner -b thisismybase64tokenwithuserandencryptedpassword
```

## PR Artifact cleaner

Clean old PR artifacts by identifying using the build version that is present in the path. If build version is not present in the path this tool cannot yet be used.

### Usage

```shell
Usage: o3r-pr-artifact-cleaner -b <Base 64 encoding of username:password (password already encrypted from artifactory UI)> [options]

Clean old artifacts from artifactory repositories, base 64 encoding of username:password is mandatory

Options:

  -u, --artifactory-url <artifactoryUrl>   Artifact URL
  -d, --duration-kept <durationKept>   Only artifacts which are older than this value (in days) will be deleted. (Default to 1 day)
  -r, --repository <repository>        Artifact repository to clean up. (Default to dga-maven-built-adt-nce)
  -pr, --pr-versions <prVersions>      Number of pr versions that will be kept. (Default to 2 last versions)
  --dry-run <dryRun>                   List all files that should be deleted without actually deleting them. (Default to false)
  -p, --path <path>                    Artifact paths to cleanup use matcher from AQL language. Be careful that the path do not include release artifacts (Default to com/amadeus/retailing/*-PR-*)
  -h, --help                           Output usage information

Example : yarn o3r-pr-artifact-cleaner -b thisismybase64tokenwithuserandencryptedpassword
```

## Peer dependencies updater

Update a package.json with the given dependencies versions and their respective peer dependencies.
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

## Scripts

This package provide generic helpers to support the build chain of Otter and Ama sdk packages

## Set Version

Replace the packages version in a monorepo.
This is used to edit the package.json version of a yarn workspaces packages.

### Usage

```shell
Usage: o3r-set-version [options] <version>

Replace the packages version in a monorepos

Options:
  -p, --placeholder <placeholder>  Pattern of the version placeholder (default: "0.0.0")
  --include <file>                 Add files pattern to apply the verison replacement (default: ["*/lerna.json","**/package.json","!**/node_modules/**/{package,lerna}.json"])
  -h, --help                       display help for command
```

## Version Harmonize

> :warning: **Deprecate**: This script is deprecated and will be removed in Otter v12, it is replaced by the JSON ESLint rule [@o3r/json-dependency-versions-harmonize](https://github.com/AmadeusITGroup/otter/blob/main/docs/linter/eslint-plugin/rules/json-dependency-versions-harmonize.md).

Replace the dependencies version in a monorepo.
This aligns the dependencies range of each packages of a yarn monorepo to the latest range detected in the monorepo.

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
* skipPackage: Determine if the current package should be ignored when updating the dependencies range.

The configuration can be provided in the package.json file as following:

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

Edit the generated package.json file to add the exports of the packages based on defined sub-entries.
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
