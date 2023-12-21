import type { DesignTokenVariableStructure } from '../parsers';

/**
 * Indicate that the variable is private based on the Otter extension
 * @param variable Parsed Design Token
 * @returns true if private variable
 */
export const isO3rPrivateVariable = (variable: DesignTokenVariableStructure) => !!variable.extensions.o3rPrivate;
