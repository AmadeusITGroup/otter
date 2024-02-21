import { TSESLint } from '@typescript-eslint/utils';
import o3rWidgetTagsRule, { O3rWidgetTagsRuleOption } from './o3r-widget-tags';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  }
});

const code = `
export interface Config extends Configuration {
  /**
   * @o3rWidget supportedType
   * @o3rWidgetParam supportedParam "valid value"
   */
  prop: string;
}
`;

const options: O3rWidgetTagsRuleOption[] = [{
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
          messageId: 'onlyOneWidgetAllowed'
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
          }
        }
      ]
    },
    {
      code: code.replace('@o3rWidget', ''),
      output: code.replace('@o3rWidget', '').replace(/((.*)@o3rWidgetParam .*)/, '$2@o3rWidget widgetType\n$1'),
      options,
      errors: [
        {
          messageId: 'noParamWithoutWidget'
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
          }
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
          }
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
      `,
      output: `
        export interface Config extends Configuration {
          /**
           * @o3rWidget widgetWithRequiredParam
           * @o3rWidgetParam requiredParam value
           */
          prop: string;
        }
      `,
      options,
      errors: [
        {
          messageId: 'requiredParamMissing',
          data: {
            o3rWidgetType: 'widgetWithRequiredParam',
            o3rWidgetParam: 'requiredParam'
          }
        }
      ]
    }
  ]
});
