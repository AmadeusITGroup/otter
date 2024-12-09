# Migration to ESLint Flat Configuration

[ESLint RC format](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated) is deprecated in favor of [ESLint FlatConfig](https://eslint.org/blog/2022/08/new-config-system-part-2/).
To migrate, you can follow their [migration guide](https://eslint.org/docs/latest/use/configure/migration-guide).

On the Otter side, an ESLint flat configuration is exposed by the [`@o3r/eslint-config`](https://www.npmjs.com/package/@o3r/eslint-config) package.

## Rule changes

> [!NOTE]
> All the rules set to `warn` have been upgraded to `error`.

Below, you can find the list of differences between the configurations exposed by `@o3r/eslint-config-otter` and by `@o3r/eslint-config` for each plugin.

### Angular ESLint rules

#### Added

We added the [recommended rules for template accessibility](https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/README.md#angular-eslinttemplate-accessibility).

#### Removed

- [`@angular-eslint/no-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/17.5.x/packages/eslint-plugin/docs/rules/no-host-metadata-property.md) is deprecated and was already set to `off`.

### TypeScript ESLint rules

#### Replaced

- [`@typescript-eslint/no-var-requires`](https://typescript-eslint.io/rules/no-var-requires/) is deprecated in favor of [`@typescript-eslint/no-require-imports`](https://typescript-eslint.io/rules/no-require-imports/).
- `no-throw-literal` has been renamed to [`@typescript-eslint/only-throw-error`](https://typescript-eslint.io/rules/only-throw-error/).

#### Removed

- [`@typescript-eslint/ban-types`](https://typescript-eslint.io/rules/ban-types/) is deprecated.

#### Added

- [`@typescript-eslint/no-empty-object-type`](https://typescript-eslint.io/rules/no-empty-object-type/) partially replaces [`@typescript-eslint/ban-types`](https://typescript-eslint.io/rules/ban-types/), it is now set to `off`.
- [`@typescript-eslint/prefer-promise-reject-errors`](https://typescript-eslint.io/rules/prefer-promise-reject-errors/) set to `error`.

#### Modified

- [`@typescript-eslint/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars/) configuration has changed: `caughtErrors` is set to `none` and `ignoreRestSiblings` to `true`.

### Basic ESlint rules

A lot of rules have been deprecated in favor of the [TypeScript](https://typescript-eslint.io/) and [Stylistic](https://eslint.style/) rules.

#### Replaced

- [`comma-dangle`](https://eslint.org/docs/latest/rules/comma-dangle) is deprecated in favor of [`@stylistic/comma-dangle`](https://eslint.style/rules/default/comma-dangle).
- [`comma-style`](https://eslint.org/docs/latest/rules/comma-style) is deprecated in favor of [`@stylistic/comma-style`](https://eslint.style/rules/default/comma-style).
- [`dot-location`](https://eslint.org/docs/latest/rules/dot-location) is deprecated in favor of [`@stylistic/dot-location`](https://eslint.style/rules/default/dot-location).
- [`eol-last`](https://eslint.org/docs/latest/rules/eol-last) is deprecated in favor of [`@stylistic/eol-last`](https://eslint.style/rules/default/eol-last).
- [`id-blacklist`](https://eslint.org/docs/latest/rules/id-blacklist) has been renamed to [`id-denylist`](https://eslint.org/docs/latest/rules/id-blacklist).
- [`indent`](https://eslint.org/docs/latest/rules/indent) is deprecated in favor of [`@stylistic/indent`](https://eslint.style/rules/default/indent).
- [`key-spacing`](https://eslint.org/docs/latest/rules/key-spacing) is deprecated in favor of [`@stylistic/key-spacing`](https://eslint.style/rules/default/key-spacing).
- [`linebreak-style`](https://eslint.org/docs/latest/rules/linebreak-style) is deprecated in favor of [`@stylistic/linebreak-style`](https://eslint.style/rules/default/linebreak-style).
- [`max-len`](https://eslint.org/docs/latest/rules/max-len) is deprecated in favor of [`@stylistic/max-len`](https://eslint.style/rules/default/max-len).
- [`new-parens`](https://eslint.org/docs/latest/rules/new-parens) is deprecated in favor of [`@stylistic/new-parens`](https://eslint.style/rules/default/new-parens).
- [`no-mixed-spaces-and-tabs`](https://eslint.org/docs/latest/rules/no-mixed-spaces-and-tabs) is deprecated in favor of [`@stylistic/no-mixed-spaces-and-tabs`](https://eslint.style/rules/default/no-mixed-spaces-and-tabs).
- [`no-multi-spaces`](https://eslint.org/docs/latest/rules/no-multi-spaces) is deprecated in favor of [`@stylistic/no-multi-spaces`](https://eslint.style/rules/default/no-multi-spaces).
- [`no-multiple-empty-lines`](https://eslint.org/docs/latest/rules/no-multiple-empty-lines) is deprecated in favor of [`@stylistic/no-multiple-empty-lines`](https://eslint.style/rules/default/no-multiple-empty-lines).
- [`no-new-symbol`](https://eslint.org/docs/latest/rules/no-new-symbol) is deprecated in favor of [`no-new-native-nonconstructor`](https://eslint.org/docs/latest/rules/no-new-native-nonconstructor).
- [`no-trailing-spaces`](https://eslint.org/docs/latest/rules/no-trailing-spaces) is deprecated in favor of [`@stylistic/no-trailing-spaces`](https://eslint.style/rules/default/no-trailing-spaces).
- [`quotes`](https://eslint.org/docs/latest/rules/quotes) is deprecated in favor of [`@stylistic/quotes`](https://eslint.style/rules/default/quotes).
- [`semi`](https://eslint.org/docs/latest/rules/semi) is deprecated in favor of [`@stylistic/semi`](https://eslint.style/rules/default/semi).
- [`semi-spacing`](https://eslint.org/docs/latest/rules/semi-spacing) is deprecated in favor of [`@stylistic/semi-spacing`](https://eslint.style/rules/default/semi-spacing).
- [`space-in-parens`](https://eslint.org/docs/latest/rules/space-in-parens) is deprecated in favor of [`@stylistic/space-in-parens`](https://eslint.style/rules/default/space-in-parens).
- [`space-unary-ops`](https://eslint.org/docs/latest/rules/space-unary-ops) is deprecated in favor of [`@stylistic/space-unary-ops`](https://eslint.style/rules/default/space-unary-ops).
- [`spaced-comment`](https://eslint.org/docs/latest/rules/spaced-comment) is deprecated in favor of [`@stylistic/spaced-comment`](https://eslint.style/rules/default/spaced-comment).
- [`wrap-iife`](https://eslint.org/docs/latest/rules/wrap-iife) is deprecated in favor of [`@stylistic/wrap-iife`](https://eslint.style/rules/default/wrap-iife).

#### Modified

- [`no-console`](https://eslint.org/docs/latest/rules/no-console) previously allowed some `console` methods. It is now set to `error` and does not accept any `console` methods.

### Stylistic ESLint rules

Previously, the rules of [`@stylistic/eslint-plugin-ts`](https://eslint.style/packages/ts) were used. We now use those of [`@stylistic/eslint-plugin`](https://eslint.style/packages/default#stylistic-eslint-plugin) as recommended.
Before, we used three rules from @stylistic. We now use their [recommended configuration](https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts) with some customization.

#### Customized

- [`@stylistic/arrow-parens`](https://eslint.style/rules/default/arrow-parens)
- [`@stylistic/brace-style`](https://eslint.style/rules/default/brace-style)
- [`@stylistic/comma-dangle`](https://eslint.style/rules/default/comma-dangle)
- [`@stylistic/indent`](https://eslint.style/rules/default/indent)
- [`@stylistic/linebreak-style`](https://eslint.style/rules/default/linebreak-style)
- [`@stylistic/max-len`](https://eslint.style/rules/default/max-len)
- [`@stylistic/member-delimiter-style`](https://eslint.style/rules/default/member-delimiter-style)
- [`@stylistic/no-multiple-empty-lines`](https://eslint.style/rules/default/no-multiple-empty-lines)
- [`@stylistic/operator-linebreak`](https://eslint.style/rules/default/operator-linebreak)
- [`@stylistic/quote-props`](https://eslint.style/rules/default/quote-props)
- [`@stylistic/quotes`](https://eslint.style/rules/default/quotes)
- [`@stylistic/semi`](https://eslint.style/rules/default/semi)
- [`@stylistic/semi-spacing`](https://eslint.style/rules/default/semi-spacing)
- [`@stylistic/space-unary-ops`](https://eslint.style/rules/default/space-unary-ops)
- [`@stylistic/spaced-comment`](https://eslint.style/rules/default/spaced-comment)
- [`@stylistic/wrap-iife`](https://eslint.style/rules/default/wrap-iife)


### Unicorn ESLint rules

Before, we used three rules from unicorn. We now use their [recommended configuration](https://github.com/sindresorhus/eslint-plugin-unicorn?tab=readme-ov-file#rules) with some customization.

#### Customized

- [`unicorn/catch-error-name](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/catch-error-name.md)
- [`unicorn/filename-case](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md)

#### Deactivated

- [`unicorn/import-style`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/import-style.md)
- [`unicorn/no-await-expression-member`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-await-expression-member.md)
- [`unicorn/no-array-for-each`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-for-each.md)
- [`unicorn/no-array-reduce`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-reduce.md)
- [`unicorn/no-null`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-null.md)
- [`unicorn/no-typeof-undefined`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-typeof-undefined.md)
- [`unicorn/prefer-dom-node-text-content`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-dom-node-text-content.md)
- [`unicorn/prefer-module`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md)
- [`unicorn/prefer-spread`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-spread.md)
- [`unicorn/prefer-string-raw`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-raw.md)
- [`unicorn/prefer-string-replace-all`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-string-replace-all.md)
- [`unicorn/prevent-abbreviations`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prevent-abbreviations.md)
