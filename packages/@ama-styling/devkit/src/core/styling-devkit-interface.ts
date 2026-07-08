import type {
  ConnectContentMessage,
  DevtoolsCommonOptions,
  ItemIdentifier,
  MessageDataTypes,
  OtterMessageContent,
  RequestMessagesContentMessage,
} from '@o3r/core';

/** Style Metadata map */
export interface CssMetadata {
  /** Variables' dictionary */
  variables: {
    [name: string]: CssVariable;
  };
}

/** Metadata information added in the design token extension for Metadata extraction */
export interface DesignTokenMetadata {
  /** List of tags */
  tags?: string[];
  /** Description of the variable */
  label?: string;
  /** Name of a group of variables */
  category?: string;
  /** Component reference if the variable is linked to one */
  component?: ItemIdentifier;
}

/** CSS Variable possible types */
export type CssVariableType = 'string' | 'color';

/** Metadata for a CSS Variable */
export interface CssVariable {
  /** Name of the variable */
  name: string;
  /** Default value of the variable */
  defaultValue: string;
  /** References of the variable */
  references?: CssVariable[];
  /** Tags of the variable */
  tags?: string[];
  /** Description of the variable */
  description?: string;
  /** Description of the variable */
  label?: string;
  /** Type of the variable */
  type?: CssVariableType;
  /** Name of a group of variables */
  category?: string;
  /** component reference if the variable is linked to one */
  component?: ItemIdentifier;
}

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

/** Reset styling variables override */
export interface ResetStylingVariablesContentMessage extends OtterMessageContent<'resetStylingVariables'> {}

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
type StylingMessageContents = UpdateStylingVariablesContentMessage
  | ResetStylingVariablesContentMessage
  | GetStylingVariableContentMessage;

/** List of possible DataTypes for Styling messages */
export type StylingMessageDataTypes = MessageDataTypes<StylingMessageContents>;

/** List of all messages for Styling purposes */
export type AvailableStylingMessageContents = StylingMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<StylingMessageDataTypes>;

/** Tag to identify theme variable */
export const THEME_TAG_NAME = 'theme';

/** Tag to identify palette variable */
export const PALETTE_TAG_NAME = 'palette';
