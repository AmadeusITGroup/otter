import { Pipe, type PipeTransform } from '@angular/core';
import color from 'color';

@Pipe({
  name: 'color',
  standalone: true
})
export class ColorPipe implements PipeTransform {
  public transform(variableValue: string) {
    try {
      return color(variableValue).hex();
    } catch {
      return null;
    }
  }
}
