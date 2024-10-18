import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';

/** Current package version (format: <major>.<minor>)*/
const version = (JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf-8' })) as PackageJson).version?.split('.').slice(0,2).join('.') || '0.0';

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
export const isExtendingConfiguration = (interfaceDeclNode: TSESTree.Node | undefined, supportedInterfaceNames: string[] = []): interfaceDeclNode is TSESTree.Node => {
  const supportedInterfaceNamesSet = new Set(supportedInterfaceNames.length > 0 ? supportedInterfaceNames : defaultSupportedInterfaceNames);
  return interfaceDeclNode?.type === TSESTree.AST_NODE_TYPES.TSInterfaceDeclaration
    && !!interfaceDeclNode.extends?.some((ext) =>
      ext.type === TSESTree.AST_NODE_TYPES.TSInterfaceHeritage
      && ext.expression.type === TSESTree.AST_NODE_TYPES.Identifier
      && supportedInterfaceNamesSet.has(ext.expression.name)
    );
};

/**
 * Returns the comment above the node
 * @param node
 * @param sourceCode
 */
export const getNodeComment = (node: TSESTree.Node, sourceCode: TSESLint.SourceCode): TSESTree.Comment | undefined => {
  const [comment] = node.parent?.type === TSESTree.AST_NODE_TYPES.ExportNamedDeclaration
    ? sourceCode.getCommentsBefore(node.parent)
    : sourceCode.getCommentsBefore(node);
  return comment;
};

/**
 * Wraps `commentValue` into a comment
 * @param commentValue
 */
export const createCommentString = (commentValue: string) => `/*${ commentValue.replace(/\*\//g, '*\\/') }*/`;
