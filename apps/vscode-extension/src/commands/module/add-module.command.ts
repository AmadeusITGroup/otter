import { get } from 'node:https';
import { posix } from 'node:path';
import * as vscode from 'vscode';
import type { ExtensionContext } from 'vscode';
import type { IncomingMessage } from 'node:http';
import type { NpmRegistryPackage } from '@o3r/schematics';
import { getPackageScriptRunner } from '../helpers';
import type { OTTER_MODULE_KEYWORD as OTTER_MODULE_KEYWORD_TYPE, OTTER_MODULE_SUPPORTED_SCOPES as OTTER_MODULE_SUPPORTED_SCOPES_TYPE } from '@o3r/core';
import type { NPMRegistrySearchResponse } from '@o3r/schematics';

// TODO: Remove this workaround when #362 is implemented
const OTTER_MODULE_KEYWORD: typeof OTTER_MODULE_KEYWORD_TYPE = 'otter-module';

// TODO: Remove this workaround when #362 is implemented
const OTTER_MODULE_SUPPORTED_SCOPES: typeof OTTER_MODULE_SUPPORTED_SCOPES_TYPE = ['otter', 'o3r'];

async function promiseGetRequest<T>(url: string) {
  const res = await new Promise<IncomingMessage>((resolve, reject) => get(url, resolve)
    .on('error', (err) => reject(err)));

  return new Promise<T>((resolve, reject) => {
    const data: Buffer[] = [];
    res.on('data', (chunk) => data.push(chunk));
    res.on('end', () => resolve(JSON.parse(Buffer.concat(data).toString())));
    res.on('error', reject);
  });
}

/**
 * Get Available Otter modules on NPMjs.org
 *
 * @param keyword Keyword to search for Otter modules
 * @param scopeWhitelist List of whitelisted scopes
 * @param onlyNotInstalled Determine if only the packages that are NOT installed should be returned
 */
async function getAvailableModules(keyword: string, scopeWhitelist: string[] | readonly string[], onlyNotInstalled: boolean): Promise<NpmRegistryPackage[]> {
  const cwd = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '.';

  const registry = await promiseGetRequest<NPMRegistrySearchResponse>(`https://registry.npmjs.org/-/v1/search?text=keywords:${keyword}&size=250`);

  let packages = registry.objects
    .filter((pck) => pck.package?.scope && scopeWhitelist.includes(pck.package?.scope))
    .map((pck) => pck.package!);

  if (onlyNotInstalled) {
    packages = packages
      .filter((pck) => {
        try {
          return !require.resolve(pck.name, {
            paths: [posix.join(cwd, 'node_modules')]
          });
        } catch {
          return true;
        }
      });
  }

  return packages;
}

/**
 * Add modules to the current workspace
 *
 * @param context
 * @param folder
 * @param _context
 * @returns
 */
export function generateModuleAddCommand(_context: ExtensionContext) {

  return async () => {
    const pMmodules = getAvailableModules(OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES, true)
      .then((mods) => mods.map(({ name }) => name));

    const moduleToAdd = await vscode.window.showQuickPick(pMmodules, {
      canPickMany: true,
      ignoreFocusOut: true,
      title: 'Select the modules your want to add to your projects'
    });

    if (!moduleToAdd || moduleToAdd.length === 0) {
      await vscode.window.showErrorMessage('List of modules are required');
      return;
    }

    moduleToAdd
      .forEach((mod) => {
        const terminal = vscode.window.createTerminal(`Add the module ${mod}`);
        terminal.sendText(`${getPackageScriptRunner()} ng add ${mod} --defaults`, true);
        terminal.show();
      });
  };
}
