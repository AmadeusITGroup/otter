import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import {
  ResizeConsumerService,
} from './resize.consumer.service';

/**
 * A directive that adjusts the height of an element based on resize messages from a specified channel.
 */
@Directive({
  selector: '[scalable]',
  standalone: true
})
export class ScalableDirective {
  /**
   * The connection ID for the element, used as channel id backup
   */
  public connect = input<string>();

  /**
   * The channel id
   */
  public scalable = input<string>();

  private readonly resizeHandler = inject(ResizeConsumerService);

  /**
   * This signal checks if the current channel requesting the resize matches the channel ID from the resize handler.
   * If they match, it returns the new height information; otherwise, it returns undefined.
   */
  private readonly newHeightFromChannel = computed(() => {
    const channelAskingResize = this.scalable() || this.connect();
    const newHeightFromChannel = this.resizeHandler.newHeightFromChannel();
    if (channelAskingResize && newHeightFromChannel?.channelId === channelAskingResize) {
      return newHeightFromChannel;
    }
    return undefined;
  });

  constructor() {
    const elem = inject(ElementRef);
    const renderer = inject(Renderer2);

    this.resizeHandler.start();

    /** When a new height value is received set the height of the host element (in pixels) */
    effect(() => {
      const newHeightFromChannel = this.newHeightFromChannel();
      if (newHeightFromChannel) {
        renderer.setStyle(elem.nativeElement, 'height', `${newHeightFromChannel.height}px`);
      }
    });
  }
}
