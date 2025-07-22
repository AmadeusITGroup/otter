import o3rRestrictionKeyRule, {
  O3rRestrictionKeyTagsRuleOption,
} from './o3r-restriction-key-tags';
const {
  RuleTester
} = require('@typescript-eslint/rule-tester');

const ruleTester = new RuleTester();

const code = `
export interface Config extends Configuration {
  /**
   * @o3rRestrictionKey valid
   * @o3rRestrictionKey valid_with_underscore
   * @o3rRestrictionKey 'valid with space (single quote)'
   * @o3rRestrictionKey "valid with space (double quote)"
   * @o3rRestrictionKey '"valid" with double quote inside'
   * @o3rRestrictionKey "'valid' with single quote inside"
   * @o3rRestrictionKey valid_with_number_1
   */
  prop: string;
}
`;

const supportedKeys = [
  'valid',
  'valid_with_underscore',
  'valid with space',
  'valid with space (single quote)',
  'valid with space (double quote)',
  '"valid" with double quote inside',
  "'valid' with single quote inside",
  'valid_with_number_1'
];

const options = [{ supportedKeys }] as const satisfies Readonly<[O3rRestrictionKeyTagsRuleOption]>;

const unknownKeys = [
  `unknown_restriction`,
  `"invalid quote'`,
  `'another invalid quote"`,
  `'unknown with single quote'`,
  `"unknown with double quote"`
];

const getCodeFor = (key: string) => `
export interface Config extends Configuration {
  /**
   * @o3rRestrictionKey ${key}
   */
  prop: string;
}
`;

const getSuggestionFor = (actualKey: string) => supportedKeys.map((supportedKey) => ({
  messageId: 'suggestUseSupportedKey',
  data: {
    actualKey,
    supportedKey
  },
  output: getCodeFor(/[^\w]/.test(supportedKey) ? `"${supportedKey}"` : supportedKey)
}));

ruleTester.run('o3r-restriction-key-tags', o3rRestrictionKeyRule, {
  valid: [
    {
      code,
      options
    },
    {
      code: `
export interface Config extends Configuration {
  /**
   * Property without restriction
   */
  prop: string;
}`,
      options
    }
  ],
  invalid: [
    {
      code: getCodeFor('"at least one key provided"'),
      options: [{}],
      errors: [
        { messageId: 'noRestrictionKeyProvided' }
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
      code: getCodeFor('valid with space'),
      options,
      output: getCodeFor(`"valid with space"`),
      errors: [
        {
          messageId: 'notWrapWithQuotes',
          data: {
            actualKey: 'valid with space'
          },
          suggestions: [{
            messageId: 'suggestWrapWithQuotes',
            data: {
              actualKey: 'valid with space'
            },
            output: getCodeFor(`"valid with space"`)
          }]
        }
      ]
    },
    ...unknownKeys.map((key) => ({
      code: getCodeFor(key),
      options,
      errors: [{
        messageId: 'notSupportedKey',
        data: {
          actualKey: key,
          supportedKeys: supportedKeys.join(', ')
        },
        suggestions: getSuggestionFor(key)
      }]
    }))
  ]
});
