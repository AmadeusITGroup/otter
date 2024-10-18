import {
  lstatSync
} from 'node:fs';
import {
  basename,
  dirname,
  posix,
  relative
} from 'node:path';
import * as vscode from 'vscode';

/**
 * Get the local path of the folder of the current open file
 */
export const getCurrentFolder = () => {
  const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;
  return currentlyOpenTabfilePath && relative(vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.', dirname(currentlyOpenTabfilePath));
};

/**
 * Wrap a command to add the folder path when activated from explorer context
 * @param context vscode context
 * @param command command to execute
 */
export const wrapCommandWhenExplorerContext = (
  context: vscode.ExtensionContext,
  command: (context: vscode.ExtensionContext, folder?: string) => () => Promise<void>
) => {
  return (targetResource: vscode.Uri) => {
    const folderPath = vscode.workspace.asRelativePath(lstatSync(targetResource.fsPath).isDirectory() ? targetResource.fsPath : dirname(targetResource.fsPath));
    return command(context, folderPath)();
  };
};

const sortWorkspaceUris = (uri1: vscode.Uri, uri2: vscode.Uri) => {
  const pathLengthDiff = uri1.fsPath.split(posix.delimiter).length - uri2.fsPath.split(posix.delimiter).length;
  if (pathLengthDiff === 0) {
    // If path are at the same level we sort first angular.json
    return basename(uri1.fsPath, '.json') > basename(uri2.fsPath, '.json')
      ? 1
      : -1;
  }
  // Else we sort first the one closer to the root level
  return pathLengthDiff;
};

const getInfoFromWorkspaceJsonUris = async <T>(
  getInfo: (workspaceJsonUri: vscode.Uri) => Promise<T | undefined>
) => {
  const workspaceJsonUris = await vscode.workspace.findFiles('{angular,nx}.json');
  const sortedWorkspaceJsonUris = workspaceJsonUris.sort(sortWorkspaceUris);
  for (const workspaceJsonUri of sortedWorkspaceJsonUris) {
    const infoFromWorkspace = await getInfo(workspaceJsonUri);
    if (infoFromWorkspace) {
      return infoFromWorkspace;
    }
  }
};

const getPackageManagerFromWorkspaceUri: (workspaceJsonUri: vscode.Uri) => Promise<string | undefined> = async (workspaceJsonUri: vscode.Uri): Promise<string | undefined> => {
  const workspaceJsonDocument = await vscode.workspace.openTextDocument(workspaceJsonUri);
  const workspaceJson = JSON.parse(workspaceJsonDocument.getText());
  return workspaceJson.cli?.packageManager as string | undefined;
};

/**
 * Get the runner for NPM scripts
 */
export const getPackageScriptRunner = async (): Promise<string> => {
  const packageManager = await getInfoFromWorkspaceJsonUris(getPackageManagerFromWorkspaceUri);
  return packageManager || 'npx';
};

const toSnakeCase = (str: string) => str
  .match(/[A-Z]{2,}(?=[A-Z][a-z]+\d*|\b)|[A-Z]?[a-z]+\d*|[A-Z]|\d+/g)
  ?.map((x) => x.toLowerCase())
  .join('-') || '';

/**
 * Stringify options for schematic
 * @param options
 * @param excludedOptions
 */
export const stringifyOptions = (options: Record<string, any> = {}, excludedOptions: string[] = []) => {
  return Object.entries(options)
    .filter(([optionName]) => !excludedOptions.some((opt) =>
      opt === optionName
      || opt.startsWith(`--${toSnakeCase(optionName)}=`)
    ))

    .map(([optionName, optionValue]) => `--${toSnakeCase(optionName)}="${optionValue}"`);
};

/**
 * Get the schematic default from angular.json or nx.json
 * @param schematicName
 */
export const getSchematicDefaultOptions = async (schematicName: string) => {
  const getSchematicDefaultOptionsFromWorkspaceUri = async (workspaceJsonUri: vscode.Uri) => {
    const workspaceJsonDocument = await vscode.workspace.openTextDocument(workspaceJsonUri);
    const workspaceJson = JSON.parse(workspaceJsonDocument.getText());
    return basename(workspaceJsonUri.fsPath, '.json') === 'angular'
      ? workspaceJson.schematics?.[schematicName]
      : workspaceJson.generators?.[schematicName];
  };
  return await getInfoFromWorkspaceJsonUris(getSchematicDefaultOptionsFromWorkspaceUri) ?? {};
};
