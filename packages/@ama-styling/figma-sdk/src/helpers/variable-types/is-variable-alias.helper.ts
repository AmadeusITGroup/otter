import type {
  VariableAlias,
} from '../../models';

/**
 * Determine if the value is of type {@link VariableAlias}
 * @param value
 */
export const isVariableAlias = (value: any): value is VariableAlias => {
  return typeof value === 'object'
    && (value as VariableAlias).type === 'VARIABLE_ALIAS'
    && typeof (value as VariableAlias).id === 'string';
};
