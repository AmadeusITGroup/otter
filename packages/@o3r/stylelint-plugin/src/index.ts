import {createPlugin} from 'stylelint';
import {getNamespacedRuleName} from './utils/get-namespaced-rule-name';
import {rules} from './rules/index';

const rulesPlugins = Object.entries(rules).map(([ruleName, rule]) =>
  createPlugin(getNamespacedRuleName(ruleName), rule as any)
);

export default rulesPlugins;
