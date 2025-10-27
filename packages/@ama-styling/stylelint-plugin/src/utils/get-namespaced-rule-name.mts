const prefix = '@ama-styling';

/**
 * Generates a namespaced rule name.
 * @param ruleName Name of the rule
 */
export const getNamespacedRuleName = (ruleName: string): string => `${prefix}/${ruleName}`;
