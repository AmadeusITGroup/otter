# SDK Generator

This package provides `schematics` generators to create an SDK based on an API swagger spec.

## Setup

The Angular schematics package is required to use these generators.

#### First add @angular-devkit/schematics-cli if not already installed:
```shell
yarn add --dev @angular-devkit/schematics-cli
```
OR
```shell
npm i -D @angular-devkit/schematics-cli
```
Note that you should specify the cli version that matches the angular version 

#### Then if you are in an Angular project

```shell
yarn ng add @ama-sdk/schematics
yarn ng add @ama-sdk/core
```
or
```shell
npx -p @angular/cli ng add @ama-sdk/schematics
npx -p @angular/cli ng add @ama-sdk/core
```

#### else if you are not in an angular project

```shell
# Install @ama-sdk/core and the SDK generator
yarn add --dev @ama-sdk/schematics @ama-sdk/core
yarn schematics @ama-sdk/schematics:install
yarn schematics @ama-sdk/core:install
```
or
```shell
npm i -D @ama-sdk/schematics @ama-sdk/core
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

If you use `Yarn2+` (we highly recommend to do so), you can use the following `scripts` in `package.json`:
Make sure you have your spec file `./swagger-spec.yaml` in your repository. Visit https://swagger.io/specification/ for more information.


For the first generation you can use the script in package json or the command directly:
```json
    "generate": "yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yaml"
```

And then each time you change something in the spec:
```json
    "spec:regen": "schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yaml && yarn clear-index"
```

If you want to upgrade the structure of the sdk with the latest versions, you can upgrade the `@ama-sdk/schematics` version in you project and run:
`yarn schematics @ama-sdk/schematics:typescript-shell`
It will update the structure of your sdk with the latest changes.

### Debug the typescript generator
The open api generator extracts a JSON data model with a lot of information describing the specification provided, and use this data model to feed the templates and generate the code.
If there is an issue with the files generated with the spec provided, the generator provides debugging features that log this data model.

You can use global property options to pass one or both of the following options:
* debugModel - log the full json structure used to generate models
* debugOperations - log the full json structure used to generate operations

Example:
```shell
yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./swagger-spec.yaml --global-property debugModels,debugOperations
```

You can map this data model with the [templates](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/schematics/schematics/typescript/core/openapi-codegen-typescript/src/main/resources/typescriptFetch) used by the generator.

### Known limitations
Complex objects in arrays are not supported as return type, ex:
```yaml
  /users:
    get:
      summary: Returns a list of users.
      description: Optional extended description in CommonMark or HTML.
      responses:
        '200':
          description: A JSON array of Users
          content:
            application/json:
              schema:
                type: array
                items:
                  type: User #Not supported, you can return a list of string instead, or create an object usersReply to wrap the response (recommended)
```

### Java Client Core SDK

Generate a Java Client Core SDK:

Make sure to have a `./swagger-spec.yaml` file at the root of your project and run:

```shell
yarn schematics @ama-sdk/schematics:java-client-core --spec-path ./swagger-spec.yaml --swagger-config-path ./swagger-codegen-config.json
```

Note that the Java client core generator relies on swagger codegen and not on open api generator.
[Default swagger config](./schematics/java/client-core/swagger-codegen-java-client/config/swagger-codegen-config.json) will be used if `--swagger-config-path` is not provided.
