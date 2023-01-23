export const asyncSimpleSyncContent = `import { reviveExample } from '@api/sdk';

import {asyncSerializer, Serializer} from '@o3r/core';
import {exampleInitialState} from './example.reducer';
import {ExampleState} from './example.state';

export const exampleStorageSerializer = asyncSerializer;

export const exampleStorageDeserializer = (rawObject: any) => {
  return { ...exampleInitialState, model: (rawObject&&rawObject.model) ? reviveExample(rawObject.model) : null } as ExampleState;
};

export const exampleStorageSync: Serializer<ExampleState> = {
  serialize: exampleStorageSerializer,
  deserialize: exampleStorageDeserializer
};

`;
