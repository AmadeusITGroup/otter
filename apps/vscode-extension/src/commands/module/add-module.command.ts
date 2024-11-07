import type {
  IncomingMessage,
} from 'node:http';
import {
  get,
} from 'node:https';
import {
  posix,
} from 'node:path';
import type {
  NpmRegistryPackage,
  NPMRegistrySearchResponse,
  OTTER_MODULE_KEYWORD as OTTER_MODULE_KEYWORD_TYPE,
  OTTER_MODULE_SUPPORTED_SCOPES as OTTER_MODULE_SUPPORTED_SCOPES_TYPE,
} from '@o3r/schematics';
import * as vscode from 'vscode';
import type {
  ExtensionContext,
} from 'vscode';
import {
  getPackageScriptRunner,
} from '../helpers';

// TODO: Remove this workaround when #362 is implemented
const OTTER_MODULE_KEYWORD: typeof OTTER_MODULE_KEYWORD_TYPE = 'otter-module';

// TODO: Remove this workaround when #362 is implemented
const OTTER_MODULE_SUPPORTED_SCOPES: typeof OTTER_MODULE_SUPPORTED_SCOPES_TYPE = ['otter', 'o3r'];

async function promiseGetRequest<T>(url: string) {
  const res = await new Promise<IncomingMessage>((resolve, reject) => get(url, resolve)
    .on('error', (err) => reject(err)));

  return new Promise<T>((resolve, reject) => {
    const data: Buffer[] = [];
    res.on('data', (chunk: Buffer) => data.push(chunk));
    res.on('end', () => resolve(JSON.parse(Buffer.concat(data).toString()) as T));
    res.on('error', reject);
  });
}

/**
 * Get Available Otter modules on NPMjs.org
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
 * @param _context
 */
export function generateModuleAddCommand(_context: ExtensionContext) {
  return async () => {
    const pMmodules = getAvailableModules(OTTER_MODULE_KEYWORD, OTTER_MODULE_SUPPORTED_SCOPES, true)
      .then((mods) => mods.map<vscode.QuickPickItem>(({ name, description }) => ({
        label: name,
        description
      })));

    const moduleToAdd = await vscode.window.showQuickPick(pMmodules, {
      canPickMany: true,
      ignoreFocusOut: true,
      title: 'Select the modules your want to add to your projects'
    });

    if (!moduleToAdd || moduleToAdd.length === 0) {
      await vscode.window.showErrorMessage('List of modules are required');
      return;
    }

    const packageManager = await getPackageScriptRunner();
    moduleToAdd.forEach(({ label }) => {
      const terminal = vscode.window.createTerminal(`Add the module ${label}`);
      terminal.sendText(`${packageManager} ng add ${label} --defaults`, true);
      terminal.show();
    });
  };
}
