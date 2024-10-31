import {
  AsyncPipe
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  O3rComponent
} from '@o3r/core';
import {
  StyleLazyLoader,
  StyleLazyLoaderModule
} from '@o3r/dynamic-content';
import {
  Subscription
} from 'rxjs';
import {
  DatePickerInputPresComponent
} from '../../utilities';

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
export class DesignTokenPresComponent implements OnDestroy {
  private readonly styleLoader = inject(StyleLazyLoader);

  /**
   * Form group
   */
  public form: FormGroup<{ theme: FormControl<string | null> }> = inject(FormBuilder).group({
    theme: new FormControl<string | null>('')
  });

  private readonly subscription = new Subscription();

  constructor() {
    let style: HTMLElement | null = null;
    const cleanUpStyle = () => {
      if (style?.parentNode) {
        style.remove();
        style = null;
      }
    };
    this.subscription.add(
      this.form.valueChanges.subscribe((value) => {
        cleanUpStyle();
        if (value.theme === 'dark') {
          style = this.styleLoader.loadStyleFromURL({ href: 'dark-theme.css' });
        } else if (value.theme === 'horizon') {
          style = this.styleLoader.loadStyleFromURL({ href: 'horizon-theme.css' });
        }
      })
    );
    inject(DestroyRef).onDestroy(cleanUpStyle);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
