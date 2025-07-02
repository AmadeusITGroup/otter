# Create a new Github Release

## Overview

GitHub Action for creating a new release on GitHub.

A release note is automatically generated with the release thanks to the [Github Release Notes mechanism](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes).\
In order to generate a better release note, in case of **major** and **minor** release, the note will contains all the changes from the latest **patch** before this new version.

> [!NOTE]
> This action requires `contents: write` [permission](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token) in order to create the release.

## Task options

See [Action specifications](./action.yml) directly for more information about the supported parameters.

## Usage example

```yaml
- name: Create release
  if: github.event_name != 'pull_request'
  uses:  AmadeusITGroup/otter/tools/github-actions/release
  with:
    version: ${{ nextVersionTag }}
    target: ${{ github.ref_name }}
```
