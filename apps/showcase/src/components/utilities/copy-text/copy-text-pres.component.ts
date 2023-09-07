import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { O3rComponent } from '@o3r/core';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-copy-text-pres',
  standalone: true,
  imports: [CommonModule, ClipboardModule],
  templateUrl: './copy-text-pres.template.html',
  styleUrls: ['./copy-text-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyTextPresComponent {
  /** Text to display and copy */
  @Input()
  public text = '';

  /** Should the text be wrapped if too long */
  @Input()
  public wrap = false;

  constructor(private clipboard: Clipboard) {}

  /**
   * Copy the text into the clipboard
   */
  public copy() {
    this.clipboard.copy(this.text);
  }
}
