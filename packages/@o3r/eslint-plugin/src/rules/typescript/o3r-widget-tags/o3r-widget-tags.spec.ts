import {
  RuleTester
} from '@typescript-eslint/rule-tester';
import o3rWidgetTagsRule, {
  O3rWidgetTagsRuleOption
} from './o3r-widget-tags';

const ruleTester = new RuleTester();

const code = `
export interface Config extends Configuration {
  /**
   * @o3rWidget supportedType
   * @o3rWidgetParam supportedParam "valid value"
   */
  prop: string;
}
`.trim();

const options: Readonly<[O3rWidgetTagsRuleOption]> = [{
  widgets: {
    supportedType: {
      supportedParam: {
        type: 'string'
      }
    },
    widgetWithRequiredParam: {
      requiredParam: {
        type: 'number',
        required: true
      }
    }
  }
}];

ruleTester.run('o3r-widget-tags', o3rWidgetTagsRule, {
  valid: [{ code, options }
  ],
  invalid: [
    {
      code: code.replace(/(.*@o3rWidget .*)/, '$1\n$1'),
      output: code,
      options,
      errors: [
        {
          messageId: 'onlyOneWidgetAllowed',
          suggestions: [
            {
              messageId: 'suggestRemoveDuplicatedO3rWidget',
              output: code
            }
          ]
        }
      ]
    },
    {
      code: code.replace(/(.*@o3rWidgetParam .*)/, '$1\n$1'),
      output: code,
      options,
      errors: [
        {
          messageId: 'duplicatedParam',
          data: {
            o3rWidgetParam: 'supportedParam'
          },
          suggestions: [
            {
              messageId: 'suggestRemoveDuplicatedO3rWidgetParam',
              output: code
            }
          ]
        }
      ]
    },
    {
      code: code.replace('@o3rWidget', ''),
      output: code.replace('@o3rWidget', '').replace(/((.*)@o3rWidgetParam .*)/, '$2@o3rWidget widgetType\n$1'),
      options,
      errors: [
        {
          messageId: 'noParamWithoutWidget',
          suggestions: [
            {
              messageId: 'suggestAddO3rWidgetTag',
              output: code.replace('@o3rWidget', '').replace(/((.*)@o3rWidgetParam .*)/, '$2@o3rWidget widgetType\n$1'),
            }
          ]
        }
      ]
    },
    {
      code: code.replace('supportedType', 'unsupportedType'),
      options,
      errors: [
        {
          messageId: 'notSupportedType',
          data: {
            o3rWidgetType: 'unsupportedType',
            supportedO3rWidgets: 'supportedType, widgetWithRequiredParam'
          },
          suggestions: [
            {
              messageId: 'suggestReplaceO3rWidgetType',
              data: {
                currentType: 'unsupportedType',
                suggestedType: 'supportedType'
              },
              output: code
            },
            {
              messageId: 'suggestReplaceO3rWidgetType',
              data: {
                currentType: 'unsupportedType',
                suggestedType: 'widgetWithRequiredParam'
              },
              output: code.replace('supportedType', 'widgetWithRequiredParam')
            }
          ]
        }
      ]
    },
    {
      code: code.replace('supportedParam', 'unsupportedParam'),
      options,
      errors: [
        {
          messageId: 'notSupportedParamForType',
          data: {
            o3rWidgetParam: 'unsupportedParam',
            o3rWidgetType: 'supportedType',
            supportedO3rWidgetParam: 'supportedParam'
          },
          suggestions: [
            {
              messageId: 'suggestReplaceO3rWidgetType',
              data: {
                currentType: 'unsupportedParam',
                suggestedType: 'supportedParam'
              },
              output: code
            }
          ]
        }
      ]
    },
    {
      code: code.replace('"valid value"', 'false'),
      options,
      errors: [
        {
          messageId: 'invalidParamValueType',
          data: {
            o3rWidgetParam: 'supportedParam',
            o3rWidgetParamType: 'string'
          }
        }
      ]
    },
    {
      code: code.replace(' extends Configuration', ''),
      options,
      errors: [
        {
          messageId: 'notInConfigurationInterface'
        }
      ]
    },
    {
      code: `
export interface Config extends Configuration {
  /**
   * @o3rWidget widgetWithRequiredParam
   */
  prop: string;
}
      `.trim(),
      output: `
export interface Config extends Configuration {
  /**
   * @o3rWidget widgetWithRequiredParam
   * @o3rWidgetParam requiredParam value
   */
  prop: string;
}
      `.trim(),
      options,
      errors: [
        {
          messageId: 'requiredParamMissing',
          data: {
            o3rWidgetType: 'widgetWithRequiredParam',
            o3rWidgetParam: 'requiredParam'
          },
          suggestions: [
            {
              messageId: 'suggestParamMissing',
              data: {
                o3rWidgetParam: 'requiredParam'
              },
              output: `
export interface Config extends Configuration {
  /**
   * @o3rWidget widgetWithRequiredParam
   * @o3rWidgetParam requiredParam value
   */
  prop: string;
}
              `.trim()
            }
          ]
        }
      ]
    }
  ]
});
