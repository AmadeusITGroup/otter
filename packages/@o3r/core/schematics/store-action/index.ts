import { strings } from '@angular-devkit/core';
import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { applyEsLintFix, createSchematicWithMetricsIfInstalled, findLastNodeOfKind, getDestinationPath } from '@o3r/schematics';
import * as path from 'node:path';
import * as ts from 'typescript';
import { NgGenerateStoreActionSchematicsSchema } from './schema';

/**
 * Add an Action to an Otter Store
 * @param options
 */
function ngGenerateStoreActionFn(options: NgGenerateStoreActionSchematicsSchema): Rule {

  /**
   * Compute action name based on action type and given name
   *
   * @param aType
   * @param aName
   */
  const computeActionName = (aType: string, aName: string) => {
    const names = aType.split('-');
    return `${names[0]}-${aName}` + (names[1] ? `-${names[1]}` : '');
  };

  /**
   * Edit .actions.ts file
   *
   * @param actionFilePath
   * @param tree
   * @param context
   */
  const editActionFile = (actionFilePath: string, tree: Tree, context: SchematicContext) => {
    const actionType = options.actionType.replace('-custom-', '');
    const name = (actionType ? computeActionName(actionType, options.actionName) : options.actionName) + (options.isCallAction ? '-from-api' : '');
    const actionName = strings.camelize(name);
    // const actionClassName = strings.capitalize(actionName);
    const description = options.description ? strings.capitalize(options.description) : '';
    const storeName = strings.camelize(options.storeName);
    const labelName = `ACTION_${strings.underscore(name).toUpperCase()}`;
    const actionId = `[${strings.capitalize(storeName)}] ${strings.underscore(name).replace(/_/g, ' ')}`;

    let actionDefinitionTemplate = '';
    let payloadType = '';
    switch (options.actionType) {
      case 'set':
        actionDefinitionTemplate = `export const ${actionName} = createAction(${labelName}, props<object /* TODO: Define type */>());`;
        break;
      case 'set-entities':
        payloadType = `Set${options.isCallAction ? 'AsyncStoreItem' : ''}EntitiesActionPayload`;
        actionDefinitionTemplate = `export const ${actionName}  = createAction(${labelName}, props<${payloadType}<object /* TODO: Define type */>>());`;
        break;
      case 'upsert-entities':
        payloadType = `Set${options.isCallAction ? 'AsyncStoreItem' : ''}EntitiesActionPayload`;
        actionDefinitionTemplate = `export const ${actionName} = createAction(${labelName}, props<${payloadType}<object /* TODO: Define type */>>());`;
        break;
      case 'update':
        actionDefinitionTemplate = `export const ${actionName} = createAction(${labelName}, props<Partial<object /* TODO: Define type */>>());`;
        break;
      case 'update-entities':
        payloadType = `Update${options.isCallAction ? 'AsyncStoreItem' : ''}EntitiesActionPayload`;
        actionDefinitionTemplate = `export const ${actionName} = createAction(${labelName}, props<${payloadType}<object /* TODO: Define type */>>());`;
        break;
      case 'clear':
        actionDefinitionTemplate = `export const ${actionName} = createAction(${labelName});`;
        break;
      case 'fail':
        actionDefinitionTemplate = `export const ${actionName} = createAction(${labelName}, props<{error: any}>());`;
        break;
      default:
        actionDefinitionTemplate = `export const ${actionName} = createAction(${labelName}, props<object /* TODO: Define type */>());`;
    }

    const labelTemplate = `const ${labelName} = '${actionId}';`;

    const actionTemplate = `
${labelTemplate}

/**
 * ${description}
 */
${actionDefinitionTemplate}`;

    const sourceFile = ts.createSourceFile(
      actionFilePath,
      tree.read(actionFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    const lastImport = findLastNodeOfKind<ts.ImportDeclaration>(sourceFile, ts.SyntaxKind.ImportDeclaration) || sourceFile.getFirstToken();

    if (!lastImport) {
      context.logger.warn(`Action can not be added in ${actionFilePath}`);
      return;
    }

    const recorder = tree.beginUpdate(actionFilePath);

    let actionDeclarationNode: ts.VariableStatement | undefined;

    const regExpDeclaration = new RegExp('const ACTION_.*=');
    sourceFile.forEachChild((node) => {
      if (ts.isVariableStatement(node) && regExpDeclaration.test(node.getText())) {
        actionDeclarationNode = node;
      }
    });

    if (actionDeclarationNode) {
      recorder.insertRight(actionDeclarationNode.end, actionTemplate);
      context.logger.info(`Your new action has been inserted in ${actionFilePath}`);
    } else {
      context.logger.warn(`available action list can not be found in ${actionFilePath}. Inserting the action after last import.`);
      recorder.insertRight(lastImport.end, actionTemplate);
    }
    tree.commitUpdate(recorder);
  };

  /**
   * Edit .reducer.ts file
   *
   * @param reducerFilePath
   * @param tree
   * @param context
   */
  const editReducerFile = (reducerFilePath: string, tree: Tree, context: SchematicContext) => {

    const actionType = options.actionType.replace('-custom-', '');
    const name = (actionType ? computeActionName(actionType, options.actionName) : options.actionName) + (options.isCallAction ? '-from-api' : '');
    const actionName = strings.camelize(name);

    const reducerTemplate = `  on(actions.${actionName}, (state, _payload) => /* TODO: implement reducer action */ state),`;

    const sourceFile = ts.createSourceFile(
      reducerFilePath,
      tree.read(reducerFilePath)!.toString(),
      ts.ScriptTarget.ES2015,
      true
    );

    let reducerList;
    const regExpDeclaration = new RegExp(': ReducerTypes<.*>\\[\\] =');
    sourceFile.forEachChild((node) => {
      if (ts.isVariableStatement(node) && regExpDeclaration.test(node.getText())) {
        reducerList = node;
      }
    });

    if (!reducerList) {
      context.logger.error('invalid reducer file: Reducer list missing');
      return;
    }
    const lastReducerItem = findLastNodeOfKind<ts.CallExpression>(sourceFile, ts.SyntaxKind.CallExpression, reducerList);
    if (!lastReducerItem) {
      context.logger.error('invalid reducer file: Empty reducer list');
      return;
    }
    const recorder = tree.beginUpdate(reducerFilePath);
    recorder.insertLeft(lastReducerItem.end, ',\n\n' + reducerTemplate);

    tree.commitUpdate(recorder);
  };

  /**
   * Create a new action in an existing store
   *
   * @param tree
   * @param context
   */
  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const destination = getDestinationPath('@o3r/core:store', options.storeDirectory, tree, options.projectName);

    const storeName = strings.dasherize(options.storeName);
    const storeFolder = path.join(destination, storeName);
    const actionFilePath = path.join(storeFolder, `${storeName}.actions.ts`);
    const reducerFilePath = path.join(storeFolder, `${storeName}.reducer.ts`);

    if (!tree.exists(actionFilePath) || !tree.exists(reducerFilePath)) {
      context.logger.error(`The store ${storeName} is not found in ${destination}`);
      return tree;
    }

    editActionFile(actionFilePath, tree, context);
    editReducerFile(reducerFilePath, tree, context);

    return tree;
  };

  return chain([
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * Add an Action to an Otter Store
 * @param options
 */
export const ngGenerateStoreAction = createSchematicWithMetricsIfInstalled(ngGenerateStoreActionFn);
