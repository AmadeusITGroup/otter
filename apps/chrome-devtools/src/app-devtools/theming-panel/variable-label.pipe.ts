import {
  Pipe,
  type PipeTransform,
} from '@angular/core';
import type {
  StylingVariable,
} from '@o3r/styling';

@Pipe({
  name: 'variableLabel'
})
export class VariableLabelPipe implements PipeTransform {
  public transform(variable: StylingVariable) {
    return variable.label || variable.name;
  }
}
