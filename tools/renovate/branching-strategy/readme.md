# Renovate branching strategy rules

This folder contains the 2 set of rules according to the branching strategy put in place in the repository:

- [Release Branches](./release-branches.json) reducing the breaking changes and minor updates on release branches
- [Trunk Based Development](./trunk-based.json) permissive regarding the update on current main branch.

> [!WARNING]
> The major updates of any Node.Js version are currently allowed in [Release Branches rules](./release-branches.json).
> This will be reduced to only the Node.Js version used in Github Actions when the [issue relative to custom manager](https://github.com/renovatebot/renovate/issues/21760) will be fixed.
