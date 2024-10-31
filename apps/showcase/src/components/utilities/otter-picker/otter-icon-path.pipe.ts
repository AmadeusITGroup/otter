import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  isOtterIcon,
  OTTER_ICONS
} from './otter-icons';

@Pipe({
  name: 'otterIconPath',
  standalone: true
})
export class OtterIconPathPipe implements PipeTransform {
  private readonly BASE_URL = location.href.split('/#', 1)[0];

  /** @inheritDoc */
  public transform(value: string) {
    return `${this.BASE_URL}${isOtterIcon(value) ? value : OTTER_ICONS[0]}`;
  }
}
