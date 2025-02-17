import type {
  Collection,
  VariablesData,
} from '../contract';

function updateModesDropdown(modes: { modeId: string; name: string }[]): void {
  const modesDropdown = document.querySelector('#modesDropdown') as HTMLSelectElement;
  modesDropdown.innerHTML = '';
  modes.forEach((mode) => {
    const option = document.createElement('option');
    option.value = mode.modeId;
    option.textContent = mode.name;
    modesDropdown.append(option);
  });
}

function updatePaletteNameDropdown(palettes: string[]): void {
  const paletteNameDropdown = document.querySelector('#paletteNameDropdown') as HTMLSelectElement;
  paletteNameDropdown.innerHTML = '';
  palettes.forEach((palette) => {
    const option = document.createElement('option');
    option.value = palette;
    option.textContent = palette;
    paletteNameDropdown.append(option);
  });
}

function getElementValue(selector: string): string {
  const element = document.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
  return element.value;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#add-vars')!.addEventListener('click', () => {
    const paletteName = getElementValue('#paletteNameDropdown');
    const shadesInput = getElementValue('#shadesInput');
    const filter = getElementValue('#filter');
    const collectionId = getElementValue('#collectionsDropdown');
    const modeId = getElementValue('#modesDropdown');

    const data: VariablesData = { paletteName, shadesInput, filter, collectionId, modeId };
    parent.postMessage({ pluginMessage: { type: 'store-vars', data } }, '*');
  });

  let collections: Collection[] = [];
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.data.pluginMessage) {
      const message = event.data.pluginMessage;
      if (message.type === 'collections') {
        collections = message.data;
        const dropdown = document.querySelector('#collectionsDropdown') as HTMLSelectElement;
        collections.forEach((collection) => {
          const option = document.createElement('option');
          option.value = collection.id;
          option.textContent = collection.name;
          dropdown.append(option);
        });
        if (collections.length > 0) {
          updateModesDropdown(collections[0].modes);
          updatePaletteNameDropdown(collections[0].palettes);
        }
      }
    }
  });

  document.querySelector('#collectionsDropdown')!.addEventListener('change', (event) => {
    const selectedCollection = collections.find((collection) => collection.id === (event.target as HTMLSelectElement).value);
    if (selectedCollection) {
      updateModesDropdown(selectedCollection.modes);
      updatePaletteNameDropdown(selectedCollection.palettes);
    }
  });
});
