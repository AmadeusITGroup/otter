import type { DesignTokenVariableStructure } from '../parsers';

/**
 * Indicate that the variable should not be defined because flagged as private
 * @param variable Parsed Design Token
 * @return false if private variable
 */
export const isNotPrivateVariable = (variable: DesignTokenVariableStructure) => !variable.extensions.o3rPrivate;
