import type {
  LocalVariableCollectionModesInner,
  StyleType,
} from '@ama-styling/figma-sdk';
import {
  styleTypeMapping,
} from '../generators/styles/interfaces';

/**
 * Retrieve the name of a styling file
 * @param styleType Style type
 */
export const getStyleFileName = (styleType: StyleType) => {
  const styleLabel = styleTypeMapping[styleType];
  return `${styleLabel}.styles.tokens.json`;
};

/**
 * Retrieve the name of a token collection file
 * @param collectionName Name of the collection
 * @param mode Selected theme mode
 */
export const getCollectionFileName = (collectionName: string, mode: Pick<LocalVariableCollectionModesInner, 'name'>) => {
  return `${collectionName.replace(/\.json5?$/, '')}.${mode.name}.tokens.json`;
};
