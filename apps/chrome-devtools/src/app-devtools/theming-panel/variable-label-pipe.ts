import type {
  StylingVariable,
} from '@ama-styling/devkit';
import {
  Pipe,
  type PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'variableLabel'
})
export class VariableLabelPipe implements PipeTransform {
  public transform(variable: StylingVariable) {
    return variable.label || variable.name;
  }
}
