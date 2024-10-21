import {
  Pipe,
  type PipeTransform
} from '@angular/core';

@Pipe({ name: 'memoize', standalone: true })
export class MemoizePipe implements PipeTransform {
  public transform(fn: (...args: any[]) => any, ...pipeArgs: any[]): any {
    return fn(...pipeArgs);
  }
}
