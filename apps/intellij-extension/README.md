# Otter IntelliJ IDEA / WebStorm Plugin

This package contains the IntelliJ plugin for Otter framework.

## Available commands

In WebStorm or IntelliJ IDEA, you can execute actions via the right click → otter.

The following actions are currently available:

### Extract

| Action                                      | Description                                                  | How to execute                                                                    |
|---------------------------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------|
| Extract SCSS property to o3r.variable      | Extract a SCSS property into a o3r.variable                 | Cursor on the line, right click → otter → Extract SCSS property to o3r.variable |
| Extract all SCSS properties to o3r.variables | Extract all SCSS properties in the file using o3r variables | Right click → otter → Extract all SCSS properties to o3r.variables              |

### Generate

| Action                | Description                                           | How to execute                         |
|-----------------------|-------------------------------------------------------|----------------------------------------|
| Generate Component    | Generate an Otter Angular component                  | Right click → otter → Generate → Component |
| Generate Service      | Generate an Otter service                            | Right click → otter → Generate → Service   |
| Generate Store        | Generate a Store based on NgRX                       | Right click → otter → Generate → Store     |
| Generate Module       | Generate an Otter Module                             | Right click → otter → Generate → Module    |
| Generate Fixture      | Generate functions to an Otter fixture based on a selector and default methods | Select text in template file → right click → otter → Generate → Fixture |

### Module Management

| Action                | Description                                           | How to execute                         |
|-----------------------|-------------------------------------------------------|----------------------------------------|
| Add Otter Modules     | Add Otter modules to your project                    | Right click → otter → Add Otter Modules |

### Add to Component

| Action                           | Description                                                       | How to execute                                                        |
|----------------------------------|-------------------------------------------------------------------|-----------------------------------------------------------------------|
| Add Analytics to Component       | Generate analytics architecture for the selected component       | Right click on component file → otter → Add to Component → Analytics |
| Add Configuration to Component   | Generate configuration architecture for the selected component   | Right click on component file → otter → Add to Component → Configuration |
| Add Context to Component         | Generate context architecture for the selected component         | Right click on component file → otter → Add to Component → Context  |
| Add Fixture to Component         | Generate fixture architecture for the selected component         | Right click on component file → otter → Add to Component → Fixture  |
| Add Iframe to Component          | Generate an iframe for the selected component                    | Right click on component file → otter → Add to Component → Iframe   |
| Add Localization to Component    | Generate localization architecture for the selected component    | Right click on component file → otter → Add to Component → Localization |
| Add Localization Key to Component | Add new localization key with the necessary template modification | Select text in template file → right click → otter → Add to Component → Add Localization Key |
| Add Rules Engine to Component    | Generate rules engine architecture for the selected component    | Right click on component file → otter → Add to Component → Rules Engine |
| Add Theming to Component         | Generate theming architecture for the selected component         | Right click on component file → otter → Add to Component → Theming  |
| Convert Angular Component        | Convert the selected Angular component into an Otter component   | Right click on component file → otter → Add to Component → Convert  |

## IntelliSense Features

### SCSS Styling Auto-completion
- Auto-completion for `$o3rVariable` in SCSS files when `@use '@o3r/styling'` is imported
- Provides template insertion for o3r styling variables

### Configuration Tags Auto-completion  
- Auto-completion for `@o3rWidget` and `@o3rWidgetParam` in JSDoc comments
- Available in TypeScript and JavaScript files

> **Note**: Check [extract styling documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/intellij-extension/EXTRACT_STYLING.md)

## Settings

To access the settings of the plugin: 
* Open the settings of your IDEA
* Go to the Editor section
* Otter Extractor Settings

You can set the prefix of your app and the forbidden words - which will be escaped from the extraction

## Install the plugin

You need first to generate the ZIP archive for deployment.
You can use the gradle script "buildPlugin" in IntelliJ to do that.
Then you need to install the plugin in your IDE, the zip being located in the /build/distributions folder of this app.

Official instructions are available [here](https://www.jetbrains.com/help/idea/managing-plugins.html?_ga=2.91694618.1422280839.1696485258-1312489406.1696485258#install_plugin_from_disk)

## Run the extension for development
Official instructions are available [here](https://plugins.jetbrains.com/docs/intellij/creating-plugin-project.html#executing-the-plugin)

In IntelliJ IDEA:
* Edit configurations
* Click + to add a new configuration
* Pick Gradle in the list
  * Name it
  * Set the run to "runIde"
  * Set the gradle project to the folder of this README file
* Save the configuration
* Run it
