/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';
import { getCurrentFolder, getPackageScriptRunner } from './helpers';

/**
 * Generate component command
 *
 * @param _context
 * @param folder
 * @returns
 */
export function generateComponentGenerateCommand(_context: ExtensionContext, folder?: string) {
  return async () => {
    const componentName = await vscode.window.showInputBox({
      title: 'Specify your component Name',
      ignoreFocusOut: true
    });

    if (!componentName) {
      await vscode.window.showErrorMessage('Component name is required');
      return;
    }

    const componentPath = folder || await vscode.window.showInputBox({
      title: 'Path to your component',
      value: getCurrentFolder() || vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath,
      ignoreFocusOut: true
    });

    const componentStructure = await vscode.window.showQuickPick(['full', 'container', 'presenter'], {
      canPickMany: false,
      ignoreFocusOut: true,
      title: 'Specify the structure of the component you want to generate'
    });

    if (!componentStructure) {
      await vscode.window.showErrorMessage('Component structure is required');
      return;
    }

    const description = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      title: 'Specify your component description'
    });

    const config = vscode.workspace.getConfiguration('otter.generate');
    const terminal = vscode.window.createTerminal('Otter Component generator');
    const defaultOptions = [
      `--skip-linter="${!!config.get<boolean>('skipLinter')}"`,
      `--activate-dummy="${!!config.get<boolean>('component.activateDummy')}"`,
      `--use-context="${!!config.get<boolean>('component.useContext')}"`,
      `--use-otter-theming="${!!config.get<boolean>('component.useOtterTheming')}"`,
      `--use-component-fixtures="${!!config.get<boolean>('component.useComponentFixtures')}"`,
      `--use-otter-config="${!!config.get<boolean>('component.useOtterConfig')}"`,
      `--use-otter-analytics="${!!config.get<boolean>('component.useOtterAnalytics')}"`,
      `--use-storybook="${!!config.get<boolean>('component.useStorybook')}"`,
      `--use-localization="${!!config.get<boolean>('component.useLocalization')}"`
    ];
    const options = [
      ...defaultOptions,
      `--component-structure="${componentStructure}"`,
      `--description="${description || ''}"`,
      ...(componentPath ? [`--path="${componentPath}" `] : [])
    ];
    terminal.sendText(`${getPackageScriptRunner()} ng generate @o3r/core:component ${options.join(' ')} "${componentName}"`, true);
    terminal.show();
  };
}
