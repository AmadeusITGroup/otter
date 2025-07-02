import {
  NgModule,
} from '@angular/core';
import {
  DurationPipe,
} from './duration.pipe';

/**
 * @deprecated please use O3rDurationPipe, will be removed in v12.
 */
@NgModule({
  declarations: [DurationPipe],
  exports: [DurationPipe]
})
export class DurationPipeModule {}
