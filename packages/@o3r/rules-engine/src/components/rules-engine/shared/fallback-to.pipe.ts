import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({ name: 'o3rFallbackTo', standalone: true })
export class O3rFallbackToPipe implements PipeTransform {
  public transform<T>(value: T, fallback = 'undefined'): T | string {
    return value === undefined ? fallback : value;
  }
}
