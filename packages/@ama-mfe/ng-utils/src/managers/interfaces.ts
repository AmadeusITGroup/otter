import type {
  Message,
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import type {
  ErrorContent,
} from '../messages/index';

export type MessageCallback<T extends Message> = (message: RoutedMessage<T>) => void | Promise<void>;

export interface MessageVersions<T extends Message> {
  [version: string]: MessageCallback<T>;
}

export interface BasicMessageConsumer {
  type: string;
  supportedVersions: Record<string, MessageCallback<any>>;
}

export interface MessageConsumer<T extends Message> extends BasicMessageConsumer {

  /** The message type which will be handled */
  type: T['type'];
  /** The map of functions which will be executed for each supported version */
  supportedVersions: {
    [V in T['version']]: MessageCallback<T & { version: V }>;
  };

  start(): void;
  stop(): void;
}

export interface MessageProducer<T extends Message = Message> {
  types: T['type'] | T['type'][];

  handleError(message: ErrorContent<T>): void | Promise<void>;
}
