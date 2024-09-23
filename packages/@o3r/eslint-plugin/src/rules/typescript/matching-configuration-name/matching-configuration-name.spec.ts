import typescriptParser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import matchingConfigurationNameRule from './matching-configuration-name';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module'
    }
  }
});



ruleTester.run('matching-configuration-name', matchingConfigurationNameRule, {
  valid: [{
    code: `
export interface MyFirstConfig extends Configuration {}

export const MY_CONFIG_ID = computeConfigurationName('MyFirstConfig', '@example/config');
    `
  }, {
    code: `
export interface MySecondConfig extends Configuration {}
export interface MyThirdConfig extends Configuration {}

export const MY_CONFIG_ID = computeConfigurationName('MyThirdConfig', '@example/config');
    `
  }, {
    code: `
export interface MyFourthConfig extends Configuration {}
export interface MyFifthConfig extends Configuration {}

export const MY_CONFIG_ID = computeConfigurationName('MyFourthConfig', '@example/config');
    `
  }, {
    code: `
export const MY_CONFIG_ID = computeConfigurationName('MyConfig', '@example/config');
    `
  }],
  invalid: [{
    code: `
export interface MyConfig extends Configuration {}

export const MY_CONFIG_ID = computeConfigurationName('InvalidName', '@example/config');
    `,
    errors: [{
      messageId: 'error',
      data: {
        currentValue: 'InvalidName',
        possibleValues: 'MyConfig'
      }
    }],
    output: `
export interface MyConfig extends Configuration {}

export const MY_CONFIG_ID = computeConfigurationName('MyConfig', '@example/config');
    `
  }, {
    code: `
export interface MyFirstConfig extends Configuration {}
export interface MySecondConfig extends Configuration {}

export const MY_CONFIG_ID = computeConfigurationName('InvalidName', '@example/config');
    `,
    errors: [{
      messageId: 'error',
      data: {
        currentValue: 'InvalidName',
        possibleValues: 'MyFirstConfig, MySecondConfig'
      }
    }],
    output: `
export interface MyFirstConfig extends Configuration {}
export interface MySecondConfig extends Configuration {}

export const MY_CONFIG_ID = computeConfigurationName('MyFirstConfig', '@example/config');
    `
  }]
});
