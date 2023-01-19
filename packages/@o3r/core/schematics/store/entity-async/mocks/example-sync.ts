export const asyncEntitySyncContent = `import { reviveExample } from '@api/sdk';

import {asyncEntitySerializer, Serializer} from '@o3r/core';
import {exampleAdapter, exampleInitialState} from './example.reducer';
import {ExampleState} from './example.state';

export const exampleStorageSerializer = asyncEntitySerializer;

export const exampleStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return exampleInitialState;
  }
  const storeObject = exampleAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = reviveExample(rawObject.entities[id]);
  }
  return storeObject;
};

export const exampleStorageSync: Serializer<ExampleState> = {
  serialize: exampleStorageSerializer,
  deserialize: exampleStorageDeserializer
};

`;
