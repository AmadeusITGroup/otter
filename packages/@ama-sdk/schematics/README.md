# SDK Generator

This package provides `schematics` generators to create an SDK based on an API swagger spec.

## Setup

The Angular schematics package is required to use these generators:

if you are in an Angular project

```shell
yarn ng add @ama-sdk/schematics
yarn ng add @ama-sdk/core
```
or
```shell
npx -p @angular/cli ng add @ama-sdk/schematics
npx -p @angular/cli ng add @ama-sdk/core
```

else

```shell
# Install @angular-devkit/schematics-cli, @ama-sdk/core and the SDK generator
yarn add --dev @angular-devkit/schematics-cli @ama-sdk/schematics @ama-sdk/core
yarn schematics @ama-sdk/schematics:install
yarn schematics @ama-sdk/core:install
```
or
```shell
npm i -D @angular-devkit/schematics-cli @ama-sdk/schematics @ama-sdk/core
npx -p @angular-devkit/schematics-cli schematics @ama-sdk/schematics:install
npx -p @angular-devkit/schematics-cli schematics @ama-sdk/core:install
```

## How to use?

### Typescript SDK

The typescript generator provides 2 generators:

- **shell**: To generate the "shell" of an SDK package
- **core**: To (re)generate the SDK based on a specified Swagger spec
- **create**: To create a new SDK from scratch (i.e. chain **shell** and **core**)

To generate the `shell` you can run:

```shell
yarn schematics @ama-sdk/schematics:typescript-shell
```

If you use `Yarn2+`, you can use the following `scripts` in `package.json`:

```json
    "resolve": "node -e 'process.stdout.write(require.resolve(process.argv[1]));'",
    "generate": "yarn schematics @ama-sdk/schematics:typescript-core --swagger-spec-path ./swagger-spec.yaml",
    "upgrade:repository": "yarn schematics @ama-sdk/schematics:typescript-shell",
```

Use `generate` to (re)generate your SDK based on the content of `./swagger-spec.yaml` (make sure you have this file at the root of your project) and `upgrade:repository` to regenerate the structure of your project.

### Java Client Core SDK

Generate a Java Client Core SDK:

Make sure to have a `./swagger-spec.yaml` file at the root of your project and run:

```shell
yarn schematics @ama-sdk/schematics:java-client-core --swagger-spec-path ./swagger-spec.yaml --swagger-config-path ./swagger-codegen-config.json
```

[Default swagger config](./schematics/java/client-core/swagger-codegen-java-client/config/swagger-codegen-config.json) will be used if `--swagger-config-path` is not provided.
