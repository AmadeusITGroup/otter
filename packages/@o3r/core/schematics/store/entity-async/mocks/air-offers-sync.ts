export const asyncEntitySyncContent = `import { reviveAirOffer } from '@dapi/sdk';

import {asyncEntitySerializer, Serializer} from '@o3r/core';
import {airOffersAdapter, airOffersInitialState} from './air-offers.reducer';
import {AirOffersState} from './air-offers.state';

export const airOffersStorageSerializer = asyncEntitySerializer;

export const airOffersStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return airOffersInitialState;
  }
  const storeObject = airOffersAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = reviveAirOffer(rawObject.entities[id]);
  }
  return storeObject;
};

export const airOffersStorageSync: Serializer<AirOffersState> = {
  serialize: airOffersStorageSerializer,
  deserialize: airOffersStorageDeserializer
};

`;
