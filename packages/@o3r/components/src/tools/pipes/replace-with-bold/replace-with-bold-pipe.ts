import {
  Pipe,
  PipeTransform,
} from '@angular/core';

const escapeRegExp = (str: string) => str.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&');

@Pipe({ name: 'o3rReplaceWithBold' })
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
