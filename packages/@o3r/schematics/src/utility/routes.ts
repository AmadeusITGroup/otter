import type {
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';

/**
 * Route definition.
 */
export interface Route {
  /** Path of the route. */
  path: string;

  /** Import path of the module to load. */
  import: string;

  /** Name of the module to load. */
  module: string;
}

/**
 * Indicates if the given Route expression has the given path.
 * @param route Route expression
 * @param path Path to test
 */
function hasRoutePath(route: ts.ObjectLiteralExpression, path: string): boolean {
  return route.properties.some((property) =>
    property.kind === ts.SyntaxKind.PropertyAssignment
    && (property.name as ts.Identifier).text === 'path'
    && (property.initializer as ts.Identifier).text === path
  );
}

/**
 * Indicates if the given variable declaration is a Routes declaration.
 * @param declaration Declaration to test
 */
function isRoutesDeclaration(declaration: ts.VariableDeclaration): boolean {
  if (declaration.type) {
    if (declaration.type.kind === ts.SyntaxKind.TypeReference) {
      return (declaration.type as ts.TypeReferenceNode).typeName.getText() === 'Routes';
    }

    if (declaration.type.kind === ts.SyntaxKind.ArrayType) {
      return ((declaration.type as ts.ArrayTypeNode).elementType as ts.TypeReferenceNode).typeName.getText() === 'Routes';
    }
  }

  return false;
}

/**
 * Get the Routes variable declaration from the given App Routing Module path.
 * @param tree File tree
 * @param context Context of the rule
 * @param appRoutingModulePath Path of the App Routing Module
 */
export function getRoutesDeclaration(tree: Tree, context: SchematicContext, appRoutingModulePath: string): ts.VariableDeclaration | null {
  const buffer = tree.read(appRoutingModulePath);

  if (!buffer) {
    context.logger.error(`Cannot read ${appRoutingModulePath}`);
    return null;
  }

  const sourceFile = ts.createSourceFile(
    appRoutingModulePath,
    buffer.toString(),
    ts.ScriptTarget.ES2015,
    true
  );

  return sourceFile.statements
    .filter((statement) => statement.kind === ts.SyntaxKind.VariableStatement)
    .map((statement) => (statement as ts.VariableStatement).declarationList.declarations)
    .map((declarations) => declarations.filter((route) => isRoutesDeclaration(route)))
    .reduce((declaration, declarations) =>
      declarations.length > 0 ? declarations[0] : declaration,
    null as ts.VariableDeclaration | null
    );
}

/**
 * Gets the Routes Node array of the App Routing Module of the given path.
 * @param tree File tree
 * @param context Context of the rule
 * @param appRoutingModulePath
 */
export function getRoutesNodeArray(tree: Tree, context: SchematicContext, appRoutingModulePath: string): ts.NodeArray<ts.ObjectLiteralExpression> | null {
  const routesDeclaration = getRoutesDeclaration(tree, context, appRoutingModulePath);

  if (!routesDeclaration) {
    context.logger.error('No Routes declaration found');
    return null;
  }

  const rootElements = (routesDeclaration.initializer as ts.ArrayLiteralExpression).elements as ts.NodeArray<ts.ObjectLiteralExpression>;

  const emptyRoute = rootElements.find((route) => hasRoutePath(route, ''));
  if (emptyRoute) {
    const childrenNode = emptyRoute.properties
      .filter((property) => property.kind === ts.SyntaxKind.PropertyAssignment)
      .filter((property) => (property.name as ts.Identifier).text === 'children')
      .map((property) => property.initializer as ts.ArrayLiteralExpression);

    if (childrenNode[0]) {
      return childrenNode[0].elements as ts.NodeArray<ts.ObjectLiteralExpression>;
    }
  }

  return rootElements;
}

/**
 * Inserts a route in the App Routing Module of the given path.
 * @param tree File tree
 * @param context Context of the rule
 * @param appRoutingModulePath Path of the App Routing Module
 * @param route The Route to insert
 * @param standalone Whether the page component is standalone
 */
export function insertRoute(tree: Tree, context: SchematicContext, appRoutingModulePath: string, route: Route, standalone = false) {
  const routes = getRoutesNodeArray(tree, context, appRoutingModulePath);

  if (routes) {
    const noStarRoutes = routes.filter((r) => !hasRoutePath(r, '**'));
    const index = noStarRoutes.length > 0 ? noStarRoutes.at(-1)!.end : routes.end;
    const routeString = `{path: '${route.path}', load${standalone ? 'Component' : 'Children'}: () => import('${route.import}').then((m) => m.${route.module})}`;
    const content = noStarRoutes.length > 0 ? `,\n${routeString}` : routeString;

    const recorder = tree.beginUpdate(appRoutingModulePath);
    recorder.insertLeft(index, content);
    tree.commitUpdate(recorder);
  }

  return tree;
}
