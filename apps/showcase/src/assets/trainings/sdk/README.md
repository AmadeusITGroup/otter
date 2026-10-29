# SDK training workspace

The base WebContainer workspace used by the SDK training is stored in
`shared/monorepo-template.json`. It is generated from a separate Otter workspace rather than
from files in this monorepo.

## Refresh the template

Run the generation target from the Otter repository, replacing `<version>` with the Otter version
used by the training:

```shell
yarn nx run showcase:generate-sdk-training --otter-version <version>
```

The target creates a temporary `sdk-tutorial` workspace with `npm create @o3r`, generates the
`tutorial-app` application and `sdk-tutorial` SDK, and serializes the workspace to
`shared/monorepo-template.json`. It removes installed dependencies, caches, coverage, and build
outputs from the template, then deletes the temporary workspace.

Use `--dry-run` to print the commands without executing them:

```shell
yarn nx run showcase:generate-sdk-training --otter-version <version> --dry-run
```