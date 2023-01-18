import {NgModule} from '@angular/core';

import {TrackClickDirective} from './track-click/track-click.directive';
import {TrackEventsDirective} from './track-events.directive';
import {TrackFocusDirective} from './track-focus/track-focus.directive';

@NgModule({
  declarations: [TrackEventsDirective, TrackClickDirective, TrackFocusDirective],
  exports: [TrackEventsDirective, TrackClickDirective, TrackFocusDirective]
})
export class TrackEventsModule {}
