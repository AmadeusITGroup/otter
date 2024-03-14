import { Pipe, type PipeTransform } from '@angular/core';
import type { Variable } from './common';

@Pipe({
  name: 'variableLabel',
  standalone: true
})
export class VariableLabelPipe implements PipeTransform {
  public transform(variable: Variable) {
    return variable.label || variable.name;
  }
}
