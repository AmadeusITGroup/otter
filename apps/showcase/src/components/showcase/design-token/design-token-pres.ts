import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  O3rComponent,
} from '@o3r/core';
import {
  StyleLazyLoader,
} from '@o3r/dynamic-content';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-design-token-pres',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './design-token-pres.html',
  styleUrl: './design-token-pres.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignTokenPres {
  private readonly styleLoader = inject(StyleLazyLoader);

  /**
   * Form group
   */
  public form: FormGroup<{ theme: FormControl<string | null> }> = inject(FormBuilder).group({
    theme: new FormControl<string | null>('')
  });

  constructor() {
    let style: HTMLElement | null = null;
    const cleanUpStyle = () => {
      if (style?.parentNode) {
        style.remove();
        style = null;
      }
    };
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      cleanUpStyle();
      if (value.theme === 'dark') {
        style = this.styleLoader.loadStyleFromURL({ href: 'dark-theme.css' });
      } else if (value.theme === 'horizon') {
        style = this.styleLoader.loadStyleFromURL({ href: 'horizon-theme.css' });
      }
    });
    inject(DestroyRef).onDestroy(cleanUpStyle);
  }
}
