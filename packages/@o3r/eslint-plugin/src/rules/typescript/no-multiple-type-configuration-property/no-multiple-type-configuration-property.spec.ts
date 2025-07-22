import noMultipleTypeConfigurationPropertyRule from './no-multiple-type-configuration-property';
const { RuleTester } = require('@typescript-eslint/rule-tester');

const ruleTester = new RuleTester();

const code = `
export interface Config extends Configuration {
  prop1: string;
  prop2: 'a' | 'b' | 'c';
  prop3: 1 | 2 | 3;
}
`.trim();

ruleTester.run('no-multiple-type-configuration-property', noMultipleTypeConfigurationPropertyRule, {
  valid: [
    { code },
    { code: 'export interface A { prop1: string | number; }' }
  ],
  invalid: [
    {
      code: code.replace(': string;', ': string | number | boolean;'),
      errors: [
        {
          suggestions: [
            {
              output: code,
              messageId: 'suggestion',
              data: {
                currentValue: 'string | number | boolean',
                recommendedValue: 'string'
              }
            },
            {
              output: code.replace(': string;', ': number;'),
              messageId: 'suggestion',
              data: {
                currentValue: 'string | number | boolean',
                recommendedValue: 'number'
              }
            },
            {
              output: code.replace(': string;', ': boolean;'),
              messageId: 'suggestion',
              data: {
                currentValue: 'string | number | boolean',
                recommendedValue: 'boolean'
              }
            }
          ],
          messageId: 'error'
        }
      ]
    },
    {
      code: code.replace(': string;', ': string & number;'),
      errors: [
        {
          suggestions: [
            {
              output: code,
              messageId: 'suggestion',
              data: {
                currentValue: 'string & number',
                recommendedValue: 'string'
              }
            },
            {
              output: code.replace(': string;', ': number;'),
              messageId: 'suggestion',
              data: {
                currentValue: 'string & number',
                recommendedValue: 'number'
              }
            }
          ],
          messageId: 'error'
        }
      ]
    },
    {
      code: code.replace(': string;', ': \'a\' | 1;'),
      errors: [
        {
          suggestions: [
            {
              output: code.replace(': string;', ': \'a\';'),
              messageId: 'suggestion',
              data: {
                currentValue: '\'a\' | 1',
                recommendedValue: '\'a\''
              }
            },
            {
              output: code.replace(': string;', ': 1;'),
              messageId: 'suggestion',
              data: {
                currentValue: '\'a\' | 1',
                recommendedValue: '1'
              }
            }
          ],
          messageId: 'error'
        }
      ]
    }
  ]
});
