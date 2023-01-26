import * as vscode from 'vscode';
import { generateComponentGenerateCommand } from './commands/generate/component.command';
import { generateFixtureGenerateCommand } from './commands/generate/fixture.command';
import { wrapCommandWhenExplorerContext } from './commands/generate/helpers';
import { generateServiceGenerateCommand } from './commands/generate/service.command';
import { generateStoreGenerateCommand } from './commands/generate/store.command';

/**
 * Function to register commands.
 * This function is called by VSCode when the extension is activated.
 *
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('otter.generate.component', generateComponentGenerateCommand(context)),
    vscode.commands.registerCommand('otter.generate.service', generateServiceGenerateCommand(context)),
    vscode.commands.registerCommand('otter.generate.store', generateStoreGenerateCommand(context)),
    vscode.commands.registerCommand('otter.menu.generate.component', wrapCommandWhenExplorerContext(context, generateComponentGenerateCommand)),
    vscode.commands.registerCommand('otter.menu.generate.service', wrapCommandWhenExplorerContext(context, generateServiceGenerateCommand)),
    vscode.commands.registerCommand('otter.menu.generate.store', wrapCommandWhenExplorerContext(context, generateStoreGenerateCommand)),
    vscode.commands.registerCommand('otter.generate.fixture', generateFixtureGenerateCommand(context)),
    vscode.commands.registerCommand('otter.menu.generate.fixture', generateFixtureGenerateCommand(context))
  );
}

/**
 * Function to deactivate commands.
 * This function is called by VSCode when the extension is deactivated.
 */
export function deactivate() {}
