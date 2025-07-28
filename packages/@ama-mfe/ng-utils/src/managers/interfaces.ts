import type {
  RoutedMessage,
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import type {
  ErrorContent,
} from '../messages/index';

/**
 * Use the message payload to execute an action based on message type
 * @param message message to consume
 */
export type MessageCallback<T extends VersionedMessage> = (message: RoutedMessage<T>) => void | Promise<void>;

/**
 * Description of the accepted messages versions and their callbacks for a given message type
 */
export interface MessageVersions<T extends VersionedMessage> {
  /** The message callback coresponding to the version */
  [version: string]: MessageCallback<T>;
}

/** Description for the base message consumer */
export interface BasicMessageConsumer<T extends VersionedMessage = VersionedMessage> {
  /** Contains the message type */
  type: T['type'];
  /** A map of messages versions and their callbacks */
  supportedVersions: Record<string, MessageCallback<any>>;
}

/** The consumer of a given message type */
export interface MessageConsumer<T extends VersionedMessage> extends BasicMessageConsumer {

  /** The message type which will be handled */
  type: T['type'];
  /** The map of functions which will be executed for each supported version */
  supportedVersions: {
    /**
     * The supported versions for the given messages with their handlers functions
     */
    [V in T['version']]: MessageCallback<T & { version: V }>;
  };

  /** Prepare the registration of the consumer */
  start(): void;
  /** Unregister the consumer */
  stop(): void;
}

/**
 * Definition of a message producer and which types of messages are produced
 */
export interface MessageProducer<T extends VersionedMessage = VersionedMessage> {
  /** The types of the produced message */
  types: T['type'] | T['type'][];

  /**
   * The producer should handle an error in case that it has produced a message which cannot be consumed by other peers
   * @param message the error message received from a peer when the message sent previously has raised an error
   */
  handleError(message: ErrorContent<T>): void | Promise<void>;
}
