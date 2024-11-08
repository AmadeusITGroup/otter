import type {
  ConnectContentMessage,
  DevtoolsCommonOptions,
  MessageDataTypes,
  OtterMessageContent,
  RequestMessagesContentMessage,
} from '@o3r/core';
import type {
  DebugEvent,
  Ruleset,
} from '../engine';

export interface RulesEngineDevtoolsServiceOptions extends DevtoolsCommonOptions {
  /** Size of events list emitted by rules engine; When undefined all history will be kept */
  rulesEngineStackLimit?: number;
}

/** Rules Engine debug event Message Content */
export interface RulesEngineDebugEventsContentMessage extends OtterMessageContent<'rulesEngineEvents'> {
  /** Map of registered rulesets */
  rulesetMap: Record<string, Ruleset>;
  /** List of event from the Rules Engine Debugger */
  events: DebugEvent[];
}

type RulesEngineMessageContents =
  | RulesEngineDebugEventsContentMessage;

/** List of possible DataTypes for RulesEngine messages */
export type RulesEngineMessageDataTypes = MessageDataTypes<RulesEngineMessageContents>;

/** List of all messages for configuration purpose */
export type AvailableRulesEngineMessageContents =
  | RulesEngineMessageContents
  | ConnectContentMessage
  | RequestMessagesContentMessage<RulesEngineMessageDataTypes>;

export const isRulesEngineMessage = (message: any): message is AvailableRulesEngineMessageContents => {
  return message && (
    message.dataType === 'rulesEngineEvents'
    || message.dataType === 'requestMessages'
    || message.dataType === 'connect'
  );
};
