import type { DesignTokenVariableStructure } from '../parsers';

/**
 * Determine if the variable should be rendered, based on Otter Extension information
 * @param variable Parsed Design Token
 */
export const shouldDefineVariableValueFromOtterInfo = (variable: DesignTokenVariableStructure) => !variable.extensions.o3rPrivate;
