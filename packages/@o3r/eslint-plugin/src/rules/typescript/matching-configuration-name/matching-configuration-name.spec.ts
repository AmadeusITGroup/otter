import matchingConfigurationNameRule from './matching-configuration-name';
const { RuleTester } = require('@typescript-eslint/rule-tester');

const ruleTester = new RuleTester();

ruleTester.run('matching-configuration-name', matchingConfigurationNameRule, {
  valid: [
    {
      code: `
  export interface MyFirstConfig extends Configuration {}

  export const MY_CONFIG_ID = computeItemIdentifier('MyFirstConfig', '@example/config');
      `.trim()
    }, {
      code: `
  export interface MySecondConfig extends Configuration {}
  export interface MyThirdConfig extends Configuration {}

  export const MY_CONFIG_ID = computeItemIdentifier('MyThirdConfig', '@example/config');
      `.trim()
    }, {
      code: `
  export interface MyFourthConfig extends Configuration {}
  export interface MyFifthConfig extends Configuration {}

  export const MY_CONFIG_ID = computeItemIdentifier('MyFourthConfig', '@example/config');
      `.trim()
    }, {
      code: `
  export const MY_CONFIG_ID = computeItemIdentifier('MyConfig', '@example/config');
      `.trim()
    }
  ],
  invalid: [
    {
      code: `
export interface MyConfig extends Configuration {}

export const MY_CONFIG_ID = computeItemIdentifier('InvalidName', '@example/config');
      `.trim(),
      errors: [{
        messageId: 'error',
        data: {
          currentValue: 'InvalidName',
          possibleValues: 'MyConfig'
        },
        suggestions: [{
          messageId: 'suggestion',
          data: {
            currentValue: 'InvalidName',
            recommendedValue: 'MyConfig'
          },
          output: `
export interface MyConfig extends Configuration {}

export const MY_CONFIG_ID = computeItemIdentifier('MyConfig', '@example/config');
      `.trim()
        }]
      }],
      output: `
export interface MyConfig extends Configuration {}

export const MY_CONFIG_ID = computeItemIdentifier('MyConfig', '@example/config');
      `.trim()
    }, {
      code: `
export interface MyFirstConfig extends Configuration {}
export interface MySecondConfig extends Configuration {}

export const MY_CONFIG_ID = computeItemIdentifier('InvalidName', '@example/config');
      `.trim(),
      errors: [{
        messageId: 'error',
        data: {
          currentValue: 'InvalidName',
          possibleValues: 'MyFirstConfig, MySecondConfig'
        },
        suggestions: [
          {
            messageId: 'suggestion',
            data: {
              currentValue: 'InvalidName',
              recommendedValue: 'MyFirstConfig'
            },
            output: `
export interface MyFirstConfig extends Configuration {}
export interface MySecondConfig extends Configuration {}

export const MY_CONFIG_ID = computeItemIdentifier('MyFirstConfig', '@example/config');
            `.trim()
          },
          {
            messageId: 'suggestion',
            data: {
              currentValue: 'InvalidName',
              recommendedValue: 'MySecondConfig'
            },
            output: `
export interface MyFirstConfig extends Configuration {}
export interface MySecondConfig extends Configuration {}

export const MY_CONFIG_ID = computeItemIdentifier('MySecondConfig', '@example/config');
            `.trim()
          }
        ]
      }],
      output: `
export interface MyFirstConfig extends Configuration {}
export interface MySecondConfig extends Configuration {}

export const MY_CONFIG_ID = computeItemIdentifier('MyFirstConfig', '@example/config');
      `.trim()
    }
  ]
});
