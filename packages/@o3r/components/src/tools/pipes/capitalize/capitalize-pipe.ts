import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({ name: 'o3rCapitalize' })
export class O3rCapitalizePipe implements PipeTransform {
  public transform(value?: any) {
    const val: string | undefined = value && value.toString && value.toString();
    const firstLetter: string | undefined = val && val.charAt(0);
    return firstLetter ? firstLetter.toUpperCase() + val!.slice(1) : value;
  }
}
