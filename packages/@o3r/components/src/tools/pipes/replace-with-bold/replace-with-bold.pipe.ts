import {
  Pipe,
  PipeTransform,
} from '@angular/core';

const escapeRegExp = (str: string) => str.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&');

@Pipe({
  name: 'o3rReplaceWithBold',
  standalone: true
})
export class O3rReplaceWithBoldPipe implements PipeTransform {
  public transform(value: string, inputText: string): string {
    if (inputText) {
      const regexp = new RegExp(escapeRegExp(inputText.trim()), 'gi');
      return value.replace(regexp, (match) => `<strong>${match}</strong>`);
    } else {
      return value;
    }
  }
}

/**
 * @deprecated please use O3rReplaceWithBoldPipe, will be removed in v12.
 */
@Pipe({
  name: 'replaceWithBold'
})
export class ReplaceWithBoldPipe extends O3rReplaceWithBoldPipe implements PipeTransform {
  public escapeRegExp(str: string) {
    return escapeRegExp(str);
  }
}
