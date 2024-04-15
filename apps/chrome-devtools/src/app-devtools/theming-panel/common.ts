import type { StylingVariable } from '@o3r/styling';

/** RegExp to find a variable and get the variable name in the first group */
export const varRegExp = /^var\(--([^, )]*).*\)$/;

/**
 * Is the variable value a reference to another variable
 * @param variableValue
 */
export const isRef = (variableValue: string) => varRegExp.test(variableValue);

/**
 * Search function to find is a variable match a search text
 * @param variable
 * @param search
 */
export const searchFn = (variable: StylingVariable, search: string) =>
  [variable.name, variable.category, variable.description, ...(variable.tags || []), variable.defaultValue]
    .some((value) => value?.toLowerCase().includes(search.replace(/var\(--|[, )]/g, '')));

/**
 * Find the value of a variable
 * @param variableName
 * @param runtimeValueVariables
 * @param variables
 * @param visitedVariables
 * @returns undefined if circular dependency
 */
export const resolveVariable = (
  variableName: string,
  runtimeValueVariables?: Record<string, string | null | undefined>,
  variables?: StylingVariable[],
  visitedVariables = new Set<string>()
): string | undefined => {
  visitedVariables.add(variableName);
  const variableMetadata = variables?.find((variable) => variable.name === variableName);
  const variableValue = runtimeValueVariables?.[variableName] ?? variableMetadata?.runtimeValue ?? variableMetadata?.defaultValue ?? '';
  if (isRef(variableValue)) {
    const varName = variableValue.match(varRegExp)![1];
    return !visitedVariables.has(varName) ? resolveVariable(varName, runtimeValueVariables, variables, visitedVariables) : undefined;
  }
  return variableValue;
};
