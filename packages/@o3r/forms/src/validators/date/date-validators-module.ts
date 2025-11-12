import {
  CommonModule,
} from '@angular/common';
import {
  NgModule,
} from '@angular/core';
import {
  MaxDateValidator,
} from './max-date-validator';
import {
  MinDateValidator,
} from './min-date-validator';

/**
 * @deprecated MaxDateValidator and MinDateValidator are now standalone, this module will be removed in v14
 */
@NgModule({
  imports: [CommonModule, MaxDateValidator, MinDateValidator],
  exports: [MaxDateValidator, MinDateValidator]
})
export class DateValidatorsModule {}
