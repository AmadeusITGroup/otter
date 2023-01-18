import {strings} from '@angular-devkit/core';

/**
 * Returns all elements from the provided component name path
 *
 * @param componentName
 */
function getComponentModuleItems(componentName: string): string[] {
  return (componentName || '').split('\\/');
}

/**
 * Returns the component name as the last element of the provided component name path
 *
 * @param componentName
 */
export function getInputComponentName(componentName: string): string {
  const componentModuleItems = getComponentModuleItems(componentName);
  return componentModuleItems[componentModuleItems.length - 1];
}

/**
 * returns the component folder name
 *
 * @param componentName
 */
export function getComponentFolderName(componentName: string): string {
  const inputComponentName = getInputComponentName(componentName);
  return strings.dasherize(inputComponentName)!.replace(/\s/g, '');
}

/**
 * Returns the component file name
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentFileName(componentName: string, componentStructureDef: string): string {
  const componentFolderName = getComponentFolderName(componentName);
  return componentStructureDef ? `${componentFolderName}-${strings.camelize(componentStructureDef)}` : componentFolderName;
}

/**
 * Returns the component selector without suffix
 *
 * @param componentName
 * @param prefix
 */
export function getComponentSelectorWithoutSuffix(componentName: string, prefix: string | null) {
  const selector = getComponentFolderName(componentName);
  return prefix ? `${prefix.toLowerCase()}-${selector}` : selector; // o3r-air-offer : air-offer
}

/**
 * Returns the component module name (e.g. AirOfferModule)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentModuleName(componentName: string, componentStructureDef: string) {
  const inputComponentName = getInputComponentName(componentName);
  return `${strings.classify(inputComponentName)}${strings.classify(componentStructureDef)}Module`;
}

/**
 * Returns the component analytics name (e.g. AirOfferAnalytics)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentAnalyticsName(componentName: string, componentStructureDef: string) {
  const inputComponentName = getInputComponentName(componentName);
  return `${strings.classify(inputComponentName)}${strings.classify(componentStructureDef)}Analytics`;
}

/**
 * Returns the component name (e.g. AirOfferComponent)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentName(componentName: string, componentStructureDef: string) {
  const inputComponentName = getInputComponentName(componentName);
  return `${strings.classify(inputComponentName)}${strings.classify(componentStructureDef)}Component`;
}

/**
 * Returns the component block name (e.g. AirOffer)
 *
 * @param componentName
 */
export function getComponentBlockName(componentName: string) {
  const inputComponentName = getInputComponentName(componentName);
  return strings.classify(inputComponentName);
}

/**
 * Return the component in kebab-case (e.g. air-offer)
 *
 * @param blockName
 */
export function getKebabCaseBlockName(blockName: string) {
  return strings.dasherize(blockName);
}

/**
 * Returns the component config name (e.g. AirOfferConfig)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentConfigName(componentName: string, componentStructureDef: string) {
  const inputComponentName = getInputComponentName(componentName);
  return `${strings.classify(inputComponentName)}${strings.classify(componentStructureDef)}Config`;
}

/**
 * Returns the component translation name (e.g. AirOfferTranslation)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentTranslationName(componentName: string, componentStructureDef: string) {
  const inputComponentName = getInputComponentName(componentName);
  return `${strings.classify(inputComponentName)}${strings.classify(componentStructureDef)}Translation`;
}

/**
 * Returns the component context name (e.g. AirOfferContext)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentContextName(componentName: string, componentStructureDef: string) {
  const inputComponentName = getInputComponentName(componentName);
  return `${strings.classify(inputComponentName)}${strings.classify(componentStructureDef)}Context`;
}

/**
 * Returns the component fixture name (e.g. AirOfferFixture)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentFixtureName(componentName: string, componentStructureDef: string) {
  const inputComponentName = getInputComponentName(componentName);
  return `${strings.classify(inputComponentName)}${strings.classify(componentStructureDef)}Fixture`;
}

/**
 * Returns the component config key name (e.g. AIR_OFFER_CONT or AIR_OFFER_PRES)
 *
 * @param componentName
 * @param componentStructureDef
 */
export function getComponentConfigKey(componentName: string, componentStructureDef: string) {
  const componentFileName = getComponentFileName(componentName, componentStructureDef);
  return `${strings.underscore(componentFileName).toUpperCase()}`;
}

/**
 * Return the library name from path in a monorepos
 *
 * @param path
 */
export function getLibraryNameFromPath(path: string | null) {
  if (!path) {
    return null;
  }
  const libNameRes = /@[^/]*\/[^/]*/.exec(path.replace(/\\/g, '/'));
  return libNameRes && libNameRes[0];
}
