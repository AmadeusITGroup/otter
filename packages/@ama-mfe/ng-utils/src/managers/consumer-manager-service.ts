import {
  RoutedMessage,
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  LoggerService,
} from '@o3r/logger';
import {
  getAvailableConsumers,
} from '../messages/available-sender';
import {
  isErrorMessage,
  sendError,
} from '../messages/error-sender';
import type {
  BasicMessageConsumer,
} from './interfaces';
import {
  ProducerManagerService,
} from './producer-manager-service';

const VERSION_MATCH = /^(\d+)\.(\d+)$/;

interface ParsedVersion {
  major: number;
  minor: number;
  raw: string;
}

/**
 * Parses a "major.minor" version string. Returns undefined if the string is malformed.
 * @param version
 */
const parseVersion = (version: string): ParsedVersion | undefined => {
  const match = VERSION_MATCH.exec(version);
  if (!match) {
    return undefined;
  }
  const [major, minor] = match.slice(1).map(Number);
  return { major, minor, raw: version };
};

@Injectable({
  providedIn: 'root'
})
export class ConsumerManagerService {
  private readonly messageService = inject(MessagePeerService);
  private readonly producerManagerService = inject(ProducerManagerService);
  private readonly registeredConsumers = signal<BasicMessageConsumer[]>([]);
  private readonly logger = inject(LoggerService);

  /** The list of registered consumers */
  public readonly consumers = this.registeredConsumers.asReadonly();

  constructor() {
    this.messageService.messages$.pipe(takeUntilDestroyed()).subscribe((message) => this.consumeMessage(message));

    // Each time a consumer is registered/unregistered update the list of registered messages.
    effect(() => {
      const declareMessages = getAvailableConsumers(this.consumers());

      // registering consumed messages locally for validation
      for (const message of declareMessages.messages) {
        this.messageService.registerMessage(message);
      }
    });
  }

  /**
   * Consume a received message
   * @param message the received message body
   */
  private async consumeMessage(message: RoutedMessage<VersionedMessage>) {
    if (isErrorMessage(message.payload)) {
      const isHandled = await this.producerManagerService.dispatchError(message.payload);
      if (!isHandled) {
        this.logger.warn('Error message not handled', message);
      }
      return;
    }

    return this.consumeAdditionalMessage(message);
  }

  /**
   * Call the registered message callback(s) to consume the given message
   * Handle error messages of internal communication protocol messages
   * @param message message to consume
   */
  private async consumeAdditionalMessage(message: RoutedMessage<VersionedMessage>) {
    if (!message.payload) {
      this.logger.warn('Cannot consume a messages with undefined payload.');
      return;
    }

    const consumers = this.consumers();
    const typeMatchingConsumers = consumers
      .filter((consumer) => consumer.type === message.payload.type);

    if (typeMatchingConsumers.length === 0) {
      this.logger.warn(`No consumer found for message type: ${message.payload.type}`);
      return sendError(this.messageService, { reason: 'unknown_type', source: message.payload });
    }

    // Semver-compatible dispatch: for an incoming v{major}.{minor}, pick each consumer's highest
    // declared v{major}.{n} where n <= minor.
    // Major versions are isolated: no cross-major fallback in either direction. An incoming v2.x
    // will never fall back to a v1.x handler (breaking changes), and a consumer that declares
    // only v2.x will not match an incoming v1.x (the consumer is ahead of the producer). Both
    // result in a version_mismatch error.
    const messageVersion = parseVersion(message.payload.version);
    const resolvedConsumers = messageVersion
      ? typeMatchingConsumers
        .map((consumer) => {
          const fallbackVersion = Object.keys(consumer.supportedVersions)
            .map((version) => parseVersion(version))
            .filter((v): v is ParsedVersion =>
              !!v && v.major === messageVersion.major && v.minor <= messageVersion.minor)
            .toSorted((a, b) => b.minor - a.minor)
            .at(0);
          return fallbackVersion && { consumer, version: fallbackVersion.raw };
        })
        .filter((entry): entry is { consumer: typeof typeMatchingConsumers[number]; version: string } => !!entry)
      : [];

    if (resolvedConsumers.length === 0) {
      this.logger.warn(`No consumer found for message version: ${message.payload.version}`);
      return sendError(this.messageService, { reason: 'version_mismatch', source: message.payload });
    }

    await Promise.all(
      resolvedConsumers
        .map(async ({ consumer, version }) => {
          try {
            await consumer.supportedVersions[version](message);
          } catch (error) {
            this.logger.error('Error while consuming message', error);
            sendError(this.messageService, { reason: 'internal_error', source: message.payload });
          }
        })
    );
  }

  /**
   * Register a message consumer
   * @param consumer an instance of message consumer
   */
  public register(consumer: BasicMessageConsumer) {
    this.registeredConsumers.update((consumers) => {
      return [...new Set(consumers).add(consumer)];
    });
  }

  /**
   * Unregister a message consumer
   * @param consumer an instance of message consumer
   */
  public unregister(consumer: BasicMessageConsumer) {
    this.registeredConsumers.update((consumers) => {
      return consumers.filter((c) => c !== consumer);
    });
  }
}
