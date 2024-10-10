# @o3r/workspace-builder

This package exposes a set of scripts to be used in the Otter Workspace to help task automation.

## Scripts

Find below the list of scripts and their descriptions:

### [create-monorepo-scope](./scripts/create-monorepo-scope.mjs)

Create a new scope in the Otter monorepo.

### [doc-links](./scripts/doc-links.mjs)

Check the broken links within the documentation files.

### [pr-labels](./scripts/pr-labels.mjs)

Determine Github Labels based on PR commit messages.

### [prepare-doc-root-menu-template](./scripts/prepare-doc-root-menu-template.mjs)

The purpose of this script is to prepare the root menu template with the list of packages inside.\
Parameters:

* **compodocGlobFiles**: Glob to identify all compodoc configurations for packages
* **menuTemplateFile**: File path for the handlebars template menu
* **generatedDocOutputRegExp**: RegExp to remove to have the relative path of the output documentation compared to the root one
* **packagesVariableValueIdentifier**: Identifier to be replaced by the package value

### [report-deprecates](./scripts/report-deprecates.mjs)

The purpose of this script is to generate a report of the deprecated items in the repository code.\
Parameters:

* **root**: Root folder from which the script is executed
* **output**: Output path to the migration file
* **ignore**: List of ignore file patterns (comma separated)
* **versionPattern**: RegExp to find the version in the deprecated message

### [update-doc-summary](./scripts/update-doc-summary.mjs)

Update the documentation summary for generated documentation website.
