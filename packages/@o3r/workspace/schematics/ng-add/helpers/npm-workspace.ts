import { chain } from '@angular-devkit/schematics';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SchematicsException } from '@angular-devkit/schematics';
import type { PackageJson } from 'type-fest';
import { DEFAULT_ROOT_FOLDERS, isNxContext, setupSchematicsParamsForProject, WorkspaceLayout, WorkspaceSchematics } from '@o3r/schematics';

/**
 * Update root package.json to include workspaces
 * if ng context Update angular.json to include the workspaces definitions into schematics default params
 * if nx context update nx.json workspacelayout
 * @param directories workspaces directories to include in package.json
 */
export function addWorkspacesToProject(directories: WorkspaceLayout = DEFAULT_ROOT_FOLDERS): Rule {

  const updatePackageJson = (tree: Tree, _context: SchematicContext) => {

    const rootPackageJsonPath = '/package.json';
    if (!tree.exists(rootPackageJsonPath)) {
      throw new SchematicsException('Root package.json does not exist');
    }

    const rootPackageJsonObject = tree.readJson(rootPackageJsonPath) as PackageJson;

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    rootPackageJsonObject.workspaces = [...new Set(Object.values(directories).map(d => `${d}/*`).concat(rootPackageJsonObject.workspaces as string[] || []))];

    tree.overwrite(rootPackageJsonPath, JSON.stringify(rootPackageJsonObject, null, 2));
    return tree;
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const updateAngularJson = setupSchematicsParamsForProject({ '*:*': directories } as WorkspaceSchematics);

  const updateNxWorkspaceLayout = (tree: Tree, _context: SchematicContext) => {
    const nxJson = tree.readJson('/nx.json') as any;
    nxJson.workspaceLayout ||= {};
    nxJson.workspaceLayout.libsDir = directories.libsDir;
    nxJson.workspaceLayout.appsDir = directories.appsDir;
    tree.overwrite('/nx.json', JSON.stringify(nxJson, null, 2));
    return tree;
  };

  return (tree: Tree, _context: SchematicContext) => {
    return chain([
      updatePackageJson,
      isNxContext(tree) ? updateNxWorkspaceLayout : updateAngularJson
    ]);
  };

}

/**
 * Remove wrongly generated scripts by ng new for root package.json in case of monorepo
 * @param tree
 * @param _context
 */
export function filterPackageJsonScripts(tree: Tree, _context: SchematicContext) {
  const rootPackageJsonPath = '/package.json';
  if (!tree.exists(rootPackageJsonPath)) {
    throw new SchematicsException('Root package.json does not exist');
  }

  const defaultScriptToRemove: Record<string, string> = {
    build: 'ng build',
    test: 'ng test',
    start: 'ng serve',
    watch: 'ng build --watch --configuration development'
  };

  const rootPackageJsonObject = tree.readJson(rootPackageJsonPath) as PackageJson;
  rootPackageJsonObject.scripts = Object.fromEntries(
    Object.entries(rootPackageJsonObject.scripts || {}).filter(([scriptName, scriptValue]) => scriptValue !== defaultScriptToRemove[scriptName])
  );

  tree.overwrite(rootPackageJsonPath, JSON.stringify(rootPackageJsonObject, null, 2));
  return tree;
}
