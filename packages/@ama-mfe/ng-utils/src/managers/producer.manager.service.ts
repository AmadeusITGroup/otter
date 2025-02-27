import type {
  Message,
} from '@amadeus-it-group/microfrontends';
import {
  Injectable,
} from '@angular/core';
import type {
  ErrorContent,
} from '../messages/index';
import type {
  MessageProducer,
} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProducerManagerService {
  private readonly registeredProducers = new Set<MessageProducer>();

  /** Get the list of registered producers of messages. The list will contain unique elements */
  public get producers() {
    return [...this.registeredProducers];
  }

  /**
   * Register a producer of a message
   * @param producer The instance of the message producer
   */
  public register(producer: MessageProducer) {
    this.registeredProducers.add((producer));
  }

  /**
   * Unregister a producer of a message
   * @param producer The instance of the message producer
   */
  public unregister(producer: MessageProducer) {
    this.registeredProducers.delete((producer));
  }

  /**
   * Handles the received error message for the given message type by invoking the appropriate producer handlers.
   * @template T - The type of the message, extending from Message.
   * @param message - The error message to handle.
   * @returns - A promise that resolves to true if the error was handled by at least one handler, false otherwise.
   */
  public async dispatchError<T extends Message = Message>(message: ErrorContent<T>) {
    const handlers = this.producers
      .filter(({ types }) => (Array.isArray(types) ? types : [types]).includes(message.source.type));

    const handlersPresent = handlers.length > 0;
    if (handlersPresent) {
      await Promise.all(
        handlers.map((handler) => handler.handleError(message))
      );
    }
    return handlersPresent;
  }
}
