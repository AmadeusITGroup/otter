# no-inner-html

This rule ensures that your template does not use innerHTML.
For performance reason, it makes sense for certain application to encourage to use 'innerText' over 'innerHTML'.

## Prerequisite

The linter is dedicated to template files and requires the setup of the [@angular-eslint/template-parser](https://www.npmjs.com/package/@angular-eslint/template-parser).

Example of a ESLint configuration:

```json
{
  "parser": "@angular-eslint/template-parser",
  "plugins": [
    "@o3r"
  ],
  "rules": {
    "@o3r/no-inner-html": "warn"
  }
}
```
