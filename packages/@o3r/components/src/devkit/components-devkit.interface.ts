import type {
  ConnectContentMessage,
  DevtoolsCommonOptions,
  MessageDataTypes,
  OtterMessageContent,
  RequestMessagesContentMessage,
} from '@o3r/core';
import type {
  PlaceholderMode,
} from '../stores';
import {
  GroupInfo,
} from './highlight/models';
import {
  OtterLikeComponentInfo,
} from './inspector';

/**
 * Component Devtools options
 */
export interface ComponentsDevtoolsServiceOptions extends DevtoolsCommonOptions {
}

/**
 * Message to give the selected component information
 */
export interface SelectedComponentInfoMessage extends OtterLikeComponentInfo, OtterMessageContent<'selectedComponentInfo'> {
}

/**
 * Message to toggle the inspector
 */
export interface ToggleInspectorMessage extends OtterMessageContent<'toggleInspector'> {
  /** Is the inspector running */
  isRunning: boolean;
}

/**
 * Message to toggle the highlight
 */
export interface ToggleHighlightMessage extends OtterMessageContent<'toggleHighlight'> {
  /** Is the highlight displayed */
  isRunning: boolean;
}

/**
 * Message the change the configuration of the `HighlightService`
 */
export interface ChangeHighlightConfiguration extends OtterMessageContent<'changeHighlightConfiguration'> {
  /**
   * Minimum width of HTMLElement to be considered
   */
  elementMinWidth?: number;
  /**
   * Minimum height of HTMLElement to be considered
   */
  elementMinHeight?: number;
  /**
   * Throttle interval
   */
  throttleInterval?: number;
  /**
   * Group information to detect elements
   */
  groupsInfo?: Record<string, GroupInfo>;
  /**
   * Maximum number of ancestors
   */
  maxDepth?: number;
}

/**
 * Message to toggle the placeholder mode
 */
export interface PlaceholderModeMessage extends OtterMessageContent<'placeholderMode'> {
  /** Placeholder mode */
  mode: PlaceholderMode;
}

/**
 * Message to know the component selection availability
 */
export interface IsComponentSelectionAvailableMessage extends OtterMessageContent<'isComponentSelectionAvailable'> {
  available: boolean;
}

type ComponentsMessageContents =
  | IsComponentSelectionAvailableMessage
  | SelectedComponentInfoMessage
  | ToggleInspectorMessage
  | ToggleHighlightMessage
  | ChangeHighlightConfiguration
  | PlaceholderModeMessage;

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
    message.dataType === 'requestMessages'
    || message.dataType === 'connect'
    || message.dataType === 'selectedComponentInfo'
    || message.dataType === 'isComponentSelectionAvailable'
    || message.dataType === 'placeholderMode'
    || message.dataType === 'toggleInspector'
    || message.dataType === 'toggleHighlight'
    || message.dataType === 'changeHighlightConfiguration'
  );
};
