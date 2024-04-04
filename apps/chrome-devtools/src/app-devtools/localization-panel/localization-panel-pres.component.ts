import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, type OnDestroy, type Signal, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import type {
  GetTranslationValuesContentMessage,
  IsTranslationDeactivationEnabledContentMessage,
  LanguagesContentMessage,
  LocalizationMetadata,
  LocalizationsContentMessage,
  SwitchLanguageContentMessage
} from '@o3r/localization';
import { Subscription } from 'rxjs';
import { filter, map, shareReplay, throttleTime } from 'rxjs/operators';
import { ChromeExtensionConnectionService } from '../../services/connection.service';

const THROTTLE_TIME = 100;

@Component({
  selector: 'o3r-localization-panel-pres',
  templateUrl: './localization-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    NgbAccordionModule,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe
  ]
})
export class LocalizationPanelPresComponent implements OnDestroy {
  public readonly isTranslationDeactivationEnabled: Signal<boolean>;
  public readonly localizations: Signal<LocalizationMetadata>;
  public readonly hasLocalizations: Signal<boolean>;
  public readonly filteredLocalizations: Signal<LocalizationMetadata>;
  public readonly languages: Signal<string[]>;
  public readonly hasSeveralLanguages: Signal<boolean>;
  public form = new FormGroup({
    search: new FormControl(''),
    lang: new FormControl(''),
    showKeys: new FormControl(false),
    translations: new UntypedFormGroup({})
  });

  private readonly connectionService = inject(ChromeExtensionConnectionService);

  private readonly subscription = new Subscription();

  constructor() {
    this.connectionService.sendMessage(
      'requestMessages',
      {
        only: [
          'localizations',
          'languages',
          'switchLanguage',
          'isTranslationDeactivationEnabled'
        ]
      }
    );
    this.languages = toSignal(
      this.connectionService.message$.pipe(
        filter((message): message is LanguagesContentMessage => message.dataType === 'languages'),
        map((message) => message.languages)
      ),
      { initialValue: [] }
    );
    this.hasSeveralLanguages = computed(() => this.languages().length >= 2);
    this.localizations = toSignal(
      this.connectionService.message$.pipe(
        filter((message): message is LocalizationsContentMessage => message.dataType === 'localizations'),
        map((message) => message.localizations.filter((localization) => !localization.dictionary))
      ),
      { initialValue: [] }
    );
    this.hasLocalizations = computed(() => !!this.localizations().length);

    const search = toSignal(
      this.form.controls.search.valueChanges.pipe(
        map((text) => text?.toLowerCase() || ''),
        throttleTime(THROTTLE_TIME, undefined, { trailing: true })
      ),
      { initialValue: '' }
    );

    this.filteredLocalizations = computed(() => {
      const searchText = search();
      return searchText
        ? this.localizations().filter(({ key, description, tags, ref }) => [key, description, ...(tags || []), ref].some((value) => value?.toLowerCase().includes(searchText)))
        : this.localizations();
    });

    this.isTranslationDeactivationEnabled = toSignal(
      this.connectionService.message$.pipe(
        filter((message): message is IsTranslationDeactivationEnabledContentMessage => message.dataType === 'isTranslationDeactivationEnabled'),
        map((message) => message.enabled)
      ),
      { initialValue: false }
    );
    const currLang$ = this.connectionService.message$.pipe(
      filter((message): message is SwitchLanguageContentMessage => message.dataType === 'switchLanguage'),
      map((message) => message.language),
      shareReplay({bufferSize: 1, refCount: true})
    );
    this.subscription.add(currLang$.subscribe((lang) => {
      this.form.controls.lang.setValue(lang);
      this.connectionService.sendMessage('requestMessages', {
        only: ['getTranslationValuesContentMessage']
      });
    }));
    this.subscription.add(
      this.form.controls.lang.valueChanges.subscribe((language) => {
        if (language) {
          this.connectionService.sendMessage('switchLanguage', { language });
          this.connectionService.sendMessage(
            'requestMessages',
            {
              only: [
                'getTranslationValuesContentMessage'
              ]
            }
          );
        }
      })
    );
    this.subscription.add(
      this.form.controls.showKeys.valueChanges.subscribe((value) => {
        this.connectionService.sendMessage('displayLocalizationKeys', { toggle: !!value });
      })
    );
    this.subscription.add(
      this.connectionService.message$.pipe(
        filter((message): message is GetTranslationValuesContentMessage => message.dataType === 'getTranslationValuesContentMessage'),
        map((message) => message.translations)
      ).subscribe((translations) => {
        const translationControl = this.form.controls.translations;
        Object.entries(translations).forEach(([key, value]) => {
          const control = translationControl.controls[key];
          if (!control) {
            const newControl = new FormControl<string>(value);
            translationControl.addControl(key, newControl);
            this.subscription.add(
              newControl.valueChanges.pipe(
                throttleTime(THROTTLE_TIME, undefined, { trailing: true })
              ).subscribe((newValue) => this.onLocalizationChange(key, newValue ?? ''))
            );
          } else {
            control.setValue(value, { emitEvent: false });
          }
        });
      })
    );
    effect(() => {
      const control = this.form.controls.showKeys;
      if (this.isTranslationDeactivationEnabled()) {
        control.enable();
      } else {
        control.disable();
      }
    });
    effect(() => {
      const control = this.form.controls.lang;
      if (this.hasSeveralLanguages()) {
        control.enable();
      } else {
        control.disable();
      }
    });
  }

  /**
   * Change localization key value
   * @param localizationKey
   * @param newValue
   */
  private onLocalizationChange(localizationKey: string, newValue: string) {
    this.connectionService.sendMessage('updateLocalization', {
      key: localizationKey,
      value: newValue
    });
  }

  /**
   * Reset localization change for current language
   */
  public resetChange() {
    this.connectionService.sendMessage('reloadLocalizationKeys', {});
    this.connectionService.sendMessage(
      'requestMessages',
      {
        only: [
          'getTranslationValuesContentMessage'
        ]
      }
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
