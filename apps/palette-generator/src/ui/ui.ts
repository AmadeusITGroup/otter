import type {
  Collection,
  PaletteData,
} from '../contract';

function updateDropdown<T>(dropdownId: string, items: T[], getValue: (item: T) => string, getText: (item: T) => string): void {
  const dropdown = document.querySelector(dropdownId) as HTMLSelectElement;
  dropdown.innerHTML = '';
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = getValue(item);
    option.textContent = getText(item);
    fragment.append(option);
  });
  dropdown.append(fragment);
}

function updateModesDropdown(modes: { modeId: string; name: string }[]): void {
  updateDropdown('#modesDropdown', modes, (mode) => mode.modeId, (mode) => mode.name);
}

function updatePaletteNameDropdown(palettes: string[]): void {
  updateDropdown('#paletteNameDropdown', palettes, (palette) => palette, (palette) => palette);
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

    const data: PaletteData = { paletteName, shadesInput, filter, collectionId, modeId };
    parent.postMessage({ pluginMessage: { type: 'store-vars', data } }, '*');
  });

  let collections: Collection[] = [];
  window.addEventListener('message', (event: MessageEvent) => {
    const message = event.data.pluginMessage;
    if (message && message.type === 'collections') {
      collections = message.data;
      updateDropdown('#collectionsDropdown', collections, (collection) => collection.id, (collection) => collection.name);
      if (collections.length > 0) {
        updateModesDropdown(collections[0].modes);
        updatePaletteNameDropdown(collections[0].palettes);
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
