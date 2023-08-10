/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { relative } from 'node:path';
import * as vscode from 'vscode';
import { getPackageScriptRunner } from '../../helpers';

const executeSchematic = async (componentPath: string, schematicName: string, getExtraOptions: () => Promise<string[]> = () => Promise.resolve([])) => {
  const config = vscode.workspace.getConfiguration('otter.generate');
  const terminal = vscode.window.createTerminal('Otter');
  const extraOptions = await getExtraOptions();
  const options = [
    ...(
      !extraOptions.some((opt) => opt.startsWith('--path='))
        ? [`--path="${componentPath}"`]
        : []
    ),
    ...(
      !extraOptions.some((opt) => opt.startsWith('--skip-linter='))
        ? [`--skip-linter="${!!config.get<boolean>('skipLinter')}"`]
        : []
    ),
    ...extraOptions
  ];
  terminal.sendText(`${getPackageScriptRunner()} ng g ${schematicName} ${options.join(' ')}`, true);
  terminal.show();
};

/**
 * Find the selected path on which apply the schematic and execute it
 * @param schematicName Name of the schematic
 * @param getExtraOptions Method to retrieve extra options
 */
export const findPathAndExecuteSchematic = (schematicName: string, getExtraOptions?: () => Promise<string[]>) =>
  async (targetResource: vscode.Uri | undefined) => {
    let componentPath = targetResource ? vscode.workspace.asRelativePath(targetResource.path) : '';
    if (!componentPath) {
      if (vscode.window.activeTextEditor?.document.fileName) {
        componentPath = relative(
          vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.',
          vscode.window.activeTextEditor.document.fileName
        );
      } else {
        componentPath = await vscode.window.showInputBox({
          placeHolder: '/src/component/my-component/my-component.component.ts',
          validateInput: (value) => {
            return !value ? {
              message: 'Path is required',
              severity: vscode.InputBoxValidationSeverity.Error
            } : null;
          }
        }) || '';
      }
      if (!componentPath) {
        await vscode.window.showErrorMessage('Path is required');
        return;
      }
    }
    return executeSchematic(componentPath, schematicName, getExtraOptions);
  };
