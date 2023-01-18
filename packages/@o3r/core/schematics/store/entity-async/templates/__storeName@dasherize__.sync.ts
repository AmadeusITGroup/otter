<% if (!hasSDK) { %>import { <%= storeModelName %> } from './<%= fileName %>.state';
  <% } else { %>import { <%= reviverModelName %> } from '<%= sdkPackage %>';<% } %>

import {asyncEntitySerializer, Serializer} from '@o3r/core';
import {<%= cStoreName %>Adapter, <%= cStoreName %>InitialState} from './<%= fileName %>.reducer';
import {<%= storeName %>State} from './<%= fileName %>.state';

export const <%= cStoreName %>StorageSerializer = asyncEntitySerializer;

export const <%= cStoreName %>StorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return <%= cStoreName %>InitialState;
  }
  const storeObject = <%= cStoreName %>Adapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    <% if (!hasSDK) { %>storeObject.entities[id] = rawObject.entities[id] as <%= storeModelName %>;
      <% } else { %>storeObject.entities[id] = <%= reviverModelName %>(rawObject.entities[id]);<% } %>
  }
  return storeObject;
};

export const <%= cStoreName %>StorageSync: Serializer<<%= storeName %>State> = {
  serialize: <%= cStoreName %>StorageSerializer,
  deserialize: <%= cStoreName %>StorageDeserializer
};
