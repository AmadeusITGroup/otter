# Otter Visual Studio Code Extension

This package contains the Visual Studio Code extension for Otter framework.

## Available commands

In VS Code, you can execute command via the palette panel which can be displayed using the `ctrl+shift+p` key combination.

The following commands are currently available:

### Generate

| Command                   | Description                         | How to execute          |
|---------------------------|-------------------------------------|-------------------------|
| Otter: Generate Component | Generate an Otter Angular component | Right-click in explorer |
| Otter: Generate Service   | Generate an Otter service           | Right-click in explorer |
| Otter: Generate Store     | Generate a Store based on NgRX      | Right-click in explorer |
| Otter: Generate Fixture   | Generate functions to an Otter fixture based on a selector and default methods | Right-click when selecting code in template file |

### Extract

| Command                                            | Description                                                 | How to execute                                  |
| -------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| Otter: Extract SCSS property to o3r.variable       | Extract a SCSS property into a o3r.variable                 | Command panel only                              |
| Otter: Extract all SCSS properties to o3r.variable | Extract all the SCSS properties of a file into o3r.variable | Right-click when selecting code in styling file |

> **Node**: Check [extract styling documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/vscode-extension/EXTRACT_STYLING.md)
