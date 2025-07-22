import {
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createCommentString,
  createRule,
  defaultSupportedInterfaceNames,
  getNodeComment,
  isExtendingConfiguration,
} from '../../utils';

export interface O3rRestrictionKeyTagsRuleOption {
  supportedInterfaceNames?: string[];
  supportedKeys?: string[];
}

type O3rWidgetRuleErrorId =
  | 'notSupportedKey'
  | 'notWrapWithQuotes'
  | 'suggestWrapWithQuotes'
  | 'suggestUseSupportedKey'
  | 'noRestrictionKeyProvided'
  | 'notInConfigurationInterface';

const defaultOptions: [Required<O3rRestrictionKeyTagsRuleOption>] = [{
  supportedInterfaceNames: defaultSupportedInterfaceNames,
  supportedKeys: []
}];

export default createRule<[Readonly<O3rRestrictionKeyTagsRuleOption>, ...any], O3rWidgetRuleErrorId>({
  name: 'o3r-restriction-key-tags',
  meta: {
    hasSuggestions: true,
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Ensures that @o3rRestrictionKey is used with a correct value'
    },
    schema: [
      {
        type: 'object',
        properties: {
          supportedInterfaceNames: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          supportedKeys: {
            type: 'array',
            items: {
              type: 'string'
            },
            minItems: 1
          }
        }
      }
    ],
    messages: {
      notSupportedKey: '{{ actualKey }} is not supported. Supported restriction keys: {{ supportedKeys }}.',
      suggestUseSupportedKey: '{{ actualKey }} is not supported. Replace with {{ supportedKey }}.',
      notWrapWithQuotes: '`{{ actualKey }}` is not wrapped with quotes.',
      suggestWrapWithQuotes: 'Wrap `{{ actualKey }}` with quotes.',
      notInConfigurationInterface: '@o3rRestrictionKey can only be used in a `Configuration` interface.',
      noRestrictionKeyProvided: 'You must have at least one restriction key.'
    }
  },
  defaultOptions,
  create: (context, [options]: Readonly<[O3rRestrictionKeyTagsRuleOption, ...any]>) => {
    const rule = (node: TSESTree.TSPropertySignature) => {
      const { sourceCode } = context;
      const comment = getNodeComment(node, sourceCode);

      if (!comment || comment.value.length === 0) {
        return;
      }

      const { loc, value: docText } = comment;
      const supportedKeys = options.supportedKeys || defaultOptions[0].supportedKeys;
      const supportedKeysSet = new Set(supportedKeys);

      if (supportedKeys.length === 0) {
        return context.report({
          messageId: 'noRestrictionKeyProvided',
          node,
          loc
        });
      }

      const actualKeys = Array.from(docText.matchAll(/@o3rRestrictionKey\s+(.*)/g)).map((match) => match[1]);

      if (actualKeys.length === 0) {
        return;
      }

      const interfaceDeclNode = node.parent?.parent;
      if (!isExtendingConfiguration(interfaceDeclNode, options.supportedInterfaceNames)) {
        return context.report({
          messageId: 'notInConfigurationInterface',
          node,
          loc
        });
      }

      actualKeys.forEach((actualKey) => {
        if (!supportedKeysSet.has(actualKey)) {
          if (
            /((["']).*?\2)/.test(actualKey)
            && supportedKeysSet.has(actualKey.replace(/(^["']|["']$)/g, ''))
          ) {
            return;
          }
          const fix: (key: string) => TSESLint.ReportFixFunction = (key) => (fixer) => {
            return fixer.replaceTextRange(comment.range, createCommentString(comment.value.replace(actualKey, /[^\w]/.test(key) ? `"${key}"` : key)));
          };
          return context.report({
            messageId: 'notSupportedKey',
            node,
            loc,
            data: {
              actualKey,
              supportedKeys: supportedKeys.join(', ')
            },
            suggest: supportedKeys.map((supportedKey) => ({
              messageId: 'suggestUseSupportedKey',
              data: {
                actualKey,
                supportedKey
              },
              fix: fix(supportedKey)
            }))
          });
        }
        if (/[^\w]/.test(actualKey)) {
          const fix: TSESLint.ReportFixFunction = (fixer) => {
            return fixer.replaceTextRange(comment.range, createCommentString(comment.value.replace(actualKey, `"${actualKey}"`)));
          };
          return context.report({
            messageId: 'notWrapWithQuotes',
            data: {
              actualKey
            },
            node,
            loc,
            fix,
            suggest: [{
              messageId: 'suggestWrapWithQuotes',
              data: {
                actualKey
              },
              fix
            }]
          });
        }
      });
    };

    return {
      TSPropertySignature: rule
    };
  }
});
