import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'fallbackTo'})
export class FallbackToPipe implements PipeTransform {
  public transform<T>(value: T, fallback = 'undefined'): T | string {
    return value !== undefined ? value : fallback;
  }
}
