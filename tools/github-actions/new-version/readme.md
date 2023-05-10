# New version action

## Overview

This task computes new version candidates based on the repository tags as well as the branch on which it is executed.
It supports in terms of branching model:

* By default, release branches named ``release/Major.Minor[.0-alpha|beta|next|rc]`` (configurable through releaseBranchRegExp)
* One default branch that can be parametrised (``master``, ``develop``, ...)

If the plugin doesn't support the current branch it raises a warning that says that the version cannot be computed.
It will not fail the pipeline.

## What it does

If run on a compatible branch, the plug-in will compute the next version as following.

### On a release branch ``release/Major.Minor``

* If there is already a tag for the branch given as input, it will increment the latest in terms of semantic versioning.
* If no tag is found, the plug-in returns ``Major.Minor.0``
* If run on a pull request build, it doesn't increment the patch version but instead concatenate ``-pr.buildId`` to the latest, or to ``Major.Minor.0``

### On a pre-release branch ``release/Major.Minor.0-(alpha|beta|next|rc)``

It behaves the same as above, but instead of producing ``Major.Minor.0`` it would produce ``release/Major.Minor.0-(alpha|beta|next|rc).0``

### On a default branch

Say you configured the task to accept ``develop`` as a default branch.
When the task is run to compute a version for a build on the ``develop`` branch, it will retrieve all the __release__ and __develop__ tags from the repository and __sort__ them according to semantic versioning.

* If the latest tag in terms of semver was a ``develop`` tag like ``2.6.0-develop.5``, the task will increment the pre-release version ``2.6.0-develop.6``
* If the latest tag in terms of semver was a ``release`` tag like ``2.6.5``, the task will bump the minor in order to produce a new ``develop`` version ``2.7.0-develop.0``. This will happen the first time you build your default branch after releasing a new version.
* If there was no latest tag, the task will produce version ``0.0.0-develop.0``, unless a ``versionMask`` was provided in input, in which case it wil return the minimum version matching the mask, concatenated with ``-develop.0``

## Task options

See [Action specifications](action.yml) directly for more information about the supported parameters.

## Usage example

```yaml
- name: New version
  id: new-version
  uses: AmadeusITGroup/otter/tools/github-actions/new-version@8
  with:
    defaultBranch: main
    defaultBranchPrereleaseName: alpha
```
