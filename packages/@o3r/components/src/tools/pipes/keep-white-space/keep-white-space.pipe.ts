import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({
  name: 'o3rKeepWhiteSpace'
})
export class O3rKeepWhiteSpacePipe implements PipeTransform {
  public transform(value: string): string {
    return value.replace(/\s/g, '&nbsp;');
  }
}

/**
 * @deprecated please use O3rKeepWhiteSpacePipe, will be removed in v12.
 */
@Pipe({
  name: 'keepWhiteSpace'
})
export class KeepWhiteSpacePipe extends O3rKeepWhiteSpacePipe implements PipeTransform {}
