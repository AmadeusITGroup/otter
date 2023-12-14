import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import * as path from 'node:path';

/** Current package version (format: <major>.<minor>)*/
const version = (require(path.resolve(__dirname, '..', '..', 'package.json')) as {version: string}).version.split('.').slice(0,2).join('.');

/** ESLint rule generator */
// eslint-disable-next-line new-cap
export const createRule = ESLintUtils.RuleCreator((name) => {
  if (version === '0.0') {
    return 'file:' + path.resolve(__dirname, '..', '..', '..', '..', '..', 'docs', 'linter', 'eslint-plugin', 'rules', `${name}.md`);
  }
  return `https://github.com/AmadeusITGroup/otter/tree/release/${version}/docs/linter/eslint-plugin/rules/${name}.md`;
});

/** Default supported interface names */
export const defaultSupportedInterfaceNames = ['Configuration', 'NestedConfiguration'];

/**
 * Returns true if the node extends one of the `supportedInterfaceNames`
 * @param interfaceDeclNode
 * @param supportedInterfaceNames
 */
export const isExtendingConfiguration = (interfaceDeclNode: TSESTree.Node | undefined, supportedInterfaceNames: string[] = []) => {
  const supportedInterfaceNamesSet = new Set(supportedInterfaceNames.length > 0 ? supportedInterfaceNames : defaultSupportedInterfaceNames);
  return interfaceDeclNode?.type === TSESTree.AST_NODE_TYPES.TSInterfaceDeclaration
    && interfaceDeclNode.extends?.some((ext) =>
      ext.type === TSESTree.AST_NODE_TYPES.TSInterfaceHeritage
      && ext.expression.type === TSESTree.AST_NODE_TYPES.Identifier
      && supportedInterfaceNamesSet.has(ext.expression.name)
    );
};

