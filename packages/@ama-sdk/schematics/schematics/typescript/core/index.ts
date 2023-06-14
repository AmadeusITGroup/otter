import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import type { Operation, PathObject } from '@ama-sdk/core';
import { existsSync, promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as sway from 'sway';
import { executeSwaggerJarsRuleFactory } from '../../helpers/execute-jars';
import { treeGlob } from '../../helpers/tree-glob';
import { NgGenerateTypescriptSDKCoreSchematicsSchema } from './schema';

const getRegexpTemplate = (regexp: RegExp) => `new RegExp('${regexp.toString().replace(/\/(.*)\//, '$1').replace(/\\\//g, '/')}')`;

const getPathObjectTemplate = (pathObj: PathObject) => {
  return `{
      ${
  Object.keys(pathObj).map((propName) => {
    const value = (propName as keyof PathObject) === 'regexp' ? getRegexpTemplate(pathObj[propName]) : JSON.stringify(pathObj[propName]);
    return `${propName}: ${value}`;
  }).join(',')
}
    }`;
};

/** Base path where to find codegen jars */
const jarBasePath = path.resolve(__dirname, 'swagger-codegen-typescript', 'target');

/**
 * Generate a typescript SDK source code base on swagger specification
 *
 * @param options
 */
export function ngGenerateTypescriptSDK(options: NgGenerateTypescriptSDKCoreSchematicsSchema): Rule {

  const specPath = path.resolve(process.cwd(), options.swaggerSpecPath);

  const generateOperationFinder = async (): Promise<PathObject[]> => {
    const swayOptions = {
      definition: path.resolve(options.swaggerSpecPath)
    };
    const swayApi = await sway.create(swayOptions);
    const extraction = swayApi.getPaths().map((obj) => ({
      path: `${obj.path as string}`,
      regexp: obj.regexp as RegExp,
      operations: obj.getOperations().map((op: any) => {
        const operation: Operation = {
          method: `${op.method as string}`,
          operationId: `${op.operationId as string}`
        };
        return operation;
      }) as Operation[]
    }));
    return extraction || [];
  };

  /**
   * rule to clear previous SDK generation
   *
   * @param tree
   * @param _context
   */
  const clearGeneratedCode = (tree: Tree, _context: SchematicContext) => {
    treeGlob(tree, path.posix.join('src', 'api', '**', '*.ts')).forEach((file) => tree.delete(file));
    treeGlob(tree, path.posix.join('src', 'api', '**', '*.ts')).forEach((file) => tree.delete(file));
    treeGlob(tree, path.posix.join('src', 'models', 'base', '**', '!(index).ts')).forEach((file) => tree.delete(file));
    treeGlob(tree, path.posix.join('src', 'spec', '!(operation-adapter|index).ts')).forEach((file) => tree.delete(file));
    return tree;
  };

  /**
   * rule to update readme and generate mandatory code source
   */
  const generateSource = async () => {
    if (!existsSync(specPath)) {
      throw new Error(`${specPath} does not exists`);
    }

    const pathObjects = await generateOperationFinder();
    const swayOperationAdapter = `[${pathObjects.map((pathObj) => getPathObjectTemplate(pathObj)).join(',')}]`;

    return mergeWith(apply(url('./templates'), [
      template({
        ...options,
        swayOperationAdapter,
        empty: ''
      }),
      move('/'),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);
  };

  /**
   * Update local swagger spec file
   *
   * @param tree
   * @param _context
   */
  const updateSpec = async (tree: Tree, _context: SchematicContext) => {
    const specContent = await fs.readFile(specPath, {encoding: 'utf8'});
    if (tree.exists('/readme.md')) {
      const swaggerVersion = /version: ([0-9]+\.[0-9]+\.[0-9]+)/.exec(specContent);

      if (swaggerVersion) {
        const readmeContent = tree.read('/readme.md')!.toString('utf8');
        tree.overwrite('/readme.md', readmeContent.replace(/Based on Swagger spec .*/i, `Based on Swagger spec ${swaggerVersion[1]}`));
      }
    }

    if (tree.exists('/swagger-spec.yaml')) {
      tree.overwrite('/swagger-spec.yaml', specContent);
    } else {
      tree.create('/swagger-spec.yaml', specContent);
    }
    return () => tree;
  };

  return chain([
    clearGeneratedCode,
    generateSource,
    updateSpec,
    executeSwaggerJarsRuleFactory(jarBasePath, specPath, 'typescriptFetch')
  ]);
}
