/**
 * Compute the name of the component with the library's name to generate unique component identifier used in metadata and different modules
 * @param componentName Name of the component to get the configuration
 * @param libraryName Name of the library the component is coming from
 */
export function computeItemIdentifier(componentName: string, libraryName?: string) {
  return (libraryName ? libraryName + '#' : '') + componentName;
}
