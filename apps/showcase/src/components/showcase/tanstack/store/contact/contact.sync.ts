import { ContactModel } from './contact.state';


import {asyncEntitySerializer, Serializer} from '@o3r/core';
import {contactAdapter, contactInitialState} from './contact.reducer';
import {ContactState} from './contact.state';

export const contactStorageSerializer = asyncEntitySerializer;

export const contactStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return contactInitialState;
  }
  const storeObject = contactAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = rawObject.entities[id] as ContactModel;

  }
  return storeObject;
};

export const contactStorageSync: Serializer<ContactState> = {
  serialize: contactStorageSerializer,
  deserialize: contactStorageDeserializer
};
