import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'replaceWithBold',
  pure: true
})
export class ReplaceWithBoldPipe implements PipeTransform {
  public transform(value: string, inputText: string): string {
    if (inputText) {
      const regexp = new RegExp(this.escapeRegExp(inputText.trim()), 'gi');
      return value.replace(regexp, (match) => `<strong>${match}</strong>`);
    } else {
      return value;
    }
  }

  public escapeRegExp(str: string) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  }
}
