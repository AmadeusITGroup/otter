import type {
  Collection,
  VariablesData,
} from '../contract';

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
figma.ui.onmessage = async (msg: { type: string; data: any }) => {
  const colorVars: { key: string; value: string }[] = [];
  if (msg.type === 'store-vars') {
    const varData = msg.data as VariablesData;
    const excludedKeys = new Set(varData.filter.split(','));
    // shades input come as line seprated values, even lines represent the palette name (0, 0.5 etc) and odd ones the colors in hex format
    const shadesInput = varData.shadesInput.split('\n');
    for (let i = 0; i < shadesInput.length; i += 2) {
      const key = (Number.parseFloat(shadesInput[i]) * 10).toString().padStart(2, '0');
      if (!excludedKeys.has(key)) {
        const value = shadesInput[i + 1];
        colorVars.push({ key, value });
      }
    }
    const collection = await figma.variables.getVariableCollectionByIdAsync(varData.collectionId);
    const variables = await figma.variables.getLocalVariablesAsync();
    for (const colorVar of colorVars) {
      const varName = `color/${varData.paletteName}/${colorVar.key}`;
      const existingVar = variables.find((variable) => variable.name === varName);
      if (existingVar) {
        existingVar.setValueForMode(varData.modeId, figma.util.rgb(colorVar.value));
      } else if (collection) {
        const newVar = figma.variables.createVariable(varName, collection, 'COLOR');
        newVar.setValueForMode(varData.modeId, figma.util.rgb(colorVar.value));
      }
    }
  }
};

void initialize();
