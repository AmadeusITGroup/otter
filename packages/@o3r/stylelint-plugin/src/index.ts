import {createPlugin} from 'stylelint';
import {getNamespacedRuleName} from './utils/get-namespaced-rule-name';
import {rules} from './rules/index';

const rulesPlugins = Object.keys(rules).map(ruleName => {
  return createPlugin(getNamespacedRuleName(ruleName), rules[ruleName]);
});

export default rulesPlugins;
