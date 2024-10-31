<p align="center">
  <img src="./assets/logo/otter.png" alt="Super cute Otter!" width="30%"/>
</p>

# Otter Library - How to contribute

Thank you for considering contributing to Otter! We welcome all contributions, and appreciate your effort in improving our project. To ensure a smooth contribution process, please follow the guidelines below.

## Feature Requests

Please create a new [issue](https://github.com/AmadeusITGroup/otter/issues/new/choose) on our repository and choose "Feature request". This will allow us to review and prioritize your request accordingly.

## Submitting an Issue

Before you submit an issue, please make sure the issue is not already in our [issues backlog](https://github.com/AmadeusITGroup/otter/issues).

The issue creation template requires:

- a description of the failing use case
- the version of library where the issue occurs
- NodeJS version
- a fix suggestion, if possible

If you already have a fix for the problem don't hesitate to [open a pull request](#creating-a-pull-request). Each pull request should be assign to an issue, so please create the issue and link it to the PR.

## Creating a pull request

When creating a pull request, please link the corresponding issue in the pull request description. This will help us track the progress of your contribution and ensure that it is reviewed in a timely manner.

### Commit message constraints

In order to have a nice change log generated, you will need to follow some guidelines:

- For bugfix: `git commit -m "[fix|fixes|bugfix|bugfixes]: this is a commit message for a fix"`
- For feature: `git commit -m "[feat|feature|features]: this is a commit message for a feature"`
- For documentation: the commit message should contain the word `doc`, `docs` or `documentation`
- For breaking change: the commit message should contain the word `breaking`, `breaking change`, `breaking changes`, `breaking-change` or `breaking-changes`

Those are common examples, for more information don't hesitate to have a look at <https://github.com/conventional-changelog/commitlint/#what-is-commitlint>

### Rules for Contributions

When contributing, please keep in mind the following rules:

- Make only non-breaking changes in minor versions. Enhancements to existing code are possible - please discuss it beforehand with the Otter team via a [feature request](#feature-requests).
- If the new feature you are adding is replacing an existing one, please deprecate the old code in minor versions. Add the `@deprecated` tag in the *JSDoc* while mentioning the major version when it will be removed. Note that only **even** major Otter versions allow **costly breaking changes**. The cost of the breaking change will be determined by the responsible team at code review time (see [Versioning rules](./SECURITY.md)).\
  A breaking change can be effective only from the major version `n + 2` **after the deprecation.**
- Please ensure that you are submitting quality code, specifically make sure that the changes comply with our [code styling convention](#style-guide).

### Style guide

- Always write description comments for methods and properties
- A description comment must use the pattern `/** [Your comment] */`
- Linter tasks must pass
- Add relevant Unit Tests
- Any change should be followed by changes in the generator whenever it's applicable
- Properties should have the most restricted type possible

> :no_entry_sign: <code>private type: string;</code></br> :white_check_mark: <code>private type: "A" &verbar; "B";</code>

To ease the process, we are providing a set of:

- [Editors configuration](.editorconfig)
- [Linters configuration](./packages/@o3r/eslint-config-otter/README.md)
- [Component generator](./packages/@o3r/core/README.md#generators) (and more)

### Accelerate your build thanks to Nx Cloud

[Nx Cloud](https://nx.dev/nx-cloud) offers a way to accelerate the build of your project locally thanks to [Remote Cache](https://nx.dev/ci/features/remote-cache).

To be able to benefit from this feature, you will need to perform the following steps:

1. Create an account on [Nx Cloud App](https://cloud.nx.app/)
2. Create a Personal Access Token on [profile page](https://cloud.nx.app/profile/tokens).
3. Create a local environment variable **NX_CLOUD_ACCESS_TOKEN** with your previously generated PAT *(example on Linux: `export NX_CLOUD_ACCESS_TOKEN=xxxxxxx`)*

When building (`yarn build`) the project on the `main` branch (or another `release/*` branch), the remote cache will be downloaded.

> [!IMPORTANT]
> This feature is available for `@amadeus.com` email addresses, the Nx Cloud account should be created with an `@amadeus.com` email or it should be set as **main email** on GitHub if the GitHub account is used to register to Nx Cloud.

### DevTools to create new Otter monorepo elements

To help developers create new items in the Otter monorepo, several scripts have been provided at root level to accelerate development:

- Create a new scope: `yarn create:scope <scope-name>`
- Create a new package: `yarn ng g library @<scope-name>/<library-name>`

> [!NOTE]
> The dependencies of the monorepo need to be installed (thanks to the command `yarn install`) before running the scripts.

## Code review process

After submitting a pull request, you will receive feedback from the Otter team. The review process will continue until the pull request is ready to be merged.

### Rules for reviewers

As a reviewer, please follow these guidelines:

- When using the `Request changes` option, please include at least one comment with a specific change required. A question alone does not count as a change requirement. This option indicates that the reviewer is not in favor of merging the pull request until the requested changes are made.
- When using the `Approved option`, the reviewer may still include change requests if desired. This option indicates that the reviewer is in favor of merging the pull request as-is, but suggests that the author may wish to consider making some small changes.
- Always stay polite and professional in your comments.
- The purpose of comments is to suggest improvements, ask a question or request for a change.
- Comments should be constructive and suggest ways to improve things.
- `Request changes` option should't be used if the comments consist only of questions.

Thanks in advance for your contribution, and we look forward to hearing from you :)
