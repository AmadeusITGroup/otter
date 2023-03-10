# Ama-Terasu

Ama Terasu is a Command Line Interface to administrate Amadeus Digital Experience suite.

## How to use

This CLI is NodeJs based and can be used with this simple command:

```shell
npx @ama-terasu/cli --help
```

## How to register a module

To register a module into the CLI, the `package.json` of the CLI should be updated with the following items:

* Add the module into CLI dependencies via `yarn workspace @ama-terasu/cli add <my-module>`
* Add to your module the tag `amaterasu-module` into the `keywords` list of your module `package.json` file.
