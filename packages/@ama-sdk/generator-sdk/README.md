# SDK Generator

This package provides a [Yeoman](http://yeoman.io) generator to create an SDK based on an API swagger spec.

## Setup

Yeoman is required to use this generator:
```shell
# Install Yeoman, @ama-sdk/core and the SDK generator
yarn add --dev yo @ama-sdk/generator-sdk @ama-sdk/core
```

## How to use?

### Typescript SDK
The typescript generator provides 2 generators:
*  **shell**: To generate the "shell" of an SDK package
*  **core**: To (re)generate the SDK based on a specified Swagger spec
*  **create**: To create a new SDK from scratch (i.e. chain **shell** and **core**)

For generating the `shell`, you can run:
```shell
yarn yo ./node_modules/@ama-sdk/generator-sdk/src/generators/shell
```

If using `Yarn2+`, you can use the following `scripts` in `package.json`:
```json
    "resolve": "node -e 'process.stdout.write(require.resolve(process.argv[1]));'",
    "generate": "yo $(yarn resolve @ama-sdk/generator-sdk/src/generators/core) --swaggerSpecPath ./swagger-spec.yaml --force",
    "upgrade:repository": "yo $(yarn resolve @ama-sdk/generator-sdk/src/generators/shell)",
```

Use `generate` to (re)generate your SDK based on the content of `./swagger-spec.yaml` (make sure you have this file at the root of your project) and `upgrade:repository` to regenerate the structure of your project.

### Dart SDK
Generate a Dart SDK:

Make sure to have a `./swagger-spec.yaml` file at the root of your project and run:
```shell
yarn yo ./node_modules/@ama-sdk/generator-sdk/src/generators/dart-core --swaggerSpecPath ./swagger-spec.yaml --swaggerConfigPath node_modules/@ama-sdk/generator-sdk/generators/dart-core/templates/swagger-codegen-dart/config/swagger-codegen-config.json --force
```

For more details please check:
[Dart generator doc](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/generator-sdk/src/generators/dart-core/templates/swagger-codegen-dart/README.md)


### Java Resteasy client SDK
Generate a Java Resteasy SDK:

Make sure to have a `./swagger-spec.yaml` file at the root of your project and run:
```shell
yarn yo ./node_modules/@ama-sdk/generator-sdk/src/generators/java-client-core --swaggerSpecPath ./swagger-spec.yaml --swaggerConfigPath node_modules/@ama-sdk/generator-sdk/generators/java-client-core/templates/swagger-codegen-java-client/config/swagger-codegen-config.json --force
```

For more details please check:
[Java resteasy client generator doc](https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/generator-sdk/src/generators/java-resteasy-client-core/templates/swagger-codegen-java-resteasy-client/README.md)

