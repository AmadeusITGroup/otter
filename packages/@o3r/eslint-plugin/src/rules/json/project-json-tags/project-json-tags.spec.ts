import * as jsonParser from 'jsonc-eslint-parser';
import projectJsonTagsRule from './project-json-tags';
const {
  RuleTester
} = require('@typescript-eslint/rule-tester');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: jsonParser
  }
} as any);

ruleTester.run('project-json-tags', projectJsonTagsRule, {
  valid: [
    { code: JSON.stringify({}), filename: 'project.json' },
    { code: JSON.stringify({ anyField: '' }), filename: 'project.json' },
    { code: JSON.stringify({ tags: [] }), filename: 'project.json' },
    { code: JSON.stringify({ tags: ['validTag'] }), filename: 'project.json', options: [{ allowedTags: ['validTag'] }] },
    { code: JSON.stringify({ tags: ['validTag'] }), filename: 'project.json', options: [{ allowedTags: ['validTag', 'anotherValidTag'] }] },
    { code: JSON.stringify({ tags: ['validTag', 'anotherValidTag'] }), filename: 'project.json', options: [{ allowedTags: ['validTag', 'anotherValidTag'] }] }
  ],
  invalid: [
    {
      code: JSON.stringify({ tags: ['invalidTag'] }),
      options: [{ allowedTags: ['validTag', 'anotherValidTag'] }],
      filename: 'project.json',
      errors: [{
        messageId: 'invalidTag',
        data: {
          tag: 'invalidTag',
          allowedTags: 'validTag, anotherValidTag'
        }
      }]
    },
    {
      code: JSON.stringify({ tags: ['validTag', 'invalidTag'] }),
      options: [{ allowedTags: ['validTag', 'anotherValidTag'] }],
      filename: 'project.json',
      errors: [{
        messageId: 'invalidTag',
        data: {
          tag: 'invalidTag',
          allowedTags: 'validTag, anotherValidTag'
        }
      }]
    },
    {
      code: JSON.stringify({ tags: 'validTag' }),
      options: [{ allowedTags: ['validTag', 'anotherValidTag'] }],
      filename: 'project.json',
      errors: [{ messageId: 'tagsNotArray' }]
    },
    {
      code: JSON.stringify({ tags: [1, 'invalidTag', 'anotherInvalidTag'] }),
      options: [{ allowedTags: ['validTag', 'anotherValidTag'] }],
      filename: 'project.json',
      errors: [{
        messageId: 'unsupportedTag',
        data: {
          tagType: 'number'
        }
      }, {
        messageId: 'invalidTag',
        data: {
          tag: 'invalidTag',
          allowedTags: 'validTag, anotherValidTag'
        }
      }, {
        messageId: 'invalidTag',
        data: {
          tag: 'anotherInvalidTag',
          allowedTags: 'validTag, anotherValidTag'
        }
      }]
    }
  ]
});
