import { commands, ExtensionContext } from 'vscode';
import { generateComponentGenerateCommand } from './commands/generate/component.command';
import { generateFixtureGenerateCommand } from './commands/generate/fixture.command';
import { wrapCommandWhenExplorerContext } from './commands/generate/helpers';
import { generateServiceGenerateCommand } from './commands/generate/service.command';
import { generateStoreGenerateCommand } from './commands/generate/store.command';
import { extractAllToVariable } from './commands/extract/styling/extract-all-to-variable.command';
import { extractToVariable } from './commands/extract/styling/extract-to-variable.command';

/**
 * Function to register commands.
 * This function is called by VSCode when the extension is activated.
 *
 * @param context
 */
export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('otter.generate.component', generateComponentGenerateCommand(context)),
    commands.registerCommand('otter.generate.service', generateServiceGenerateCommand(context)),
    commands.registerCommand('otter.generate.store', generateStoreGenerateCommand(context)),
    commands.registerCommand('otter.menu.generate.component', wrapCommandWhenExplorerContext(context, generateComponentGenerateCommand)),
    commands.registerCommand('otter.menu.generate.service', wrapCommandWhenExplorerContext(context, generateServiceGenerateCommand)),
    commands.registerCommand('otter.menu.generate.store', wrapCommandWhenExplorerContext(context, generateStoreGenerateCommand)),
    commands.registerCommand('otter.generate.fixture', generateFixtureGenerateCommand(context)),
    commands.registerCommand('otter.menu.generate.fixture', generateFixtureGenerateCommand(context)),
    commands.registerTextEditorCommand('otter.extract.styling.variable', extractToVariable(context)),
    commands.registerTextEditorCommand('otter.menu.extract.styling.variable', extractToVariable(context)),
    commands.registerTextEditorCommand('otter.extract.styling.allVariable', extractAllToVariable(context))
  );
}

/**
 * Function to deactivate commands.
 * This function is called by VSCode when the extension is deactivated.
 */
export function deactivate() {}
