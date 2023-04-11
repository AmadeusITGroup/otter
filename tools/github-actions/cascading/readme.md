# Cascading action

> **Warning**: This action is deprecated, please install the [Otter Cascading App](https://github.com/apps/otter-cascading) instead.

## Overview

This plugin is meant to implement the Bitbucket cascading mechanism on GitHub.
For the moment, the branching model supported is the following one : release/Maj.min[.0-alpha|beta|next|rc] and a default branch from your choice.
This pattern is restrictive on purpose, to prevent any issue where some non-release branches could match as well.

## Task options

See [Action specifications](action.yml) directly for more information about the supported parameters.

## What it does

The plugin will look for branches matching release/* in your repository.
Then it will sort the branches, and based on the current branch you gave as input will figure out if the cascading is needed and on which branch.
If the current branch is the default branch given as input OR if the current branch is the last one matching the pattern the plugin will do nothing.

If the plugin finds a branch candidate for cascading, it will try a git merge and:

* If there is no conflict, the result will be pushed to the repository, triggering a build on the next branch than will run the cascading again
* If there is a conflict:
  * if conflictsIgnoredPackages input is not empty, there are only conflicts in package.json and yarn.lock files and the conflict is only related to those packages, a pull request will be automatically created resolving the conflict by discarding those changes
  * else a pull request will be automatically created (409 error will be thrown if the pull request already exists). If assignCommitter is true, the first person with a "Merge" commit in the list will be assigned as required approval

**Warning**: The action requires to be run in a job with `contents: write` permission or the provided token needs to have the permission to create a pull request, write and trigger builds on release branches.

The cascading task is logging a lot of information, don't hesitate to have a look to have more precisions about what exactly is executed.

## Usage example

```yaml
- name: Cascading 
  id: cascading
  uses: AmadeusITGroup/otter/tools/github-actions/cascading@8
    with:
      ignoredPattern: -next$
```
