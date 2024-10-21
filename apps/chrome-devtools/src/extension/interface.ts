import type {
  OtterMessage,
  OtterMessageContent
} from '@o3r/core';
import type {
  AvailableMessageContents
} from '../services/message.interface';

/** Message from the DevTools message */
export interface ExtensionMessage<T extends OtterMessageContent = AvailableMessageContents> extends OtterMessage<T> {
  /** Destination tab ID */
  tabId: number;
}

export interface StateOverride {
  /**
   * Key is the configuration identifier
   * Value is the new configuration value
   */
  configurations?: Record<string, any>;
  /**
   * First key is the language
   * Second key is the localization key
   * Value is the new localization value
   */
  localizations?: Record<string, Record<string, string>>;
  /**
   * Key is the variable name
   * Value is the new variable value
   */
  stylingVariables?: Record<string, string>;
}

export interface State extends StateOverride {
  /** Color to easily identify a state */
  color: string;
  /** * Color contrast */
  colorContrast: string;
  /** Identifier of the state */
  name: string;
}

/** Key of the states in the storage */
export const STATES_KEY = 'STATES';
/** Key of the active state name in the storage */
export const ACTIVE_STATE_NAME_KEY = 'ACTIVE_STATE_NAME';
/** Key of the whitelisted hosts in the storage */
export const WHITELISTED_HOSTS_KEY = 'WHITELISTED_HOSTS';
