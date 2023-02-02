import {otterComponentInfoPropertyName} from '@o3r/core';

export interface OtterLikeComponentInfo {
  /** Container information */
  container?: OtterLikeComponentInfo;
  /** Configuration ID */
  configId?: string;
  /** Component name */
  componentName: string;
  /** Component translation */
  translations?: Record<string, string[]>;
  /** Component analytics */
  analytics?: Record<string, string[]>;
}

/**
 * Otter inspector css class
 */
export const INSPECTOR_CLASS = 'otter-devtools-inspector';

/**
 * Determine if a node is an Otter container
 *
 * @param node Element to check
 * @returns true if the node is an Otter container
 */
export const isContainer = (node: Element | undefined | null): node is Element => {
  return !!node?.tagName.toLowerCase().endsWith('cont');
};

/**
 * Determine the config id of a component instance
 *
 * @param instance component instance
 * @returns the config id of the component instance
 */
export const getConfigId = (instance: any) => {
  return instance[otterComponentInfoPropertyName]?.configId;
};

/**
 * Recursive method to determin the translations of a node
 *
 * @param node HTMLElement to check
 * @param rec recursive method
 * @returns the trasnslations associated to their component name
 */
export function getTranslationsRec(node: Element | null, rec: typeof getTranslationsRec): Record<string, string[]> | undefined {
  const angularDevTools = (window as any).ng;
  const o3rInfoProperty: typeof otterComponentInfoPropertyName = '__otter-info__';
  if (!node || !angularDevTools) {
    return;
  }
  const component = angularDevTools.getComponent(node);
  const subTranslations: (Record<string, string[]> | undefined)[] = Array.from(node.children).map((child) => rec(child, rec));
  const translations: Record<string, string[]> = {};
  subTranslations.forEach((s) => {
    Object.entries(s || {}).forEach(([k, v]) => {
      if (v.length) {
        translations[k] = v;
      }
    });
  });
  if (component) {
    const componentName: string = component.constructor.name;
    const componentTranslations = Object.values<string>(component[o3rInfoProperty]?.translations || {}).filter((t) => typeof t === 'string');
    if (componentTranslations.length) {
      translations[componentName] = componentTranslations;
    }
  }
  return Object.keys(translations).length ? translations : undefined;
}

/**
 * Determine the translations of a node
 *
 * @param node HTMLElement to check
 * @returns the translations associated to their component name
 */
export const getTranslations = (node: Element | null): Record<string, string[]> | undefined => getTranslationsRec(node, getTranslations);

/**
 * Recursive method to determine the analytics of a node
 *
 * @param node Element to check
 * @param rec recursive method
 * @returns the analytics associated to their component name
 */
export function getAnalyticEventsRec(node: Element | null, rec: typeof getAnalyticEventsRec): Record<string, string[]> | undefined {
  const angularDevTools = (window as any).ng;
  const o3rInfoProperty: typeof otterComponentInfoPropertyName = '__otter-info__';
  if (!node || !angularDevTools) {
    return;
  }
  const component = angularDevTools.getComponent(node);
  const subEvents = Array.from(node.children).map((child) => rec(child, rec));
  const events: Record<string, string[]> = {};
  subEvents.forEach((s) => {
    Object.entries(s || {}).forEach(([k, v]) => {
      if (v.length) {
        events[k] = v;
      }
    });
  });
  if (component && component[o3rInfoProperty]) {
    const componentName: string = component.constructor.name;
    const componentEvents: string[] = Object.values<any>(component.analyticsEvents || {}).map((eventConstructor) => eventConstructor.name);
    if (componentEvents.length) {
      events[componentName] = componentEvents;
    }
  }
  return Object.keys(events).length ? events : undefined;
}

/**
 * Determine the analytics of a node
 *
 * @param node Element to check
 * @returns the analytics associated to their component name
 */
export const getAnalyticEvents = (node: Element | null): Record<string, string[]> | undefined => getAnalyticEventsRec(node, getAnalyticEvents);

/**
 * Determine all info from an Otter component
 *
 * @param componentClassInstance component instance
 * @param host HTML element hosting the component
 * @returns all info from an Otter component
 */
export const getOtterLikeComponentInfo = (componentClassInstance: any, host: Element): OtterLikeComponentInfo => {
  const configId = getConfigId(componentClassInstance);
  const translations = getTranslations(host);
  const analytics = getAnalyticEvents(host);
  return {
    componentName: componentClassInstance.constructor.name,
    configId,
    translations,
    analytics
  };
};
