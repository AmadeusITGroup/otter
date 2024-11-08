import type {
  TSESTree,
} from '@typescript-eslint/utils';
import {
  createCommentString,
  createRule,
  defaultSupportedInterfaceNames,
  getNodeComment,
  isExtendingConfiguration,
} from '../../utils';

export interface O3rCategoriesTagsRuleOption {
  supportedInterfaceNames?: string[];
  globalConfigCategories?: string[];
}

type Messages =
  | 'alreadyDefined'
  | 'undefinedCategory'
  | 'onlyOneCategoryAllowed'
  | 'notInConfigurationInterface'
  | 'suggestReplaceO3rCategory';

export default createRule<Readonly<[O3rCategoriesTagsRuleOption, ...any]>, Messages>({
  name: 'o3r-categories-tags',
  meta: {
    hasSuggestions: true,
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Ensures that @o3rCategories and @o3rCategory are used with a correct value'
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
          },
          globalConfigCategories: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: []
          }
        }
      }
    ],
    messages: {
      alreadyDefined: '{{ currentCategory }} is already defined globally.',
      undefinedCategory: '{{ currentCategory }} is not supported. Supported @o3rCategory: {{ supportedCategories }}.',
      onlyOneCategoryAllowed: '@o3rCategory must be defined only once.',
      notInConfigurationInterface: '@o3rCategory and @o3rCategories can only be used in `Configuration` interface.',
      suggestReplaceO3rCategory: 'Replace {{ currentCategory }} by {{ suggestedCategory }}.'
    }
  },
  defaultOptions: [{
    supportedInterfaceNames: defaultSupportedInterfaceNames,
    globalConfigCategories: []
  }],
  create: (context, [options]: Readonly<[O3rCategoriesTagsRuleOption, ...any]>) => {
    const globalConfigCategories = new Set(options.globalConfigCategories);

    const ruleForProperties = (node: TSESTree.TSPropertySignature) => {
      const { sourceCode } = context;
      const comment = getNodeComment(node, sourceCode);

      if (!comment || comment.value.length === 0) {
        return;
      }

      const { loc, value: docText } = comment;
      const categories = Array.from(docText.matchAll(/@o3rCategory (\w+)/g)).map((match) => match[1]);

      if (categories.length === 0) {
        return;
      } else if (categories.length > 1) {
        return context.report({
          messageId: 'onlyOneCategoryAllowed',
          node,
          loc
        });
      }

      const category = categories[0];

      const interfaceDeclNode = node.parent?.parent;
      if (!isExtendingConfiguration(interfaceDeclNode, options.supportedInterfaceNames)) {
        return context.report({
          messageId: 'notInConfigurationInterface',
          node,
          loc
        });
      }

      const interfaceComment = getNodeComment(interfaceDeclNode, sourceCode);
      const supportedO3rCategories = new Set<string>(options.globalConfigCategories);
      Array.from(
        interfaceComment?.value.matchAll(/@o3rCategories (\w+)/g) || []
      ).forEach((match) => supportedO3rCategories.add(match[1]));

      if (!supportedO3rCategories.has(category)) {
        return context.report({
          messageId: 'undefinedCategory',
          node,
          loc,
          data: {
            currentCategory: category,
            supportedCategories: Array.from(supportedO3rCategories).join(', ')
          },
          suggest: Array.from(supportedO3rCategories).map((suggestedCategory) => ({
            messageId: 'suggestReplaceO3rCategory',
            data: {
              currentCategory: category,
              suggestedCategory
            },
            fix: (fixer) => {
              return fixer.replaceTextRange(
                comment.range,
                createCommentString(comment.value.replace(`@o3rCategory ${category}`, `@o3rCategory ${suggestedCategory}`))
              );
            }
          }))
        });
      }
    };

    const ruleForInterface = (node: TSESTree.TSInterfaceDeclaration) => {
      const { sourceCode } = context;
      const comment = getNodeComment(node, sourceCode);

      if (!comment || comment.value.length === 0) {
        return;
      }

      const { loc, value: docText } = comment;
      const categories = Array.from(docText.matchAll(/@o3rCategories (\w+)/g)).map((match) => match[1]);
      if (categories.length === 0) {
        return;
      }
      if (!isExtendingConfiguration(node, options.supportedInterfaceNames)) {
        return context.report({
          messageId: 'notInConfigurationInterface',
          node,
          loc
        });
      }
      const alreadyDefined = categories.find((category) => globalConfigCategories.has(category));
      if (alreadyDefined) {
        return context.report({
          messageId: 'alreadyDefined',
          fix: (fixer) => fixer.replaceTextRange(comment.range, createCommentString(comment.value.replace(new RegExp(`.*@o3rCategories ${alreadyDefined}.*\n`), ''))),
          data: {
            currentCategory: alreadyDefined
          },
          node,
          loc
        });
      }
    };

    return {
      TSPropertySignature: ruleForProperties,
      TSInterfaceDeclaration: ruleForInterface
    };
  }
});
