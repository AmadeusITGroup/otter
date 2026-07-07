import type {
  AST,
} from 'jsonc-eslint-parser';
import {
  createRule,
} from '../../utils';

/**
 * Options for the linter rules @o3r/project-json-tags
 */
export interface ProjectJsonTagsOptions {
  /**
   * Allowed tags in project.json files
   */
  allowedTags: string[];
}

const defaultOptions: [Required<ProjectJsonTagsOptions>] = [{
  allowedTags: []
}];

export default createRule<[ProjectJsonTagsOptions, ...any], 'unsupportedTag' | 'invalidTag' | 'tagsNotArray'>({
  name: 'project-json-tags',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure tags in project.json contain only allowed values'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedTags: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      tagsNotArray: '"tags" should be an array',
      unsupportedTag: 'Unsupported tag type "{{tagType}}". Only string is supported',
      invalidTag: 'Invalid tag "{{tag}}". Allowed tags are: {{allowedTags}}'
    }
  },
  defaultOptions,
  create: (context, [options]: Readonly<[ProjectJsonTagsOptions, ...any]>) => {
    const allowedTags = new Set(options.allowedTags ?? []);
    const rule = (node: AST.JSONProperty) => {
      if (node.key.type !== 'JSONLiteral' || node.key?.value !== 'tags') {
        return;
      }
      if (node.value.type === 'JSONArrayExpression') {
        for (const element of node.value.elements) {
          if (!!element && element.type === 'JSONLiteral' && typeof element.value === 'string') {
            if (!allowedTags.has(element.value)) {
              context.report({
                loc: element.loc,
                messageId: 'invalidTag',
                data: {
                  tag: element.value,
                  allowedTags: Array.from(allowedTags.values()).join(', ')
                }
              });
            }
          } else {
            const tagType = element?.type === 'JSONLiteral' ? typeof element.value : (element?.type ?? 'unknown');
            context.report({
              loc: element?.loc || node.value.loc,
              messageId: 'unsupportedTag',
              data: {
                tagType
              }
            });
          }
        }
      } else {
        context.report({
          loc: node.loc,
          messageId: 'tagsNotArray'
        });
      }
    };
    return {
      JSONProperty: rule
    };
  }
});
