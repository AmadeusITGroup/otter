import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule, defaultSupportedInterfaceNames, isExtendingConfiguration } from '../../utils';

const separatorRegExp = /\s*[|&]\s*/;

export interface NoMultipleTypeConfigurationPropertyOption {
  supportedInterfaceNames?: string[];
}

export default createRule<NoMultipleTypeConfigurationPropertyOption[], 'error' | 'suggestion'>({
  name: 'no-multiple-type-configuration-property',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Ensures that the configuration property does not accept multiple types.',
      recommended: 'error'
    },
    schema: [
      {
        type: 'object',
        properties: {
          supportedInterfaceNames: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: defaultSupportedInterfaceNames
          }
        }
      }
    ],
    messages: {
      error: 'Configuration cannot be the union of multiple type',
      suggestion: 'Replace {{currentValue}} by {{recommendedValue}}'
    }
  },
  defaultOptions: [],
  create: (context) => {
    const supportedInterfaceNames = context.options.reduce((acc: string[], option) => acc.concat(option.supportedInterfaceNames || []), []);
    const sourceCode = context.getSourceCode();

    const rule = (node: TSESTree.TSUnionType | TSESTree.TSIntersectionType) => {
      const interfaceDeclNode = node.parent?.parent?.parent?.parent;
      if (!isExtendingConfiguration(interfaceDeclNode, supportedInterfaceNames)) {
        return; // Not in a configuration interface
      }

      if (
        node.types.every((type) => type.type === TSESTree.AST_NODE_TYPES.TSLiteralType && type.literal.type === TSESTree.AST_NODE_TYPES.Literal)
        && [...(new Set((node.types as TSESTree.TSLiteralType[]).map((literalType) => typeof (literalType.literal as TSESTree.Literal).value)))].length === 1
      ) {
        return; // Only the same literal type
      }

      const text = sourceCode.getText(node);
      context.report({
        messageId: 'error',
        node,
        loc: node.loc,
        suggest: text.split(separatorRegExp).map((type) => ({
          messageId: 'suggestion',
          data: {
            currentValue: text,
            recommendedValue: type
          },
          fix: (fixer) => fixer.replaceTextRange(node.range, type)
        }))
      });
    };

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      TSUnionType: rule,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      TSIntersectionType: rule
    };
  }
});
