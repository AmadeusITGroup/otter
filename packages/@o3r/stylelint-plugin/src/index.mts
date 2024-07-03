import stylelint from 'stylelint';
import {getNamespacedRuleName} from './utils/get-namespaced-rule-name.mjs';
import {rules} from './rules/index.mjs';

const { createPlugin } = stylelint;
const rulesPlugins = Object.entries(rules).map(([ruleName, rule]) =>
  createPlugin(getNamespacedRuleName(ruleName), rule as any)
);

export default rulesPlugins;
