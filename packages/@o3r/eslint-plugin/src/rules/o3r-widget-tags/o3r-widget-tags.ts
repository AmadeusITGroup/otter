import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule } from '../utils';

const o3rWidgetParameterPattern = '^[a-zA-Z0-9-_:.]+$';

type O3rWidgetParamType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]';

const o3rWidgetParamTypes: O3rWidgetParamType[] = ['string', 'number', 'boolean', 'string[]', 'number[]', 'boolean[]'];


export interface O3rWidgetTagsRuleOption {
  supportedInterfaceNames?: string[];
  widgets: {
    [widgetName: string]: {
      [paramName: string]: {
        type: O3rWidgetParamType;
        required?: boolean;
      };
    };
  };
}

type O3rWidgetRuleErrorId =
  | 'notInConfigurationInterface'
  | 'notSupportedType'
  | 'notSupportedParamForType'
  | 'invalidParamValueType'
  | 'noParamWithoutWidget'
  | 'onlyOneWidgetAllowed'
  | 'duplicatedParam'
  | 'requiredParamMissing'
  | 'suggestParamMissing'
  | 'suggestRemoveDuplicatedO3rWidget'
  | 'suggestRemoveDuplicatedO3rWidgetParam'
  | 'suggestAddO3rWidgetTag'
  | 'suggestReplaceO3rWidgetType';

const createCommentString = (comment: string) => `/*${comment}*/`;

