import {EntryCustomComponents} from '@otter/common';

export function registerCustomComponents(): Map<string, any> {
  return new Map();
}

export function initializeEntryComponents(): EntryCustomComponents  {
  return {
    customComponents: [],
    customComponentsModules: []
  };
}
