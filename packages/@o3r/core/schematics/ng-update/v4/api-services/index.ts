import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getDestinationPath, readAngularJson } from '@o3r/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { addImportToModule, findNodes, insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { sync as globbySync } from 'globby';
import * as path from 'node:path';

const INJECT_TEMPLATE = 'apiFactoryService: ApiFactoryService';

/**
 *
 */
export function updateApiServices(): Rule {

  /**
   * Remove the API Services
   *
   * @param tree
   * @param _context
   */
  const removeServiceApis = (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const serviceApiPath = workspace.schematics?.['@otter/ng-tools:api-service']?.path;
    if (!serviceApiPath) {
      return tree;
    }
    const cwd = process.cwd();


    const paths = globbySync(path.join(cwd, serviceApiPath, '**', '*-api.service.ts').replace(/[\\/]/g, '/'))
      .map((p) => `/${path.relative(cwd, p).replace(/[\\/]/g, '/')}`);
    paths.forEach((p) => tree.delete(p));
    return tree;
  };

  /**
   * Add ApiManagerModule import in the module file
   *
   * @param tree
   * @param context
   * @param filePath
   */
  const addApiManagerModuleImport = (tree: Tree, context: SchematicContext, filePath: string) => {
    if (!tree.exists(filePath)) {
      context.logger.debug(`No file ${filePath} found, the module update will be skipped.`);
      return tree;
    }

    const content = tree.read(filePath)!.toString();

    if (/ApiManagerModule/.test(content)) {
      context.logger.debug(`ApiManagerModule already used in ${filePath}, the module update will be skipped.`);
      return tree;
    }

    const recorder = tree.beginUpdate(filePath);
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ES2015, true);

    addImportToModule(sourceFile, filePath, 'ApiManagerModule', '@o3r/application')
      .forEach((change) => {
        if (change instanceof InsertChange) {
          recorder.insertLeft(change.pos, change.toAdd);
        }
      });

    tree.commitUpdate(recorder);
    return tree;
  };

  /**
   * replace API Services in given paths
   *
   * @param tree
   * @param context
   * @param paths
   */
  const replaceApiService = (tree: Tree, context: SchematicContext, paths: string[]): Tree => {
    paths
      .map((filePath) => ({ filePath, content: tree.read(filePath)?.toString() }))
      .filter((value): value is { filePath: string; content: string} => !!value.content)
      .forEach(({ filePath, content}) => {
        let apiServiceRes: RegExpMatchArray | null = null;
        let hasBeenTouched = false;
        let isMultipleApiService = false;
        let count = 0;
        do {
          apiServiceRes = null;
          apiServiceRes = content.match(/^import .*[^ {]*.*ApiService.*$/mi);

          if (!apiServiceRes) {
            continue;
          }

          const serviceNames = apiServiceRes?.[0].match(/\w+ApiService/g);
          if (!serviceNames) {
            continue;
          }

          let apiServiceReplacement = '';
          if (serviceNames.length !== apiServiceRes[0].split(',').length) {
            apiServiceReplacement = apiServiceRes[0] + '\n';
            serviceNames.forEach((serviceName) =>
              apiServiceReplacement = apiServiceReplacement.replace(new RegExp(`${serviceName}\\s*,?`), '')
            );
          }

          content = content.replace(apiServiceRes[0] + '\n', apiServiceReplacement);
          isMultipleApiService = isMultipleApiService || serviceNames.length > 1 || count >= 1;
          count++;

          hasBeenTouched = true;
          // eslint-disable-next-line no-loop-func
          serviceNames.forEach((serviceName) => {
            const injectRes = content.match(new RegExp(`(\\w*)\\s*:\\s*${serviceName}`, 'i'));
            const injectName = injectRes?.[1];

            if (!injectName) {
              return;
            }
            const apiName = serviceName.replace(/Service$/, '');
            content = content.replace(injectRes[0], INJECT_TEMPLATE);
            content = content
              .replace(new RegExp(`(this\\.)?${injectName}\\.api`, 'gm'), `this.apiFactoryService.getApi(${apiName})`);

            // Add API Model import
            if (!content.match(new RegExp(`^import .*[^ {]*.*${apiName}.*$`, 'mi'))) {
              const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ES2015, true);
              const apiImportChange = insertImport(sourceFile, filePath, apiName, '@dapi/sdk', false);
              if (apiImportChange instanceof InsertChange) {
                content = content.substr(0, apiImportChange.pos) + apiImportChange.toAdd + content.substr(apiImportChange.pos);
              }
            }
          });
        } while (apiServiceRes);

        content = content.replace(new RegExp(`(${INJECT_TEMPLATE}\\s*,[^)]*)${INJECT_TEMPLATE}\\s?,?(.*)`, 'm'), '$1$2');

        if (hasBeenTouched) {
          // Add ApiFactoryService import
          const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ES2015, true);
          const importChange = insertImport(sourceFile, filePath, 'ApiFactoryService', '@o3r/application', false);
          if (importChange instanceof InsertChange) {
            content = content.substr(0, importChange.pos) + importChange.toAdd + content.substring(importChange.pos);
          }

          // add ApiManagerModule import in service module
          addApiManagerModuleImport(tree, context, filePath.replace(/\.(service|component)\.ts$/, '.module.ts'));
        }
        if (isMultipleApiService) {
          context.logger.warn(`multiple apiService imported in ${filePath}, a manual action may be required`);
        }
        tree.overwrite(filePath, content);
      });
    return tree;
  };

  /**
   * Update API Service
   *
   * @param item
   */
  const updateApiService = (item: '@o3r/core:service' | '@o3r/core:component') => (tree: Tree, context: SchematicContext) => {
    const itemPath = getDestinationPath(item, null, tree);
    if (!itemPath) {
      return tree;
    }
    const cwd = process.cwd();
    const paths = globbySync(path.join(cwd, itemPath, '**', `*.${item}.ts`).replace(/[\\/]/g, '/'))
      .map((p) => `/${path.relative(cwd, p).replace(/[\\/]/g, '/')}`);
    return replaceApiService(tree, context, paths);
  };

  /**
   * Update API Unit Test in services
   *
   * @param tree
   * @param context
   */
  const updateSpecService = (tree: Tree, context: SchematicContext) => {
    const servicePath = getDestinationPath('@o3r/core:service', null, tree);
    if (!servicePath) {
      return tree;
    }
    const cwd = process.cwd();
    const paths = globbySync(path.join(cwd, servicePath, '**', '*.service.spec.ts').replace(/[\\/]/g, '/'))
      .map((p) => `/${path.relative(cwd, p).replace(/[\\/]/g, '/')}`);

    paths
      .map((filePath) => ({ filePath, content: tree.read(filePath)?.toString() }))
      .filter((value): value is { filePath: string; content: string } => !!value.content)
      .forEach(({ filePath, content }) => {
        const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ES2015, true);
        findNodes(sourceFile, ts.SyntaxKind.CallExpression, undefined, true)
          .reverse()
          .forEach((node) => {
            const testbedContent = node.getFullText(sourceFile);
            const isTestbedWithApiService = testbedContent.startsWith('TestBed.configureTestingModule') && /:\s*\w+ApiService/.test(testbedContent) && !/ApiManagerModule/.test(testbedContent);
            if (isTestbedWithApiService) {
              const idx = content.indexOf('imports', node.pos);
              if (idx >= 0) {
                const idxImport = content.indexOf('[', idx) + 1;
                if (idxImport > 0) {
                  content = content.slice(0, idxImport) + 'ApiManagerModule,' + content.slice(idxImport);
                }
              } else {
                const idxImport = content.indexOf('{', idx) + 1;
                if (idxImport > 0) {
                  content = content.slice(0, idxImport) + 'imports: [ApiManagerModule],' + content.slice(idxImport);
                }
              }
            }
          });

        const listApiServices = content.match(/\b\w*ApiService\b/g)?.filter((service, idx, arr) => arr.slice(idx + 1).indexOf(service) < 0);
        if (!listApiServices) {
          return;
        }
        listApiServices.forEach((service) => content = `import { ${service.replace('ApiService', 'ApiFixture')} } from '@dapi/sdk/fixtures';\n` + content);
        content = `import { API_TOKEN, ApiFactoryService, ApiManager, ApiManagerModule, INITIAL_APIS_TOKEN } from '@o3r/application';\n${content}`;
        content = content.replace(
          /{\s*provide\s*:\s*(\w*)ApiService\s*,\s*useValue\s*:\s*{api:\s*(\w*)\s*}\s*}/g,
          '{provide: INITIAL_APIS_TOKEN, useFactory: () => { return [new $1ApiFixture()]; }}, ApiFactoryService');
        tree.overwrite(filePath, content);
      });

    tree = replaceApiService(tree, context, paths);
  };

  /**
   * Remove APIs Service path configuration from angular.json
   *
   * @param tree
   * @param _context
   */
  const updateAngularJson = (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    if (workspace.schematics) {
      delete workspace.schematics['@otter/ng-tools:api-service'];
    }

    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));

    return tree;
  };

  return chain([
    removeServiceApis,
    updateApiService('@o3r/core:service'),
    updateApiService('@o3r/core:component'),
    updateSpecService,
    updateAngularJson
  ]);
}
