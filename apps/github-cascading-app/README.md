# Github Cascading App

A GitHub App to execute cascading between the repository branches.

## How to install

The Otter Cascading application can be installed in your organization via [this link](https://github.com/apps/otter-cascading).

The application will need the following permissions to work:

- **Read** access to `checks` and `metadata`
- **Read** and **write** access to `code` and `pull requests`

## How it works

### What it does

The application will look for branches matching the pattern defined in the `cascadingBranchesPattern` option.
Then it will sort the branches and, based on the current branch you gave as input, will figure out if the cascading is needed and on which branch.
If the current branch is the `defaultBranch` given as configuration OR if the current branch is the last one matching the pattern, the plugin will do nothing.

If the plugin finds a branch candidate for cascading, it will try to create a Pull Request.

### Plugged hooks

The application is plugged to 3 Github webhooks:

- **push**: Checks if one of the branches that requires cascading is updated.
- **pull_request.complete**: When a cascading pull request is merged, checks if a new evaluation of the pull request origin branch is required.
- **check_suite**: In case the `bypassReviewers` option is activated, when a check suite is completed (or stale) the application will merge the cascading pull request.

## Configuration

The Otter Cascading application can be configured via a JSON file following the provided [JSON schema](./schemas/config.schema.json) in one of these possible files:

- .github/cascadingrc.json
- .github/.cascadingrc.json
- cascadingrc.json
- .cascadingrc.json

Example:

```json5
// .github/.cascadingrc.json file
{
  "$schema": "https://raw.githubusercontent.com/AmadeusITGroup/otter/main/apps/github-cascading-app/schemas/config.schema.json",
  "defaultBranch": "master",
  "ignoredPatterns": []
}
```

### List of configurations

The following configurations are available:

| Configuration            | Description                                                                                                                                                                                                   | Default value                                            | Type       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------- |
| ignoredPatterns          | Ignore the branches that match this pattern for the cascading                                                                                                                                                 | `[]`                                                     | `string[]` |
| defaultBranch            | The default branch if you have one, if no candidate found with the given pattern this branch will be the last one where the code will be cascaded (the repository default branch will be used if not defined) | *default branch*                                         | `string`   |
| cascadingBranchesPattern | Pattern determining if the branch is part of the cascading strategy                                                                                                                                           | `^releases?/\\d+\\.\\d+`                                 | `string`   |
| versionCapturePattern    | Pattern containing a capture to extract the version of a cascading branch                                                                                                                                     | `/((?:0\|[1-9]\\d*)\\.(?:0\|[1-9]\\d*)(?:\\.0-[^ ]+)?)$` | `string`   |
| bypassReviewers          | Pattern containing a capture to extract the version of a cascading branch                                                                                                                                     | `false`                                                  | `boolean`  |
> **Note**: The `bypassReviewers` option will require to set the `otter-cascading` bot as **bypass user** to be able to merge the `cascading/*` pull requests.
