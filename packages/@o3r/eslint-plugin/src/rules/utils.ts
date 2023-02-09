import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import * as path from 'node:path';

/** Current package version (format: <major>.<minor>)*/
const version = (require(path.resolve(__dirname, '..', '..', 'package.json')) as {version: string}).version.split('.').slice(0,2).join('.');

/** ESLint rule generator */
// eslint-disable-next-line new-cap
export const createRule = ESLintUtils.RuleCreator((name) => {
  if (version === '0.0') {
    return 'file:' + path.resolve(__dirname, '..', '..', '..', '..', '..', 'docs', 'linter', 'eslint-plugin', 'rules', `${name}.md`);
  }
  return `https://github.com/AmadeusITGroup/otter/tree/release/${version}/docs/linter/eslint-plugin/rules/${name}.md`;
});
