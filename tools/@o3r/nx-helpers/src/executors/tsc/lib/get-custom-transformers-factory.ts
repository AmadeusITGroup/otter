/**
 * Code copied from https://github.com/nrwl/nx/blob/20.1.x/packages/js/src/executors/tsc/lib/get-custom-transformers-factory.ts
 * Please check original LICENSE https://github.com/nrwl/nx/blob/master/LICENSE
 */
import * as ts from 'typescript';
import { loadTsTransformers } from '@nx/js/src/utils/typescript/load-ts-transformers';
import type { TransformerEntry } from '@nx/js/src/utils/typescript/types';

export function getCustomTrasformersFactory(
  transformers: TransformerEntry[]
): (program: ts.Program) => ts.CustomTransformers {
  const { compilerPluginHooks } = loadTsTransformers(transformers);

  return (program: ts.Program): ts.CustomTransformers => ({
    before: compilerPluginHooks.beforeHooks.map(
      (hook) => hook(program) as any
    ),
    after: compilerPluginHooks.afterHooks.map(
      (hook) => hook(program) as any
    ),
    afterDeclarations: compilerPluginHooks.afterDeclarationsHooks.map(
      (hook) => hook(program) as any
    ),
  });
}
