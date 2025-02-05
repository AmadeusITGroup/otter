import type {
  Resize,
  ResizeVersions,
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
 * This service observe changes in the document's body height.
 * When the height changes, it sends a resize message with the new height, to the connected peers
 */
@Injectable({
  providedIn: 'root'
})
export class ResizeService implements MessageProducer<ResizeVersions> {
  private actualHeight?: number;

  private readonly messageService = inject(MessagePeerService<ResizeVersions>);
  private resizeObserver?: ResizeObserver;

  /**
   * The type of messages this service handles.
   */
  public readonly types = 'resize';

  constructor() {
    const producerManagerService = inject(ProducerManagerService);
    producerManagerService.register(this);

    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver?.disconnect();
      producerManagerService.unregister(this);
    });
  }

  /**
   * Handles errors related to resize messages.
   * @param message - The error message content.
   */
  public handleError(message: ErrorContent<ResizeVersions>): void {
    // eslint-disable-next-line no-console -- error handling placeholder
    console.error('Error in resize service message', message);
  }

  /**
   * This method sets up a `ResizeObserver` to observe changes in the document's body height.
   * When the height changes, it sends a resize message with the new height, to the connected peers
   */
  public startResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      if (document.body.scrollHeight !== this.actualHeight) {
        this.actualHeight = document.body.scrollHeight;
        const messageV10 = {
          type: 'resize',
          version: '1.0',
          height: document.body.scrollHeight
        } satisfies Resize;
        // TODO: sendBest() is not implemented
        this.messageService.send(messageV10);
      }
    });

    afterNextRender(() => this.resizeObserver?.observe(document.body));
  }
}
