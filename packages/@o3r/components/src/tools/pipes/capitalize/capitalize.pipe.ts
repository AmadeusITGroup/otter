import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({ name: 'o3rCapitalize', standalone: true })
export class O3rCapitalizePipe implements PipeTransform {
  public transform(value?: any) {
    const val: string | undefined = value && value.toString && value.toString();
    const firstLetter: string | undefined = val && val.charAt(0);
    return firstLetter ? firstLetter.toUpperCase() + val!.slice(1) : value;
  }
}

/**
 * @deprecated please use O3rCapitalizePipe, will be removed in v12.
 */
@Pipe({ name: 'capitalize' })
export class CapitalizePipe extends O3rCapitalizePipe implements PipeTransform {}
