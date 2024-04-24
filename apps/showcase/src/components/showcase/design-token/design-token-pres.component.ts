import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { O3rComponent } from '@o3r/core';
import { StyleLazyLoader, StyleLazyLoaderModule } from '@o3r/dynamic-content';
import { DatePickerInputPresComponent } from '../../utilities';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-design-token-pres',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePickerInputPresComponent,
    FormsModule,
    ReactiveFormsModule,
    StyleLazyLoaderModule
  ],
  templateUrl: './design-token-pres.template.html',
  styleUrl: './design-token-pres.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignTokenPresComponent {

  /**
   * Form group
   */
  public form: FormGroup<{ theme: FormControl<string | null> }>;

  constructor(fb: FormBuilder, styleLoader: StyleLazyLoader) {
    this.form = fb.group({
      theme: new FormControl<string | null>('')
    });

    let style: HTMLElement | null = null;
    const cleanUpStyle = () => {
      if (style?.parentNode) {
        style.parentNode.removeChild(style);
        style = null;
      }
    };
    this.form.valueChanges.subscribe((value) => {
      cleanUpStyle();
      if (value.theme === 'dark') {
        style = styleLoader.loadStyleFromURL({href: 'dark-theme.css'});
      } else if (value.theme === 'horizon') {
        style = styleLoader.loadStyleFromURL({href: 'horizon-theme.css'});
      }
    });
    inject(DestroyRef).onDestroy(cleanUpStyle);
  }
}
