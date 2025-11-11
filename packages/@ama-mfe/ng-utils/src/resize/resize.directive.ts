import {
  Directive,
  inject,
} from '@angular/core';
import {
  ResizeConsumerService,
} from './resize.consumer.service';

/**
 * A directive that adjusts the height of an element based on resize messages from a specified channel.
 */
@Directive({
  selector: '[scalable]',
  host: {
    '[style.height.px]': 'resizeConsumer.heightPx()'
  },
  providers: [ResizeConsumerService]
})
export class ScalableDirective {
  protected readonly resizeConsumer = inject(ResizeConsumerService);
}
