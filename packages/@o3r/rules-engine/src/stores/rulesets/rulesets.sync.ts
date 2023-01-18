import { asyncStoreItemAdapter, Serializer } from '@o3r/core';
import { rulesetsAdapter, rulesetsInitialState } from './rulesets.reducer';
import { RulesetsModel, RulesetsState } from './rulesets.state';

export const rulesetsStorageSerializer = (state: RulesetsState) => {
  return asyncStoreItemAdapter.clearAsyncStoreItem(state);
};

export const rulesetsStorageDeserializer = (rawObject: any) => {
  if (!rawObject || !rawObject.ids) {
    return rulesetsInitialState;
  }
  const storeObject = rulesetsAdapter.getInitialState(rawObject);
  for (const id of rawObject.ids) {
    storeObject.entities[id] = rawObject.entities[id] as RulesetsModel;
  }
  return storeObject;
};

export const rulesetsStorageSync: Serializer<RulesetsState> = {
  serialize: rulesetsStorageSerializer,
  deserialize: rulesetsStorageDeserializer
};
