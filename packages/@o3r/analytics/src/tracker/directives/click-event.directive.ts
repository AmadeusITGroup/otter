import { Directive, input } from '@angular/core';
import { AnalyticTrackGeneric } from './generic-event.directive';

@Directive({
  selector: '[trackClick]',
  standalone: true
})
/** Directive to listen and emit analytics in case of Dom Click event */
export class AnalyticTrackClick extends AnalyticTrackGeneric {
  /** @inheritdoc */
  public trackEvent = input(undefined, { alias: 'trackClick' });
  /** @inheritdoc */
  public trackCategory = input('', { alias: 'trackClickCategory' });
  /** @inheritdoc */
  public trackAction = input(undefined, { alias: 'trackClickAction' });
  /** @inheritdoc */
  public trackLabel = input(undefined, { alias: 'trackClickLabel' });
  /** @inheritdoc */
  public trackValue = input(undefined, { alias: 'trackClickValue' });
  /** @inheritdoc */
  public readonly eventName = 'click';
}
