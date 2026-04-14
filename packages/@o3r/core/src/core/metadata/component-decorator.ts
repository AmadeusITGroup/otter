import type {
  Translation,
} from '../interfaces';

/** Type of component */
export type ComponentType = 'Block' | 'Page' | 'ExposedComponent' | 'Component';

/**
 * Information about an Otter component to provide
 */
export interface OtterComponentInfoToProvide {
  /** Type of component */
  componentType: ComponentType;
}

/**
 * Information about an Otter component
 */
export interface OtterComponentInfo extends OtterComponentInfoToProvide {
  /** Configuration ID */
  configId?: string;
  /** Translation keys */
  translations?: Translation;
  /** Component Name */
  componentName: string;
}

/**
 * Private field where Otter component information are stored
 */
export const otterComponentInfoPropertyName = '__otter-info__';

/**
 * Decorates an Angular component to provide Otter information
 * @param info Information to define the Otter component
 * @returns the component with the information
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- decorator should be PascalCase
export function O3rComponent(info: OtterComponentInfoToProvide) {
  return <T extends new (...args: any[]) => object>(constructor: T) => {
    const componentName = constructor.name;
    constructor.prototype[otterComponentInfoPropertyName] = { ...info, componentName };
    return constructor;
  };
}
