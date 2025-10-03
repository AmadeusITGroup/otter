import {
  Pipe,
  type PipeTransform,
} from '@angular/core';
import {
  varRegExp,
} from './common';

@Pipe({
  name: 'variableName'
})
export class VariableNamePipe implements PipeTransform {
  public transform(text: string) {
    return text.match(varRegExp)?.[1];
  }
}
