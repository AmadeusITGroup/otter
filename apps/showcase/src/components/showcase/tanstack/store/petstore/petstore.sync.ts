import { revivePet } from '@ama-sdk/showcase-sdk';

import {asyncEntitySerializer, Serializer} from '@o3r/core';
import {petstoreAdapter, petstoreInitialState} from './petstore.reducer';
import {PetstoreState} from './petstore.state';

export const petstoreStorageSerializer = asyncEntitySerializer;

export const petstoreStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return petstoreInitialState;
  }
  const storeObject = petstoreAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = revivePet(rawObject.entities[id]);
  }
  return storeObject;
};

export const petstoreStorageSync: Serializer<PetstoreState> = {
  serialize: petstoreStorageSerializer,
  deserialize: petstoreStorageDeserializer
};
