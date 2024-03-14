import type { StylingVariables } from '@o3r/styling';

export type Variable = StylingVariables extends (infer T)[] ? T : never;

export const varRegExp = /^var\(--([^,)]*).*\)$/;

export const isRef = (variableValue: string) => varRegExp.test(variableValue);

export const searchFn = ({ name, category, description, tags, defaultValue }: Variable, search: string) =>
  [name, category, description, ...(tags || []), defaultValue].some((value) => value?.toLowerCase().includes(search.replace(/var\(--|[,)]/g, '')));

export const resolveVariable = (
  variableName: string,
  runtimeValueVariables?: Record<string, string | null | undefined>,
  variables?: StylingVariables,
  visitedVariable = new Set()
): string | undefined => {
  visitedVariable.add(variableName);
  const variableMetadata = variables?.find((variable) => variable.name === variableName);
  const variableValue = runtimeValueVariables?.[variableName] ?? variableMetadata?.runtimeValue ?? variableMetadata?.defaultValue ?? '';
  if (isRef(variableValue)) {
    const varName = variableValue.match(varRegExp)?.[1]!;
    return !visitedVariable.has(varName) ? resolveVariable(varName, runtimeValueVariables, variables, visitedVariable) : undefined;
  }
  return variableValue;
};
