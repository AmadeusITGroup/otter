import type {
  Collection,
  PaletteData,
} from '../contract';

/**
 * Message received by the Figma UI.
 */
interface PluginMessage {
  /** The type of the message. */
  type: string;
  /** The data payload of the message. */
  data: any;
}

/**
 * Template object for PaletteData with all keys set to undefined.
 */
const paletteTemplate: Record<keyof PaletteData, undefined> = {
  filter: undefined,
  shadesInput: undefined,
  collectionId: undefined,
  paletteName: undefined,
  modeId: undefined
};
/**
 * Array of keys for the PaletteData type.
 */
const paletteDataKeys = Object.keys(paletteTemplate) as (keyof PaletteData)[];

/**
 * Is a valid object of type T
 * @param obj input object
 * @param keys the keys of the object
 */
function validateObject<T>(obj: any, keys: (keyof T)[]): obj is T {
  return obj && typeof obj === 'object' && keys.every((key) => key in obj);
}

/**
 * Initializes the plugin by fetching collections and color variables,
 * then sends the data to the UI.
 */
async function initialize() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const colorVars = await figma.variables.getLocalVariablesAsync('COLOR');
  const collectionsForUi: Collection[] = collections.map((collection) => {
    const collectionPalettes = Array.from(new Set(colorVars
      .filter((v) => v.variableCollectionId === collection.id && v.name.startsWith('color/'))
      .map((variable) => variable.name.split('/')[1])));
    return { id: collection.id, name: collection.name, modes: collection.modes, palettes: collectionPalettes };
  });
  figma.showUI(__html__, { width: 400, height: 670 });
  if (collectionsForUi.length > 0) {
    figma.ui.postMessage({ type: 'collections', data: collectionsForUi });
  } else {
    figma.ui.postMessage({ type: 'no-collections' });
  }
}

// eslint-disable-next-line unicorn/prefer-add-event-listener -- Figma API
figma.ui.onmessage = async (msg: PluginMessage) => {
  const colorVars: { key: string; value: string }[] = [];
  const pData = msg.data;
  if (msg.type === 'store-vars' && validateObject(pData, paletteDataKeys)) {
    const excludedKeys = new Set(pData.filter.split(','));
    // shades input comes as line-separated values, even lines represent the palette names (0, 0.5 etc) and odd ones the colors in hex format
    const shadesInput = pData.shadesInput.split('\n');
    for (let i = 0; i < shadesInput.length; i += 2) {
      const key = (Number.parseFloat(shadesInput[i]) * 10).toString().padStart(2, '0');
      if (!excludedKeys.has(key)) {
        const value = shadesInput[i + 1];
        colorVars.push({ key, value });
      }
    }
    const collection = await figma.variables.getVariableCollectionByIdAsync(pData.collectionId);
    const variables = await figma.variables.getLocalVariablesAsync();
    for (const colorVar of colorVars) {
      const varName = `color/${pData.paletteName}/${colorVar.key}`;
      const existingVar = variables.find((variable) => variable.name === varName);
      if (existingVar) {
        existingVar.setValueForMode(pData.modeId, figma.util.rgb(colorVar.value));
      } else if (collection) {
        const newVar = figma.variables.createVariable(varName, collection, 'COLOR');
        newVar.setValueForMode(pData.modeId, figma.util.rgb(colorVar.value));
      }
    }
  }
};

void initialize();