export default createRule<O3rWidgetTagsRuleOption[], O3rWidgetRuleErrorId>({
  name: 'o3r-widget-tags',
  meta: {
    hasSuggestions: true,
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Ensures that @o3rWidget and @o3rWidgetParam are used with correct value',
      recommended: 'error'
    },
    schema: [
      {
        type: 'object',
        required: ['widgets'],
        properties: {
          supportedInterfaceNames: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          widgets: {
            additionalProperties: {
              type: 'object',
              additionalProperties: false,
              patternProperties: {
                [o3rWidgetParameterPattern]: {
                  type: 'object',
                  required: ['type'],
                  properties: {
                    required: {
                      type: 'boolean'
                    },
                    type: {
                      type: 'string',
                      enum: o3rWidgetParamTypes
                    }
                  }
                }
              }
            }
          }
        }
      }
    ],
    messages: {
      notSupportedType: '{{ o3rWidgetType }} is not supported. Supported o3rWidget types: {{ supportedO3rWidgets }}.',
      notSupportedParamForType: '{{ o3rWidgetParam }} is not supported for {{ o3rWidgetType }}. Supported o3rWidgetParam for {{ o3rWidgetType }}: {{ supportedO3rWidgetParam }}.',
      invalidParamValueType: '{{ o3rWidgetParam }} supports only {{ o3rWidgetParamType }}.',
      noParamWithoutWidget: '@o3rWidgetParam cannot be used without @o3rWidget',
      duplicatedParam: '@o3rWidgetParam {{ o3rWidgetParam }} must be defined only once.',
      onlyOneWidgetAllowed: '@o3rWidget must be defined only once.',
      notInConfigurationInterface: '@o3rWidget can only be used in `Configuration` interface.',
      requiredParamMissing: '@o3rWidgetParam {{ o3rWidgetParam }} is mandatory when using @o3rWidget {{ o3rWidgetType }}.',
      suggestParamMissing: 'Add @o3rWidgetParam {{ o3rWidgetParam }}.',
      suggestRemoveDuplicatedO3rWidget: 'Remove the 2nd @o3rWidget.',
      suggestRemoveDuplicatedO3rWidgetParam: 'Remove the 2nd @o3rWidgetParam.',
      suggestAddO3rWidgetTag: 'Add @o3rWidget tag.',
      suggestReplaceO3rWidgetType: 'Replace {{ currentType }} by {{ suggestedType }}.'
    }
  },
  defaultOptions: [],
  create: (context) => {
    const options: Required<O3rWidgetTagsRuleOption> = context.options
      .reduce((acc: Required<O3rWidgetTagsRuleOption>, option) => {
        acc.supportedInterfaceNames = (acc.supportedInterfaceNames || []).concat(option.supportedInterfaceNames || []);
        acc.widgets = {
          ...acc.widgets,
          ...option.widgets
        };
        return acc;
      }, { widgets: {}, supportedInterfaceNames: ['Configuration', 'NestedConfiguration'] });
    const supportedO3rWidgets = new Set(Object.keys(options.widgets));
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      TSPropertySignature: (node) => {
        const sourceCode = context.getSourceCode();
        const [comment] = sourceCode.getCommentsBefore(node);

        if (!comment || !comment.value.length) {
          return;
        }

        const { loc, value: docText } = comment;
        const widgetTypes = Array.from(docText.matchAll(/@o3rWidget (.*)/g));

        if (widgetTypes.length > 1) {
          const fix: TSESLint.ReportFixFunction = (fixer) => {
            return fixer.replaceTextRange(comment.range, createCommentString(comment.value.replace(/(.*(@o3rWidget ).*(\n.*)*)(\n.*)\2.*/, '$1')));
          };
          return context.report({
            messageId: 'onlyOneWidgetAllowed',
            node,
            loc,
            fix,
            suggest: [{
              messageId: 'suggestRemoveDuplicatedO3rWidget',
              fix
            }]
          });
        }
        const widgetType = widgetTypes[0]?.[1].trim();
        const widgetParameterTexts = Array.from(docText.matchAll(/@o3rWidgetParam (.*)/g))
          .map((match) => match[1].trim());

        if (!widgetType) {
          if (widgetParameterTexts.length) {
            const fix: TSESLint.ReportFixFunction = (fixer) => {
              return fixer.replaceTextRange(
                comment.range,
                createCommentString(comment.value.replace(/((.*)@o3rWidgetParam .*)/, '$2@o3rWidget widgetType\n$1'))
              );
            };
            return context.report({
              messageId: 'noParamWithoutWidget',
              node,
              loc,
              fix,
              suggest: [{
                messageId: 'suggestAddO3rWidgetTag',
                fix
              }]
            });
          }
          return;
        }

        const interfaceDeclNode = node.parent?.parent;
        if (
          interfaceDeclNode?.type !== TSESTree.AST_NODE_TYPES.TSInterfaceDeclaration
          || !interfaceDeclNode.extends?.some((ext) =>
            ext.type === TSESTree.AST_NODE_TYPES.TSInterfaceHeritage
            && ext.expression.type === TSESTree.AST_NODE_TYPES.Identifier
            && options.supportedInterfaceNames.includes(ext.expression.name)
          )
        ) {
          return context.report({
            messageId: 'notInConfigurationInterface',
            node,
            loc
          });
        }

        if (!supportedO3rWidgets.has(widgetType)) {
          return context.report({
            messageId: 'notSupportedType',
            node,
            loc,
            data: {
              o3rWidgetType: widgetType,
              supportedO3rWidgets: Array.from(supportedO3rWidgets).join(', ')
            },
            suggest: Array.from(supportedO3rWidgets).map((suggestedWidget) => ({
              messageId: 'suggestReplaceO3rWidgetType',
              data: {
                currentType: widgetType,
                suggestedType: suggestedWidget
              },
              fix: (fixer) => {
                return fixer.replaceTextRange(
                  comment.range,
                  createCommentString(comment.value.replace(`@o3rWidget ${widgetType}`, `@o3rWidget ${suggestedWidget}`))
                );
              }
            }))
          });
        }

        const widgetParameters = widgetParameterTexts.map((text) => {
          const [name, ...values] = text.split(' ');
          return {
            name,
            textValue: values.join(' ')
          };
        });
        const widgetParameterNames = widgetParameters.map(({ name }) => name);
        const supportedO3rWidgetParam = new Set(Object.keys(options.widgets[widgetType]));
        const checkedParam = new Set();

        for (const widgetParameterName of widgetParameterNames) {
          if (checkedParam.has(widgetParameterName)) {
            const fix: TSESLint.ReportFixFunction = (fixer) => {
              return fixer.replaceTextRange(
                comment.range,
                createCommentString(comment.value.replace(/(.*(@o3rWidgetParam ).*(\n.*)*)(\n.*)\2.*/m, '$1'))
              );
            };
            return context.report({
              messageId: 'duplicatedParam',
              node,
              loc,
              data: {
                o3rWidgetParam: widgetParameterName
              },
              fix,
              suggest: [{
                messageId: 'suggestRemoveDuplicatedO3rWidget',
                fix
              }]
            });
          }
          if (!supportedO3rWidgetParam.has(widgetParameterName)) {
            return context.report({
              messageId: 'notSupportedParamForType',
              node,
              loc,
              data: {
                o3rWidgetParam: widgetParameterName,
                o3rWidgetType: widgetType,
                supportedO3rWidgetParam: Array.from(supportedO3rWidgetParam).join(', ')
              },
              suggest: Array.from(supportedO3rWidgetParam).map((suggestedParam) => ({
                messageId: 'suggestReplaceO3rWidgetType',
                data: {
                  currentType: widgetType,
                  suggestedType: suggestedParam
                },
                fix: (fixer) => {
                  return fixer.replaceTextRange(
                    comment.range,
                    createCommentString(comment.value.replace(`@o3rWidgetParam ${widgetType}`, `@o3rWidgetParam ${suggestedParam}`))
                  );
                }
              }))
            });
          }
          checkedParam.add(widgetParameterName);
        }

        const firstRequiredParam = Object.entries(options.widgets[widgetType]).find(([param, { required }]) => required && !checkedParam.has(param));
        if (firstRequiredParam) {
          const [firstRequiredParamName] = firstRequiredParam;
          const fix: TSESLint.ReportFixFunction = (fixer) => {
            return fixer.replaceTextRange(
              comment.range,
              createCommentString(comment.value.replace(/((.*)@o3rWidget (.*))/, `$1\n$2@o3rWidgetParam ${firstRequiredParamName} value`))
            );
          };
          return context.report({
            messageId: 'requiredParamMissing',
            node,
            loc,
            data: {
              o3rWidgetParam: firstRequiredParamName,
              o3rWidgetType: widgetType
            },
            fix,
            suggest: [{
              messageId: 'suggestParamMissing',
              data: {
                o3rWidgetParam: firstRequiredParamName
              },
              fix
            }]
          });
        }

        for (const widgetParameter of widgetParameters) {
          const { name, textValue } = widgetParameter;
          const supportedTypeForParam = options.widgets[widgetType][name];

          try {
            const value = JSON.parse(textValue);
            if (supportedTypeForParam.type.endsWith('[]')) {
              if (Array.isArray(value) && value.every((element) => typeof element === supportedTypeForParam.type.substring(0, -2))) {
                continue;
              }
            } else if (typeof value === supportedTypeForParam.type) {
              continue;
            }
          } catch {}

          return context.report({
            messageId: 'invalidParamValueType',
            node,
            loc,
            data: {
              o3rWidgetParam: name,
              o3rWidgetParamType: supportedTypeForParam.type
            }
          });
        }
      }
    };
  }
});
