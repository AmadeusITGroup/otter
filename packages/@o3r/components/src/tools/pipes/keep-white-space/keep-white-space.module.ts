import {
  NgModule
} from '@angular/core';
import {
  KeepWhiteSpacePipe
} from './keep-white-space.pipe';

/**
 * @deprecated please use O3rKeepWhiteSpacePipe, will be removed in v12.
 */
@NgModule({
  declarations: [KeepWhiteSpacePipe],
  exports: [KeepWhiteSpacePipe]
})
export class KeepWhiteSpacePipeModule {}
