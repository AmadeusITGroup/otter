import type {
  ResizeMessage,
  ResizeV1_0,
} from '@ama-mfe/messages';
import {
  RESIZE_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  afterNextRender,
  DestroyRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  type MessageProducer,
  ProducerManagerService,
} from '../managers/index';
import {
  type ErrorContent,
} from '../messages/index';

/**
 * `scrollHeight` is a rounded number (cf https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight)
 *
 * So we have to add a delta to ensure no scrollbar will appear on the host,
 * in case the `scrollHeight` is rounded down
 */
export const DELTA_RESIZE = 1;

/**
 * This service observe changes in the document's body height.
 * When the height changes, it sends a resize message with the new height, to the connected peers
 */
@Injectable({
  providedIn: 'root'
})
export class ResizeService implements MessageProducer<ResizeMessage> {
  private actualHeight?: number;
  private readonly messageService = inject(MessagePeerService<ResizeMessage>);
  private resizeObserver?: ResizeObserver;

  /**
   * @inheritdoc
   */
  public readonly types = RESIZE_MESSAGE_TYPE;

  constructor() {
    const producerManagerService = inject(ProducerManagerService);
    producerManagerService.register(this);

    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver?.disconnect();
      producerManagerService.unregister(this);
    });
  }

  /**
   * @inheritdoc
   */
  public handleError(message: ErrorContent<ResizeMessage>): void {
    // eslint-disable-next-line no-console -- error handling placeholder
    console.error('Error in resize service message', message);
  }

  /**
   * This method sets up a `ResizeObserver` to observe changes in the document's body height.
   * When the height changes, it sends a resize message with the new height, to the connected peers
   */
  public startResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.actualHeight || Math.abs(document.body.scrollHeight - this.actualHeight) > DELTA_RESIZE) {
        this.actualHeight = document.body.scrollHeight;
        const messageV10 = {
          type: 'resize',
          version: '1.0',
          height: document.body.scrollHeight + DELTA_RESIZE
        } satisfies ResizeV1_0;
        // TODO: sendBest() is not implemented -- https://github.com/AmadeusITGroup/microfrontends/issues/11
        this.messageService.send(messageV10);
      }
    });

    afterNextRender(() => this.resizeObserver?.observe(document.body));
  }
}
