# Migration to ESLint Flat Configuration

[ESLint RC format](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated) is deprecated in favor of [ESLint FlatConfig](https://eslint.org/blog/2022/08/new-config-system-part-2/).
To migrate, you can follow their [migration guide](https://eslint.org/docs/latest/use/configure/migration-guide).

On Otter side, an ESLint Flat Configuration is exposed by the [`@o3r/eslint-config`](https://www.npmjs.com/package/@o3r/eslint-config) package.

## Rules changes

List of differences by plugin between configurations exposed by `@o3r/eslint-config-otter` and `@o3r/eslint-config`.

### Angular ESLint rules

#### Removed

- [`@angular-eslint/no-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-host-metadata-property.md) is deprecated and was already set to `off`.

### TypeScript ESLint rules

#### Removed

- [`@typescript-eslint/ban-types`](https://typescript-eslint.io/rules/ban-types/) is deprecated.
- [`@typescript-eslint/no-var-requires`](https://typescript-eslint.io/rules/no-var-requires/) is deprecated.

#### Added

- [`@typescript-eslint/no-empty-object-type`](https://typescript-eslint.io/rules/no-empty-object-type/) partially replace [`@typescript-eslint/ban-types`](https://typescript-eslint.io/rules/ban-types/), set to `off`.
- [`@typescript-eslint/only-throw-error`](https://typescript-eslint.io/rules/only-throw-error/) set to `warn`.
- [`@typescript-eslint/prefer-promise-reject-errors`](https://typescript-eslint.io/rules/prefer-promise-reject-errors/) set to `warn`.

#### Modified

- [`@typescript-eslint/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars/) configuration has changed. `caughtErrors` is set to `none` and `ignoreRestSiblings` to `true`.

### Basic ESlint rules

A lot of rules has been deprecated in favor of the [Stylistic plugin](https://eslint.style/)

#### Replaced

- [`comma-dangle`](https://eslint.org/docs/latest/rules/comma-dangle) is deprecated in favor of [`@stylistic/comma-dangle`](https://eslint.style/rules/default/comma-dangle).
- [`comma-style`](https://eslint.org/docs/latest/rules/comma-style) is deprecated in favor of [`@stylistic/comma-style`](https://eslint.style/rules/default/comma-style).
- [`dot-location`](https://eslint.org/docs/latest/rules/dot-location) is deprecated in favor of [`@stylistic/dot-location`](https://eslint.style/rules/default/dot-location).
- [`eol-last`](https://eslint.org/docs/latest/rules/eol-last) is deprecated in favor of [`@stylistic/eol-last`](https://eslint.style/rules/default/eol-last).
- [`id-blacklist`](https://eslint.org/docs/latest/rules/id-blacklist) is deprecated in favor of [`id-denylist`](https://eslint.org/docs/latest/rules/id-blacklist).
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

- [`no-console`](https://eslint.org/docs/latest/rules/no-console) was allowing some `console` methods, now set to `error` without accepting any `console` methods.
- [`no-prototype-builtins`](no-prototype-builtins) set to `error` through `@eslint/js/recommended` configuration.

### Stylistic ESLint rules

Before the rules from [`@stylistic/eslint-plugin-ts`](https://eslint.style/packages/ts) where used, now we use the ones from [`@stylistic/eslint-plugin`](https://eslint.style/packages/default#stylistic-eslint-plugin) as recommended.
