import {
  CommonModule
} from '@angular/common';
import {
  NgModule
} from '@angular/core';
import {
  MaxDateValidator
} from './max-date.directive';
import {
  MinDateValidator
} from './min-date.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [MaxDateValidator, MinDateValidator],
  exports: [MaxDateValidator, MinDateValidator]
})
export class DateValidatorsModule {}
