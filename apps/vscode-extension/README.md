# Otter Visual Studio Code Extension

This package contains the Visual Studio Code extension for Otter framework.

## Available commands

In VS Code, you can execute command via the palette panel which can be displayed using the `ctrl+shift+p` key combination.

The following commands are currently available:

### Generate

| Command                                   | Description                                                                    | How to execute                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Otter: Generate Component                 | Generate an Otter Angular component                                            | Right-click in explorer                          |
| Otter: Generate Service                   | Generate an Otter service                                                      | Right-click in explorer                          |
| Otter: Generate Store                     | Generate a Store based on NgRX                                                 | Right-click in explorer                          |
| Otter: Generate Otter Module              | Otter: Generate Otter Module                                                   | Right-click in explorer                          |
| Otter: Generate Fixture                   | Generate functions to an Otter fixture based on a selector and default methods | Right-click when selecting code in template file |
| Otter: Add analytics to component         | Generate analytics architecture for the selected component                     | Right-click on component file in explorer        |
| Otter: Add configuration to component     | Generate configuration architecture for the selected component                 | Right-click on component file in explorer        |
| Otter: Add context to component           | Generate context architecture for the selected component                       | Right-click on component file in explorer        |
| Otter: Add localization to component      | Generate localization architecture for the selected component                  | Right-click on component file in explorer        |
| Otter: Add localization key to component  | Add new localization key with the necessary template modification              | Right-click when selecting code in template file |
| Otter: Add theming to component           | Generate theming architecture for the selected component                       | Right-click on stye file in explorer             |
| Otter: Add fixture to component           | Generate fixture architecture for the selected component                       | Right-click on component file in explorer        |
| Otter: Add rules engine to component      | Generate rules engine architecture for the selected component                  | Right-click on component file in explorer        |
| Otter: Add iframe to component            | Generate an iframe for the selected component                                  | Right-click on component file in explorer        |
| Otter: Convert Angular component          | Convert the selected Angular component into an Otter component                 | Right-click on component file in explorer        |

All these commands are also available in the command panel.

The ones which add feature to component are available in the command panel only if the active editor is the component file with some exceptions:
- `Otter: Add theming to component` available when the style file is open
- `Otter: Add localization key to component` avaibable when the template is open and a text is selected

### Extract

| Command                                            | Description                                                 | How to execute                                  |
| -------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| Otter: Extract SCSS property to o3r.variable       | Extract a SCSS property into a o3r.variable                 | Command panel only                              |
| Otter: Extract all SCSS properties to o3r.variable | Extract all the SCSS properties of a file into o3r.variable | Right-click when selecting code in styling file |

> **Node**: Check [extract styling documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/vscode-extension/EXTRACT_STYLING.md)
