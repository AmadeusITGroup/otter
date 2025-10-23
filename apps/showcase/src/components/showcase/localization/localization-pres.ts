import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  O3rComponent,
} from '@o3r/core';
import {
  Localization,
  LocalizationModule,
  LocalizationService,
  Translatable,
} from '@o3r/localization';
import {
  DatePickerInputPres,
} from '../../utilities';
import {
  LocalizationPresTranslation,
  translations,
} from './localization-pres-translation';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-localization-pres',
  templateUrl: './localization-pres.html',
  styleUrls: ['./localization-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizationModule, ReactiveFormsModule, DatePickerInputPres
  ]
})
export class LocalizationPres implements Translatable<LocalizationPresTranslation> {
  private readonly localizationService = inject(LocalizationService);

  /**
   * Form group
   */
  public form: FormGroup<{ destination: FormControl<string | null>; outboundDate: FormControl<string | null> }> = inject(FormBuilder).group({
    destination: new FormControl<string | null>(null),
    outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS))
  });

  /** Localization of the component*/
  @Input()
  @Localization('./localization-pres-localization.json')
  public translations: LocalizationPresTranslation = translations;

  constructor() {
    this.form.controls.destination.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      let language = 'en-GB';
      switch (value) {
        case 'PAR': {
          language = 'fr-FR';
          break;
        }
        case 'NYC': {
          language = 'en-US';
          break;
        }
      }
      this.localizationService.useLanguage(language);
    });
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
