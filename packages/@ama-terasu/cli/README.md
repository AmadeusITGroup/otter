# Ama-Terasu

Ama Terasu is a Command Line Interface to administrate Amadeus Digital Experience suite.

## How to use

This CLI is NodeJs based and can be used with this simple command:

```shell
npx @ama-terasu/cli --help
```

## How to register a module

The only thing you need to do to get your module available is to publish your module on [npmjs.com](https://www.npmjs.com/) with **amaterasu-module** into your package [keywords](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords).

> **Note**: Your module should [export](https://nodejs.org/api/modules.html#moduleexports) an object following the `AmaCliModule` interface from the `@ama-terasu/core` package.
