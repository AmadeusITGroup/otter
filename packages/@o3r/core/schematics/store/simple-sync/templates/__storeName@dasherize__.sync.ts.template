import {Serializer} from '@o3r/core';
import {<%= cStoreName %>InitialState} from './<%= fileName %>.reducer';
import {<%= storeName %>State} from './<%= fileName %>.state';

export const <%= cStoreName %>StorageDeserializer = (rawObject: any) => {
  return {...<%= cStoreName %>InitialState, ...rawObject} as <%= storeName %>State;
};

export const <%= cStoreName %>StorageSync: Serializer<<%= storeName %>State> = {
  deserialize: <%= cStoreName %>StorageDeserializer
};
