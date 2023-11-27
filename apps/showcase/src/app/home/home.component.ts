import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { O3rComponent } from '@o3r/core';
import { DynamicContentModule } from '@o3r/dynamic-content';
import { CopyTextPresComponent } from '../../components';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-home',
  standalone: true,
  imports: [DynamicContentModule, CopyTextPresComponent],
  templateUrl: './home.template.html',
  styleUrls: ['./home.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

}
