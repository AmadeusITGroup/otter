import {NgModule} from '@angular/core';
import {KeepWhiteSpacePipe} from './keep-white-space.pipe';

@NgModule({
  declarations: [KeepWhiteSpacePipe],
  exports: [KeepWhiteSpacePipe]
})
export class KeepWhiteSpacePipeModule {}
