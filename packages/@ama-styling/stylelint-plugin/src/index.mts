import stylelint from 'stylelint';
import {
  rules,
} from './rules/index.mjs';
import {
  getNamespacedRuleName,
} from './utils/get-namespaced-rule-name.mjs';

const { createPlugin } = stylelint;
const rulesPlugins = Object.entries(rules).map(([ruleName, rule]) =>
  createPlugin(getNamespacedRuleName(ruleName), rule as any)
);

export default rulesPlugins;
