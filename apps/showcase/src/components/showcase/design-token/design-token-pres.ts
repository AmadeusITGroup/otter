import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import {
  form,
  FormField,
} from '@angular/forms/signals';
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
    FormField
  ],
  templateUrl: './design-token-pres.html',
  styleUrl: './design-token-pres.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignTokenPres {
  private readonly styleLoader = inject(StyleLazyLoader);

  /**
   * Form model
   */
  public model = signal({
    theme: ''
  });

  /**
   * Form tree
   */
  public formTree = form(this.model);

  constructor() {
    let style: HTMLElement | null = null;
    const cleanUpStyle = () => {
      if (style?.parentNode) {
        style.remove();
        style = null;
      }
    };
    effect(() => {
      const theme = this.model().theme;
      untracked(() => {
        cleanUpStyle();
        if (theme === 'dark') {
          style = this.styleLoader.loadStyleFromURL({ href: 'dark-theme.css' });
        } else if (theme === 'horizon') {
          style = this.styleLoader.loadStyleFromURL({ href: 'horizon-theme.css' });
        }
      });
    });
    inject(DestroyRef).onDestroy(cleanUpStyle);
  }
}
