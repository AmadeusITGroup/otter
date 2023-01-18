# Visual Studio Code Extension

Otter Framework includes a Visual Studio Code extension for the following features:

- Generation of Otter components, services and stores items

## How to install the extension

Currently the VSCode Otter extension is not published on Microsoft store, unfortunately VSCode does not not allow to install a local extension yet.

As workaround you can test the extension by running the `vscode-run-extension` debug command in your VSCode.

## Available commands

In VS Code, you can execute command via the palette panel which can be displayed using the `ctrl+shift+p` key combination.

The following commands are currently available:

| Command                   | Description                         | How to execute          |
|---------------------------|-------------------------------------|-------------------------|
| Otter: Generate Component | Generate an Otter Angular component | Right-click in explorer |
| Otter: Generate Service   | Generate an Otter service           | Right-click in explorer |
| Otter: Generate Store     | Generate a Store based on NgRX      | Right-click in explorer |
| Otter: Generate Fixture   | Generate functions to an Otter fixture based on a selector and default methods | Right-click when selecting code in template file |

