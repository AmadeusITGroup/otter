# Otter IntelliJ IDEA / WebStorm Plugin

This package contains the IntelliJ plugin for Otter framework.

## Available commands

In WebStorm or IntelliJ IDEA, you can execute actions via the right click -> otter.

The following actions are currently available:

### Extract

| Action                                | Description                                 | How to execute                                                                    |
|---------------------------------------|---------------------------------------------|-----------------------------------------------------------------------------------|
| Extract SCSS property to o3r.variable | Extract a SCSS property into a o3r.variable | Cursor on the line, right click -> otter -> Extract SCSS property to o3r.variable |

> **Node**: Check [extract styling documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/intellij-extension/EXTRACT_STYLING.md)

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
