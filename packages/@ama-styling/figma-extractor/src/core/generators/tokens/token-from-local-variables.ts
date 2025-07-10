import {
  type GetLocalVariables200ResponseMeta,
  isRGBA,
  isVariableAlias,
} from '@ama-styling/figma-sdk';
import {
  getRgbaColorHex,
} from '../../helpers/color-hex.helpers';
import {
  convertNameToReference,
  getPathFromName,
} from '../../helpers/name-to-reference';
import type {
  DesignToken,
  FigmaFileContext,
} from '../../interfaces';

/** Options to {@link getTokensFromLocalVariables} */
export interface TokenFromVariablesOptions extends FigmaFileContext {
  /**  */
  modeId: string;

  collectionId: string;

  /** Default unit to apply to number when not excluded */
  defaultUnit?: string;
}

/**
 * Get Design Token from Local variables
 * @param localVariablesResponse List of variables response from Figma
 * @param unitLessVariableIds List of variables flagged to be provided without units
 * @param options Context options
 */
export const getTokensFromLocalVariables = (
  localVariablesResponse: GetLocalVariables200ResponseMeta,
  unitLessVariableIds: string[],
  options: TokenFromVariablesOptions
) => {
  const { variables, variableCollections } = localVariablesResponse;
  const unitLessGroups = [
    ...new Set(
      unitLessVariableIds
        .map((id) => variables[id])
        .filter((variable) => !!variable)
        .map(({ name }) => name.split('/').slice(0, -1).join('/'))
    )
  ];
  const filteredVariableIds = variableCollections[options.collectionId].variableIds;

  return Object.entries(variables)
    .filter(([id, variable]) => filteredVariableIds.includes(id) && !variable.remote)
    .reduce((acc: any, [,variable]) => {
      const value = variable.valuesByMode[options.modeId];
      const resolvedVariable: DesignToken = {
        $value: undefined,
        $type: undefined,
        $description: variable.description || undefined
      };

      if (isRGBA(value)) {
        resolvedVariable.$type = 'color';
        resolvedVariable.$value = getRgbaColorHex(value);
      } else if (isVariableAlias(value)) {
        if (variables[value.id]) {
          resolvedVariable.$value = `{${convertNameToReference(variables[value.id].name)}}`;
        } else {
          options?.logger?.error?.(`Cannot resolve ${value.id} from ${variable.name}.`);
          return acc;
        }
      } else {
        resolvedVariable.$type = typeof value === 'number' ? 'dimension' : 'string';
        resolvedVariable.$value = resolvedVariable.$type === 'dimension' && !unitLessGroups.some((group) => variable.name.startsWith(group))
          ? `${value}${options?.defaultUnit || 'px'}`
          : value;
      }

      Object.assign(
        getPathFromName(variable.name)
          .reduce((loop, part) => {
            loop[part] ||= {};
            return loop[part];
          }, acc),
        resolvedVariable
      );

      return acc;
    }, {});
};
