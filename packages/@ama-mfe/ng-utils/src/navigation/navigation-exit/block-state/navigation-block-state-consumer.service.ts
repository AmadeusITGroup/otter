import {
  NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
  type NavigationBlockStateMessage,
  type NavigationBlockStateV1_0,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  Injectable,
  signal,
  type Signal,
} from '@angular/core';
import {
  AbstractMessageConsumer,
} from '../../../managers';
import type {
  NavigationBlockState,
} from './navigation-block.service';

/**
 * Navigation block state as observed by the shell, extended with the originating channel ID
 * so the shell knows which module to notify when navigation is confirmed.
 */
export interface ObservedNavigationBlockState extends NavigationBlockState {
  /** Id of the module (channel) that sent the last state message. */
  channelId?: string;
}

/**
 * Shell-side consumer for `navigation-block-state` messages sent by modules.
 *
 * Keeps the last received state in a signal that the shell guard reads to decide whether to intercept shell-initiated navigation.
 * The state stays `undefined` until any module reports a value (interpreted as "no block known" which means navigation is allowed).
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationBlockStateConsumerService extends AbstractMessageConsumer<NavigationBlockStateMessage> {
  /**
   * @inheritdoc
   */
  public readonly type = NAVIGATION_BLOCK_STATE_MESSAGE_TYPE;

  /**
   * @inheritdoc
   */
  public readonly supportedVersions = {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- expected naming for versions
    '1.0': (message: RoutedMessage<NavigationBlockStateV1_0>) => {
      this.blockStateSignal.set({
        blocked: message.payload.blocked,
        reason: message.payload.reason,
        channelId: message.from
      });
    }
  };

  private readonly blockStateSignal = signal<ObservedNavigationBlockState | undefined>(undefined);

  /** Last navigation block state reported by any module. */
  public readonly blockState: Signal<ObservedNavigationBlockState | undefined> = this.blockStateSignal.asReadonly();

  /**
   * Mark the state as unblocked after the shell has resolved a confirmation (e.g. the user confirmed a sidebar-initiated navigation).
   */
  public clear(): void {
    this.blockStateSignal.set({ blocked: false });
  }
}
