/**
 * Retrieves the path corresponding to a given Design Token name.
 * @param name The name of the Token as it is defined in Figma.
 */
export const getPathFromName = (name: string) => name.split('/');

/**
 * Converts a given name string into a reference
 * @param name The input name string to be converted into a reference.
 */
export const convertNameToReference = (name: string) => getPathFromName(name)
  .map((part) => part.replace(/\s/g, '-'))
  .join('.');
