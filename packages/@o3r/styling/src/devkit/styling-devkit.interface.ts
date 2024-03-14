import type {
  ConnectContentMessage,
  DevtoolsCommonOptions,
  MessageDataTypes,
  OtterMessageContent,
  RequestMessagesContentMessage
} from '@o3r/core';
import { CssVariable } from '../core/index';

export interface StylingDevtoolsServiceOptions extends DevtoolsCommonOptions {
  stylingMetadataPath: string;
}

/** Update styling variable */
export interface UpdateStylingVariablesContentMessage extends OtterMessageContent<'updateStylingVariables'> {
  variables: Record<string, string>;
}

export type StylingVariables = (CssVariable & { runtimeValue?: string })[];

/** Get styling variables */
export interface GetStylingVariableContentMessage extends OtterMessageContent<'getStylingVariable'> {
  variables: StylingVariables;
}

type StylingMessageContents =
  | UpdateStylingVariablesContentMessage
  | GetStylingVariableContentMessage;

/** List of possible DataTypes for Styling messages */
export type StylingMessageDataTypes = MessageDataTypes<StylingMessageContents>;

/** List of all messages for Styling purpose */
export type AvailableStylingMessageContents =
  | StylingMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<StylingMessageDataTypes>;
