import { revivePet } from '@ama-sdk/showcase-sdk';

import {asyncEntitySerializer, Serializer} from '@o3r/core';
import {petAdapter, petInitialState} from './pet.reducer';
import {PetState} from './pet.state';

export const petStorageSerializer = asyncEntitySerializer;

export const petStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return petInitialState;
  }
  const storeObject = petAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = revivePet(rawObject.entities[id]);
  }
  return storeObject;
};

export const petStorageSync: Serializer<PetState> = {
  serialize: petStorageSerializer,
  deserialize: petStorageDeserializer
};
