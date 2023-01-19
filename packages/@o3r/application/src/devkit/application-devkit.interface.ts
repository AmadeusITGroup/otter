import type { ConnectContentMessage, DevtoolsCommonOptions, MessageDataTypes, OtterMessageContent, RequestMessagesContentMessage } from '@o3r/core';

export interface ApplicationDevtoolsServiceOptions extends DevtoolsCommonOptions {
}

/**
 * Session information used to track all the calls done by one or several APIs of the SDK.
 */
export interface SessionInformation {
  /**
   * The session ID
   */
  id: string;
  /**
   * The generated time
   */
  generatedTime: Date;
}

/** Information relative loaded application */
export interface ApplicationInformation {
  /** Application Version */
  appVersion: string;
  /**
   * Session Information
   *
   * @note This is a session ID will be provided only with the Amadeus Otter implementation of the application package.
   */
  session?: SessionInformation;
  /**
   * Log Link
   *
   * @note This a link to Alf logs, it will be provided only with the Amadeus Otter implementation of the application package.
   */
  logLink?: string;
  /** Is Production Environment */
  isProduction: boolean;
}

/** Toggle Visual Testing */
export interface ToggleVisualTestingMessage extends OtterMessageContent<'toggleVisualTesting'> {
  /** Toggle the visual testing mode */
  toggle?: boolean;
}


/** Application Information Message Content */
export interface ApplicationInformationContentMessage extends ApplicationInformation, OtterMessageContent<'applicationInformation'> {
}

type ApplicationMessageContents =
  | ApplicationInformationContentMessage
  | ToggleVisualTestingMessage;

/** List of possible DataTypes for Application messages */
export type ApplicationMessageDataTypes = MessageDataTypes<ApplicationMessageContents>;

/** List of all messages for application purpose */
export type AvailableApplicationMessageContents =
  | ApplicationMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<ApplicationMessageDataTypes>;

/**
 * Determine if the given message is a Application message
 *
 * @param message message to check
 */
export const isApplicationMessage = (message: any): message is AvailableApplicationMessageContents => {
  return message && (
    message.dataType === 'toggleVisualTesting' ||
    message.dataType === 'applicationInformation' ||
    message.dataType === 'requestMessages' ||
    message.dataType === 'connect');
};
