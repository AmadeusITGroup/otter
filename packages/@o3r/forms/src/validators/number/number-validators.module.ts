import {
  CommonModule,
} from '@angular/common';
import {
  NgModule,
} from '@angular/core';
import {
  MaxValidator,
} from './max.directive';
import {
  MinValidator,
} from './min.directive';

/**
 * @deprecated MaxValidator and MinValidator are now standalone, this module will be removed in v14
 */
@NgModule({
  imports: [CommonModule, MaxValidator, MinValidator],
  exports: [MaxValidator, MinValidator]
})
export class NumberValidatorsModule {}
