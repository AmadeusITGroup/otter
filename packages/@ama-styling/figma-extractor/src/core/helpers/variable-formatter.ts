import type {
  GetLocalVariables200ResponseMeta,
  VariableAlias,
} from '@ama-styling/figma-sdk';
import {
  convertNameToReference,
} from './name-to-reference';

/**
 * Retrieve Variable Referrer function
 * @param localVariablesResponse file variables
 */
export const getVariablesFormatter = (localVariablesResponse: GetLocalVariables200ResponseMeta) => {
  const getVariableRef = (alias?: VariableAlias) => {
    const variable = alias?.type === 'VARIABLE_ALIAS' && localVariablesResponse.variables[alias.id];
    return variable && convertNameToReference(variable.name);
  };

  return (vars: VariableAlias | VariableAlias[] | undefined) => {
    return Array.isArray(vars)
      ? vars?.map((variable) => `{${getVariableRef(variable)}}`).join(' ')
      : vars && `{${getVariableRef(vars)}}`;
  };
};
