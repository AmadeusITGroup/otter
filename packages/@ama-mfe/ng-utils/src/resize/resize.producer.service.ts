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
  inject,
  Injectable,
} from '@angular/core';
import {
  type MessageProducer,
  registerProducer,
} from '../managers/index';
import {
  type ErrorContent,
} from '../messages/index';

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
    registerProducer(this);
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
      const newHeight = document.body.getBoundingClientRect().height;
      if (!this.actualHeight || newHeight !== this.actualHeight) {
        this.actualHeight = newHeight;
        const messageV10 = {
          type: 'resize',
          version: '1.0',
          height: this.actualHeight
        } satisfies ResizeV1_0;
        // TODO: sendBest() is not implemented -- https://github.com/AmadeusITGroup/microfrontends/issues/11
        this.messageService.send(messageV10);
      }
    });

    afterNextRender(() => this.resizeObserver?.observe(document.body));
  }
}
