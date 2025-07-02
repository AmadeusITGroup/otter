import {
  NgModule,
} from '@angular/core';
import {
  ReplaceWithBoldPipe,
} from './replace-with-bold.pipe';

/**
 * @deprecated please use O3rReplaceWithBoldPipe, will be removed in v12.
 */
@NgModule({
  declarations: [ReplaceWithBoldPipe],
  exports: [ReplaceWithBoldPipe]
})
export class ReplaceWithBoldPipeModule {}
