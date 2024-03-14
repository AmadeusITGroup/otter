import { Pipe, type PipeTransform } from '@angular/core';
import { isRef, type Variable } from './common';

@Pipe({
  name: 'isRef',
  standalone: true
})
export class IsRefPipe implements PipeTransform {
  public transform(variable: Variable) {
    return isRef(variable.runtimeValue ?? '');
  }
}
