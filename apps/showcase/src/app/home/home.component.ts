import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { O3rComponent } from '@o3r/core';
import { DynamicContentModule } from '@o3r/dynamic-content';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-home',
  standalone: true,
  imports: [CommonModule, DynamicContentModule],
  templateUrl: './home.template.html',
  styleUrls: ['./home.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

}
