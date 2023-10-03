<h1 align="center">Artifactory tools</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

Various artifactory tools

## Artifact Retriever

### Usage

```bash
Usage: o3r-artifact-retriever [options]

Gets an artifact from Artifactory: artifact-group, artifact-name and artifact-version are mandatory

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

```bash
artifact-retriever.js --registry "https://jfrog.io/repoName" -u <username> -p <password> -v "1.0.0" -g "io.swagger" -a "typescriptFetch-swagger-codegen" --out /path/to/typescriptFetch-swagger-codegen.jar
```

### Azure Artifacts Example

```bash
artifact-retriever.js --repository-manager "Azure Artifacts" --organization "AmadeusDigitalAirline" --project "Otter" --feed "otter" -u <username> -p <password> -v "1.0.0" -g "io.swagger" -a "typescriptFetch-swagger-codegen" --out /path/to/typescriptFetch-swagger-codegen.jar
```

## Dependency Validator

Validator of dependencies.
The purpose is to check if the update is not breaking the application using the current package.

### Usage

```bash
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

## Artifact cleaner

Cleans old artifacts from artifactory repositories

### Usage

```bash
Usage: o3r-artifact-cleaner -b <Base 64 encoding of username:password (password already encrypted from artifactory UI)> [options]

Cleans old artifacts from artifactory repositories, base 64 encoding of username:password is mandatory

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

Cleans old PR artifacts by identifying using the the build version that is present in the path. If build version is not present in the path this tool cannot yet be used.

### Usage

```bash
Usage: o3r-pr-artifact-cleaner -b <Base 64 encoding of username:password (password already encrypted from artifactory UI)> [options]

Cleans old artifacts from artifactory repositories, base 64 encoding of username:password is mandatory

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
