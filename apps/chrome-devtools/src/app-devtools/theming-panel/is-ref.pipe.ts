import {
  Pipe,
  type PipeTransform
} from '@angular/core';
import type {
  StylingVariable
} from '@o3r/styling';
import {
  isRef
} from './common';

@Pipe({
  name: 'isRef',
  standalone: true
})
export class IsRefPipe implements PipeTransform {
  public transform(variable: StylingVariable) {
    return isRef(variable.runtimeValue ?? '');
  }
}
