import {
  NAVIGATION_DECISION_MESSAGE_TYPE,
  NAVIGATION_REQUEST_MESSAGE_TYPE,
  type NavigationDecisionV1_0,
  type NavigationRequestV1_0,
} from '@ama-mfe/messages';
import {
  inject,
  Injectable,
  type OnDestroy,
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
  generateCorrelationId,
} from '../../../utils';

type ProducedMessage = NavigationRequestV1_0 | NavigationDecisionV1_0;

/**
 * Manages navigation request/decision round-trip communication for **both** shell and module.
 * Sends `navigation-request` messages, tracks pending requests, and sends `navigation-decision` replies.
 * Correlates responses with their originating requests using correlation IDs.
 *
 * - Module-initiated navigation → guard calls `requestNavigation()` with no target, broadcasting to the shell;
 *   the shell's handler opens the modal and replies.
 * - Shell-initiated navigation → guard calls `requestNavigation(channelId)` after the user already confirmed locally,
 *   so the module can run its unblock / draft-persistence logic and reply.
 *
 * If the peer never replies the returned promise stays pending and the navigation is held — callers rely on Angular
 * tearing their context down (the producer's `ngOnDestroy` resolves pending promises to `false`).
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationRequestManagerService
implements MessageProducer<ProducedMessage>, OnDestroy {
  /**
   * @inheritdoc
   */
  public readonly types = [NAVIGATION_REQUEST_MESSAGE_TYPE, NAVIGATION_DECISION_MESSAGE_TYPE] as [typeof NAVIGATION_REQUEST_MESSAGE_TYPE, typeof NAVIGATION_DECISION_MESSAGE_TYPE];

  private readonly connectionService = inject(ConnectionService);
  private readonly producerManagerService = inject(ProducerManagerService);
  private readonly logger = inject(LoggerService);

  /**
   * Single-flight slot for the in-progress negotiation. Only one request is ever pending: navigations are sequential
   * (one active module, and a blocking shell modal prevents the user from starting another while it is open), so this
   * is not about concurrent navigations. Its purpose is to de-duplicate the *re-entrant* guard calls a single navigation
   * produces — `canActivate` + `canActivateChild` on the same route, or re-runs from `runGuardsAndResolvers: 'always'`.
   * Those fire before any decision returns, and on the module side there is no local modal to serialize them, so without
   * this slot one navigation would emit multiple `navigation-request` messages. Reusing the slot makes every re-entrant
   * call await the same round-trip.
   */
  private pendingRequest?: {
    correlationId: string;
    promise: Promise<boolean>;
    resolve: (value: boolean) => void;
  };

  constructor() {
    this.producerManagerService.register(this);
  }

  /**
   * Ask the peer to handle the navigation. Resolves when the peer replies with a `navigation-decision`.
   * If the peer never replies the promise stays pending.
   *
   * Re-entrant calls while a request is pending (e.g. the same navigation firing both `canActivate` and `canActivateChild`)
   * return the same promise, so only one round-trip is sent.
   * @param target Optional target peer id. Omit to broadcast (module → shell).
   * @param reason Optional human-readable reason surfaced in the shell modal.
   */
  public requestNavigation(target?: string, reason?: string): Promise<boolean> {
    if (this.pendingRequest) {
      return this.pendingRequest.promise;
    }
    const correlationId = generateCorrelationId('nav-req');
    let resolveFn!: (value: boolean) => void;
    const promise = new Promise<boolean>((resolve) => {
      resolveFn = resolve;
    });
    this.pendingRequest = { correlationId, promise, resolve: resolveFn };
    const message: NavigationRequestV1_0 = {
      type: NAVIGATION_REQUEST_MESSAGE_TYPE,
      version: '1.0',
      correlationId,
      reason
    };
    this.connectionService.send(message, target ? { to: target } : undefined);
    return promise;
  }

  /**
   * Send a `navigation-decision` reply with the given `correlationId`.
   * Called by {@link NavigationNegotiationConsumerService} after the side-specific handler has finished.
   * @param correlationId id echoed from the request
   * @param target peer id of the original sender
   * @param proceed whether to allow navigation (default true)
   */
  public sendDecision(correlationId: string, target: string, proceed = true): void {
    const message: NavigationDecisionV1_0 = {
      type: NAVIGATION_DECISION_MESSAGE_TYPE,
      version: '1.0',
      correlationId,
      proceed
    };
    this.connectionService.send(message, { to: target });
  }

  /**
   * Called by {@link NavigationDecisionConsumerService} when a decision arrives.
   * Resolves the pending promise if the `correlationId` matches.
   * @param correlationId
   * @param proceed
   */
  public resolvePendingRequest(correlationId: string, proceed: boolean): void {
    const pending = this.pendingRequest;
    if (!pending || pending.correlationId !== correlationId) {
      return;
    }
    this.pendingRequest = undefined;
    pending.resolve(proceed);
  }

  /**
   * @inheritdoc
   */
  public handleError(message: ErrorContent<ProducedMessage>): void {
    this.logger.error('navigation negotiation message could not be consumed by a peer', message);
  }

  public ngOnDestroy(): void {
    if (this.pendingRequest) {
      this.pendingRequest.resolve(false);
      this.pendingRequest = undefined;
    }
    this.producerManagerService.unregister(this);
  }
}
