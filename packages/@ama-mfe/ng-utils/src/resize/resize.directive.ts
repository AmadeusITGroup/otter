import {
  Directive,
  effect,
  inject,
  input,
} from '@angular/core';
import {
  ResizeConsumerService,
} from './resize.consumer.service';

/**
 * A directive that adjusts the height of an element based on resize messages from a specified channel.
 */
@Directive({
  selector: '[connect][scalable]',
  standalone: true,
  host: {
    '[style.height.px]': 'resizeConsumer.heightPx()'
  },
  providers: [ResizeConsumerService]
})
export class ScalableDirective {
  /**
   * The connection ID for the element
   */
  public connect = input<string>();

  protected readonly resizeConsumer = inject(ResizeConsumerService);

  constructor() {
    effect(() => {
      this.resizeConsumer.from = this.connect() ?? '';
    });
  }
}
