import {
  NgModule,
} from '@angular/core';
import {
  TrackClickDirective,
} from './track-click/track-click.directive';
import {
  TrackEventsDirective,
} from './track-events.directive';
import {
  TrackFocusDirective,
} from './track-focus/track-focus.directive';

/**
 * @deprecated TrackEventsDirective, TrackClickDirective and TrackFocusDirective are now standalone, this module will be removed in v14
 */
@NgModule({
  imports: [TrackEventsDirective, TrackClickDirective, TrackFocusDirective],
  exports: [TrackEventsDirective, TrackClickDirective, TrackFocusDirective]
})
export class TrackEventsModule {}
