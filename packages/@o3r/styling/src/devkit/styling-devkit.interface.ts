import type {
  ConnectContentMessage,
  DevtoolsCommonOptions,
  MessageDataTypes,
  OtterMessageContent,
  RequestMessagesContentMessage
} from '@o3r/core';
import { CssVariable } from '../core/index';

/**
 * Styling devtools service options
 */
export interface StylingDevtoolsServiceOptions extends DevtoolsCommonOptions {
  /**
   * Path to retrieve the styling metadata file
   */
  stylingMetadataPath: string;
}

/** Update styling variables */
export interface UpdateStylingVariablesContentMessage extends OtterMessageContent<'updateStylingVariables'> {
  /**
   * Dictionary of variable value to update
   * indexed by the variable name
   */
  variables: Record<string, string>;
}
/** Styling variable */
export type StylingVariable = CssVariable & { runtimeValue?: string };

/** Get styling variables */
export interface GetStylingVariableContentMessage extends OtterMessageContent<'getStylingVariable'> {
  /** List of styling variables */
  variables: StylingVariable[];
}

/**
 * List of styling message contents
 */
type StylingMessageContents =
  | UpdateStylingVariablesContentMessage
  | GetStylingVariableContentMessage;

/** List of possible DataTypes for Styling messages */
export type StylingMessageDataTypes = MessageDataTypes<StylingMessageContents>;

/** List of all messages for Styling purposes */
export type AvailableStylingMessageContents =
  | StylingMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<StylingMessageDataTypes>;

/** Tag to identify theme variable */
export const THEME_TAG_NAME = 'theme';
