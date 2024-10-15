/**
 * Convert the rules set as `warn` to `error`
 * @param {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config | import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} config config to process
 * @returns {import('@typescript-eslint/utils').TSESLint.FlatConfig.Rules} only the upgraded rules
 */
function convertWarningsToErrors(config) {
  /** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.Rules} */
  const warningRulesUpgraded = {};
  (Array.isArray(config) ? config : [config]).forEach(({ rules = {} }) => {
    Object.entries(rules).forEach(([ruleName, ruleEntry]) => {
      const severity = Array.isArray(ruleEntry) ? ruleEntry[0] : ruleEntry;
      if (severity === 1 || severity === 'warn') {
        warningRulesUpgraded[ruleName] = Array.isArray(ruleEntry) ? ['error', ...ruleEntry.slice(1)] : 'error';
      }
    });
  });
  return warningRulesUpgraded;
}

module.exports = { convertWarningsToErrors };
