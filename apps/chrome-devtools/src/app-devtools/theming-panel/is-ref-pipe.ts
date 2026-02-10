import type {
  StylingVariable,
} from '@ama-styling/devkit';
import {
  Pipe,
  type PipeTransform,
} from '@angular/core';
import {
  isRef,
} from './common';

@Pipe({
  name: 'isRef'
})
export class IsRefPipe implements PipeTransform {
  public transform(variable: StylingVariable) {
    return isRef(variable.runtimeValue ?? '');
  }
}
