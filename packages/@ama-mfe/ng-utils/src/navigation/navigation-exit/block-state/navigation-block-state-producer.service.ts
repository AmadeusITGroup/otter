import {
  NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
  type NavigationBlockStateV1_0,
} from '@ama-mfe/messages';
import {
  DestroyRef,
  effect,
  inject,
  Injectable,
} from '@angular/core';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ConnectionService,
} from '../../../connect/connect-resources';
import {
  type MessageProducer,
  ProducerManagerService,
} from '../../../managers';
import type {
  ErrorContent,
} from '../../../messages/error/base';
import {
  NavigationBlockService,
} from './navigation-block.service';

/**
 * Module-side producer that mirrors {@link NavigationBlockService} to the shell via `navigation-block-state` messages.
 * Every state change triggers a broadcast so the shell guard can decide without a round-trip.
 *
 * Runs module-side only (it watches the module's writable state). The shell never instantiates it.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationBlockStateProducerService
implements MessageProducer<NavigationBlockStateV1_0> {
  /**
   * @inheritdoc
   */
  public readonly types = NAVIGATION_BLOCK_STATE_MESSAGE_TYPE;

  private readonly connectionService = inject(ConnectionService);
  private readonly producerManagerService = inject(ProducerManagerService);
  private readonly logger = inject(LoggerService);
  private readonly store = inject(NavigationBlockService);

  constructor() {
    this.producerManagerService.register(this);
    inject(DestroyRef).onDestroy(() => this.producerManagerService.unregister(this));
    effect(() => {
      const state = this.store.state();
      const message: NavigationBlockStateV1_0 = {
        type: NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
        version: '1.0',
        blocked: state.blocked,
        reason: state.reason
      };
      this.connectionService.send(message);
    });
  }

  /**
   * @inheritdoc
   */
  public handleError(message: ErrorContent<NavigationBlockStateV1_0>): void {
    this.logger.error('navigation-block state message could not be consumed by the shell', message);
  }
}
