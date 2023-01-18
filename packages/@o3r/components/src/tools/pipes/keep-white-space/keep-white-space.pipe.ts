import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'keepWhiteSpace',
  pure: true
})
export class KeepWhiteSpacePipe implements PipeTransform {
  public transform(value: string): string {
    return value.replace(/\s/g, '&nbsp;');
  }
}
