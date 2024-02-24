import type { ConnectContentMessage, DevtoolsCommonOptions, MessageDataTypes, OtterMessageContent, RequestMessagesContentMessage } from '@o3r/core';
import { OtterLikeComponentInfo } from './inspector';

export interface ComponentsDevtoolsServiceOptions extends DevtoolsCommonOptions {
}

export interface SelectedComponentInfoMessage extends OtterLikeComponentInfo, OtterMessageContent<'selectedComponentInfo'> {
}

export interface ToggleInspectorMessage extends OtterMessageContent<'toggleInspector'> {
  /** Is the inspector running */
  isRunning: boolean;
}

type ComponentsMessageContents =
  | SelectedComponentInfoMessage
  | ToggleInspectorMessage;

/** List of possible DataTypes for Components messages */
export type ComponentsMessageDataTypes = MessageDataTypes<ComponentsMessageContents>;

/** List of all messages for Components purpose */
export type AvailableComponentsMessageContents =
  | ComponentsMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<ComponentsMessageDataTypes>;

/**
 * Determine if the given message is a Components message
 * @param message message to check
 */
export const isComponentsMessage = (message: any): message is AvailableComponentsMessageContents => {
  return message && (
    message.dataType === 'requestMessages' ||
    message.dataType === 'connect' ||
    message.dataType === 'selectedComponentInfo' ||
    message.dataType === 'toggleInspector');
};
