import type { ConnectContentMessage, DevtoolsCommonOptions, MessageDataTypes, OtterMessageContent, RequestMessagesContentMessage } from '@o3r/core';

export interface LocalizationDevtoolsServiceOptions extends DevtoolsCommonOptions {
}

/** Display localization key message content */
export interface DisplayLocalizationKeysContentMessage extends OtterMessageContent<'displayLocalizationKeys'> {
  /** Toggle the display of the localization keys */
  toggle?: boolean;
}

type LocalizationMessageContents =
  | DisplayLocalizationKeysContentMessage;

/** List of possible DataTypes for Localization messages */
type LocalizationMessageDataTypes = MessageDataTypes<LocalizationMessageContents>;

/** List of all messages for Localization purpose */
export type AvailableLocalizationMessageContents =
  | LocalizationMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<LocalizationMessageDataTypes>;
