import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({
  name: 'o3rJsonOrString',
  standalone: true
})
export class O3rJsonOrStringPipe implements PipeTransform {
  /**
   * @inheritDoc
   */
  public transform(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value, null, 2);
  }
}
