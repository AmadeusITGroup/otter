import {
  configurationAdapter,
  configurationInitialState,
} from './configuration.reducer';
import {
  ConfigurationState,
} from './configuration.state';

export const configurationStorageSync = {
  deserialize: (rawObject: any) => {
    if (!rawObject || !rawObject.ids) {
      return configurationInitialState;
    }
    const storeObject = configurationAdapter.getInitialState<ConfigurationState>(rawObject);
    return storeObject as ConfigurationState;
  }
};
