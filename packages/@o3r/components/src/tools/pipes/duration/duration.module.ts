import {NgModule} from '@angular/core';
import {DurationPipe} from './duration.pipe';

@NgModule({
  declarations: [DurationPipe],
  exports: [DurationPipe]
})
export class DurationPipeModule {}
