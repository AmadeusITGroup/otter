<% if (!hasSDK) { %>import { <%= storeModelName %> } from './<%= fileName %>.state';
  <% } else { %>import { <%= reviverModelName %> } from '<%= sdkPackage %>';<% } %>

import {asyncSerializer, Serializer} from '@o3r/core';
import {<%if (isEntity) {%><%= cStoreName %>Adapter, <%}%><%= cStoreName %>InitialState} from './<%= fileName %>.reducer';
import {<%= storeName %>State} from './<%= fileName %>.state';

export const <%= cStoreName %>StorageSerializer = asyncSerializer;

export const <%= cStoreName %>StorageDeserializer = (rawObject: any) => {
  return {...<%= cStoreName %>InitialState,
    model: (rawObject && rawObject.model) ? <% if (hasSDK) {%><%= reviverModelName %>(rawObject.model)<% } else { %>rawObject.model as <%= storeModelName %> <% } %> : null
  } as <%= storeName %>State;
};

export const <%= cStoreName %>StorageSync: Serializer<<%= storeName %>State> = {
  serialize: <%= cStoreName %>StorageSerializer,
  deserialize: <%= cStoreName %>StorageDeserializer
};
