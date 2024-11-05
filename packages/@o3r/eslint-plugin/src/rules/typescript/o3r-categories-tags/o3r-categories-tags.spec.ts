import {
  RuleTester
} from '@typescript-eslint/rule-tester';
import o3rCategoriesTagsRule, {
  O3rCategoriesTagsRuleOption
} from './o3r-categories-tags';

const ruleTester = new RuleTester();

const code = `
/**
 * @o3rCategories local
 */
export interface Config extends Configuration {
  /**
   * @o3rCategory local
   */
  prop1: string;
  /**
   * @o3rCategory global
   */
  prop2: string;
}
`.trim();

const options: Readonly<[O3rCategoriesTagsRuleOption]> = [{
  globalConfigCategories: ['global']
}];

ruleTester.run('o3r-categories-tags', o3rCategoriesTagsRule, {
  valid: [{ code, options }
  ],
  invalid: [
    {
      code: code
        .replace('@o3rCategories local', '@o3rCategories global')
        .replace('@o3rCategory local', '@o3rCategory global'),
      options,
      output: code
        .replace(' * @o3rCategories local\n', '')
        .replace('@o3rCategory local', '@o3rCategory global'),
      errors: [
        {
          messageId: 'alreadyDefined'
        }
      ]
    },
    {
      code: code.replace(/(.*@o3rCategory .*)/, '$1\n$1'),
      options,
      errors: [
        {
          messageId: 'onlyOneCategoryAllowed'
        }
      ]
    },
    {
      code: code.replace('@o3rCategory local', '@o3rCategory undefinedCategory'),
      options,
      errors: [
        {
          messageId: 'undefinedCategory',
          data: {
            currentCategory: 'undefinedCategory',
            supportedCategories: 'global, local'
          },
          suggestions: [
            {
              messageId: 'suggestReplaceO3rCategory',
              data: {
                currentCategory: 'undefinedCategory',
                suggestedCategory: 'global',
              },
              output: code.replace('@o3rCategory local', '@o3rCategory global')
            },
            {
              messageId: 'suggestReplaceO3rCategory',
              data: {
                currentCategory: 'undefinedCategory',
                suggestedCategory: 'local',
              },
              output: code
            }
          ]
        }
      ]
    },
    {
      code: code.replace(' extends Configuration', ''),
      options,
      errors: [
        // three times because one for the interface and one for each properties
        {
          messageId: 'notInConfigurationInterface'
        },
        {
          messageId: 'notInConfigurationInterface'
        },
        {
          messageId: 'notInConfigurationInterface'
        }
      ]
    }
  ]
});
