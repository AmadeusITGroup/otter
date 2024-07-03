import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'o3rFallbackTo', standalone: true})
export class O3rFallbackToPipe implements PipeTransform {
  public transform<T>(value: T, fallback = 'undefined'): T | string {
    return value !== undefined ? value : fallback;
  }
}

/**
 * @deprecated please use O3rFallbackToPipe, will be removed in v12.
 */
@Pipe({name: 'fallbackTo'})
export class FallbackToPipe extends O3rFallbackToPipe implements PipeTransform {}
