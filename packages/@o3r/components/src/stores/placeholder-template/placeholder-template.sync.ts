import {
  Serializer
} from '@o3r/core';
import {
  placeholderTemplateAdapter,
  placeholderTemplateInitialState
} from './placeholder-template.reducer';
import {
  PlaceholderTemplateModel,
  PlaceholderTemplateState
} from './placeholder-template.state';

export const placeholderTemplateStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return placeholderTemplateInitialState;
  }
  const storeObject = placeholderTemplateAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = rawObject.entities[id] as PlaceholderTemplateModel;
  }
  return storeObject;
};

export const placeholderTemplateStorageSync: Serializer<PlaceholderTemplateState> = {
  deserialize: placeholderTemplateStorageDeserializer
};
