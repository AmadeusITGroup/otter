import {
  CommonModule
} from '@angular/common';
import {
  NgModule
} from '@angular/core';
import {
  MaxValidator
} from './max.directive';
import {
  MinValidator
} from './min.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [MaxValidator, MinValidator],
  exports: [MaxValidator, MinValidator]
})
export class NumberValidatorsModule {}
