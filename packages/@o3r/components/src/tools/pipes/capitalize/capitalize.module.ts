import {
  NgModule,
} from '@angular/core';
import {
  CapitalizePipe,
} from './capitalize.pipe';

/**
 * @deprecated please use O3rCapitalizePipe, will be removed in v12.
 */
@NgModule({
  declarations: [CapitalizePipe],
  exports: [CapitalizePipe]
})
export class CapitalizePipeModule {}
