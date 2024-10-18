import type {
  OtterMessageContent
} from './message.interfaces';

/** Extension connection notification message content */
export interface ConnectContentMessage extends OtterMessageContent<'connect'> {
}

/** Script Injection message content */
export interface InjectContentMessage extends OtterMessageContent<'inject'> {
  /** Path to the extension script to inject to the web application */
  scriptToInject: string;
}

/** Requested messages Message Content */
export interface RequestMessagesContentMessage<AvailableMessageDataTypes extends string = string> extends OtterMessageContent<'requestMessages'> {
  /** If specified, only the listed messages will be re-emitted */
  only?: AvailableMessageDataTypes[];
}

/** List of common Otter content messages */
export type CommonContentMessages =
  | ConnectContentMessage
  | InjectContentMessage
  | RequestMessagesContentMessage;
