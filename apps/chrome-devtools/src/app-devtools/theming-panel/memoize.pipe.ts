import {
  Pipe,
  type PipeTransform,
} from '@angular/core';

@Pipe({ name: 'memoize' })
export class MemoizePipe implements PipeTransform {
  public transform(fn: (...args: any[]) => any, ...pipeArgs: any[]): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- type of pipeArgs is `any[]`
    return fn(...pipeArgs);
  }
}
