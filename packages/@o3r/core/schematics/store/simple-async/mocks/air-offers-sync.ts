export const asyncSimpleSyncContent = `import { reviveAirOffer } from '@dapi/sdk';

import {asyncSerializer, Serializer} from '@o3r/core';
import {airOffersInitialState} from './air-offers.reducer';
import {AirOffersState} from './air-offers.state';

export const airOffersStorageSerializer = asyncSerializer;

export const airOffersStorageDeserializer = (rawObject: any) => {
  return { ...airOffersInitialState, model: (rawObject&&rawObject.model) ? reviveAirOffer(rawObject.model) : null } as AirOffersState;
};

export const airOffersStorageSync: Serializer<AirOffersState> = {
  serialize: airOffersStorageSerializer,
  deserialize: airOffersStorageDeserializer
};

`;
