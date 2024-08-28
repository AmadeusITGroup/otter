import type { DesignContentFileUpdater } from '../design-token.renderer.interface';

/** Options for {@link getDesignTokenStyleContentUpdater} */
export interface DesignTokenStyleContentUpdaterOptions {
}

const mergeValue = (tokenObject: Record<string, any>, newValue: Record<string, any>) => {
  return Object.entries(newValue)
    .reduce((acc, [key, value]) => {
      acc[key] = acc[key] ? mergeValue(acc[key], value) : value;
      return acc;
    }, { ...tokenObject });
};

/**
 * Retrieve a Content Updater function for Metadata generator
 * @param _options
 */
export const getDesignTokenStyleContentUpdater = (_options?: DesignTokenStyleContentUpdaterOptions): DesignContentFileUpdater => {
  return (variables: string[]) => {
    const nodes: Record<string, any>[] = JSON.parse(`[${variables.join(',')}]`);
    const res = nodes.reduce(mergeValue, {} as Record<string, any>);
    return JSON.stringify(res, null, 2);
  };
};
