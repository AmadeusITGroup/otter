import {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  DestroyRef,
  inject,
} from '@angular/core';
import {
  ConsumerManagerService,
} from './consumer-manager-service';
import type {
  MessageConsumer,
} from './interfaces';

/**
 * An abstract base class for message consumers that provides common functionality for registering and unregistering with the ConsumerManagerService.
 *
 * This class implements the MessageConsumer interface and provides a default implementation for the start and stop methods.
 * It also handles the automatic registration and unregistration of the consumer with the ConsumerManagerService when the service is created and destroyed.
 *
 * To use this class, simply extend it and implement the required properties (type and supportedVersions) and any additional logic needed to consume messages.
 */
export abstract class AbstractMessageConsumer<T extends VersionedMessage = VersionedMessage> implements MessageConsumer<T> {
  /** The service used to register the consumer */
  protected readonly consumerManagerService = inject(ConsumerManagerService);
  /** The reference used to handle the destruction of the consumer */
  protected readonly destroyRef = inject(DestroyRef);

  private unregisterCallback?: (() => void);

  /** @inheritdoc */
  public abstract readonly type: MessageConsumer<T>['type'];

  /** @inheritdoc */
  public abstract readonly supportedVersions: MessageConsumer<T>['supportedVersions'];

  /**
   * Creates an instance of AbstractMessageConsumer and optionally starts it.
   * @param autoStart If true, the consumer will be started immediately after creation. Defaults to true.
   */
  constructor(autoStart = true) {
    if (autoStart) {
      this.start();
    }
  }

  /** @inheritdoc */
  public start(): void {
    this.consumerManagerService.register(this);
    this.unregisterCallback?.();
    this.unregisterCallback = this.destroyRef.onDestroy(() => this.stop());
  }

  /** @inheritdoc */
  public stop(): void {
    this.consumerManagerService.unregister(this);
    this.unregisterCallback?.();
    this.unregisterCallback = undefined;
  }
}
