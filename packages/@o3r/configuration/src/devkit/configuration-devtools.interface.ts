import type { Dictionary } from '@ngrx/entity';
import type { ConnectContentMessage, DevtoolsCommonOptions, MessageDataTypes, OtterMessageContent, RequestMessagesContentMessage } from '@o3r/core';
import type { ConfigurationModel } from '../stores/index';

/** Option for Configuration devtools service */
export interface ConfigurationDevtoolsServiceOptions extends DevtoolsCommonOptions {
  /**
   * Default library name to use if not specified in the function call
   *
   * @default @o3r/components
   */
  defaultLibraryName: string;
  /**
   * Default JSON file name if not specified in the function
   *
   * @default partial-static-config.json
   */
  defaultJsonFilename: string;
}

export interface ConfigurationsMessage extends OtterMessageContent<'configurations'> {
  /** Configurations */
  configurations: Dictionary<ConfigurationModel>;
}

export interface UpdateConfigMessage extends OtterMessageContent<'updateConfig'> {
  /** Configuration ID */
  id: string;
  /** Configuration value */
  configValue: any;
}

type ConfigurationMessageContents =
  | ConfigurationsMessage
  | UpdateConfigMessage;

/** List of possible DataTypes for Configuration messages */
export type ConfigurationMessageDataTypes = MessageDataTypes<ConfigurationMessageContents>;

/** List of all messages for configuration purpose */
export type AvailableConfigurationMessageContents =
  | ConfigurationMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<ConfigurationMessageDataTypes>;

/**
 * Determine if the given message is a Configuration message
 *
 * @param message message to check
 */
export const isConfigurationMessage = (message: any): message is AvailableConfigurationMessageContents => {
  return message && (
    message.dataType === 'configurations' ||
    message.dataType === 'updateConfig' ||
    message.dataType === 'requestMessages' ||
    message.dataType === 'connect');
};
