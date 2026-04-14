import {
  type GetLocalVariables200ResponseMeta,
  isRGBA,
  isVariableAlias,
} from '@ama-styling/figma-sdk';
import {
  VARIABLE_NAME_PATH_SEPARATOR,
} from '../../constants';
import {
  getRgbaColorHex,
} from '../../helpers/color-hex-helpers';
import {
  convertNameToReference,
} from '../../helpers/name-to-reference';
import type {
  DesignToken,
  FigmaFileContext,
} from '../../interfaces';

/** Options to {@link getTokensFromLocalVariables} */
export interface TokenFromVariablesOptions extends FigmaFileContext {
  /** Identification of the Mode defined in Figma  */
  modeId: string;

  /** Identification of the Collection defined in Figma  */
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
        .map(({ name }) => name.substring(0, name.lastIndexOf(VARIABLE_NAME_PATH_SEPARATOR)))
    )
  ];
  const filteredVariableIds = variableCollections[options.collectionId].variableIds;

  return Object.entries(variables)
    .filter(([id, variable]) => filteredVariableIds.includes(id) && !variable.remote)
    .reduce((acc: any, [,variable]) => {
      const value = variable.valuesByMode[options.modeId];
      const resolvedVariable: DesignToken = {
        $value: undefined,
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
        variable.name.split(VARIABLE_NAME_PATH_SEPARATOR)
          .reduce((loop, part) => {
            loop[part] ||= {};
            return loop[part];
          }, acc),
        resolvedVariable
      );

      return acc;
    }, {});
};
