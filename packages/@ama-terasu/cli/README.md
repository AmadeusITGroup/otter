# Ama-Terasu

Ama Terasu is a Command Line Interface to administrate Amadeus Digital Experience suite.

## How to use

This CLI is NodeJs based and can be used with this simple command:

```shell
npx @ama-terasu/cli --help

# or with yarn2+
yarn dlx @ama-terasu/cli --help
```

> **Note**: For yarn, the CLI modules are currently available only with `nodeLinker: node_modules` strategy.

### Managing installed modules

You can get the list the versions of the available modules with the following command:

```shell
npx @ama-terasu/cli --version
```

The command will give you information regarding the version of the modules installed and the latest available ones.
You can upgrade the modules version with the module manager:

```shell
# upgrade/install to the latest version:
npx @ama-terasu/cli module update <my module>

# upgrade/install to a specific version:
npx @ama-terasu/cli module update <my module> --to 1.2.3
```

> **Note**: when accessing to a module that is not installed, the CLI will automatically download the latest available version

## How to register a module

The only thing you need to do to get your module available is to publish your module on [npmjs.com](https://www.npmjs.com/) with **amaterasu-module** into your package [keywords](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords).

> **Note**: Your module should [export](https://nodejs.org/api/modules.html#moduleexports) an object following the `AmaCliModule` interface from the `@ama-terasu/core` package.
