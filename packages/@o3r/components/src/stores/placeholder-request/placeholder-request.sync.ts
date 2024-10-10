import { PlaceholderRequestModel } from './placeholder-request.state';
import { asyncEntitySerializer, Serializer } from '@o3r/core';
import { placeholderRequestAdapter, placeholderRequestInitialState } from './placeholder-request.reducer';
import { PlaceholderRequestState } from './placeholder-request.state';

export const placeholderRequestStorageSerializer = asyncEntitySerializer;

export const placeholderRequestStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return placeholderRequestInitialState;
  }
  const storeObject = placeholderRequestAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = rawObject.entities[id] as PlaceholderRequestModel;

  }
  return storeObject;
};

export const placeholderRequestStorageSync = {
  serialize: placeholderRequestStorageSerializer,
  deserialize: placeholderRequestStorageDeserializer
} as const satisfies Serializer<PlaceholderRequestState>;
