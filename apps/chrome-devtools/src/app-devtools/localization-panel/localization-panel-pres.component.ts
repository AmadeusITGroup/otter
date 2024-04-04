import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnDestroy, ViewEncapsulation } from '@angular/core';
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
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, throttleTime } from 'rxjs/operators';
import { ChromeExtensionConnectionService } from '../../services/connection.service';

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
  public isTranslationDeactivationEnabled$: Observable<boolean>;
  public localizations$: Observable<LocalizationMetadata>;
  public filteredLocalizations$: Observable<LocalizationMetadata>;
  public languages$: Observable<string[]>;
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
    this.languages$ = this.connectionService.message$.pipe(
      filter((message): message is LanguagesContentMessage => message.dataType === 'languages'),
      map((message) => message.languages),
      shareReplay({bufferSize: 1, refCount: true})
    );
    this.localizations$ = this.connectionService.message$.pipe(
      filter((message): message is LocalizationsContentMessage => message.dataType === 'localizations'),
      map((message) => message.localizations.filter((localization) => !localization.dictionary)),
      shareReplay({bufferSize: 1, refCount: true})
    );
    this.filteredLocalizations$ = combineLatest([
      this.localizations$,
      this.form.controls.search.valueChanges.pipe(
        map((search) => search?.toLowerCase()),
        throttleTime(500),
        startWith('')
      )
    ]).pipe(
      map(([localizations, search]) => search
        ? localizations.filter(({ key, description, tags, ref }) =>
          [key, description, ...(tags || []), ref].some((value) => value?.toLowerCase().includes(search))
        )
        : localizations
      ),
      startWith([])
    );
    this.isTranslationDeactivationEnabled$ = this.connectionService.message$.pipe(
      filter((message): message is IsTranslationDeactivationEnabledContentMessage => message.dataType === 'isTranslationDeactivationEnabled'),
      map((message) => message.enabled),
      shareReplay({bufferSize: 1, refCount: true})
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
                throttleTime(500)
              ).subscribe((newValue) => this.onLocalizationChange(key, newValue ?? ''))
            );
          } else {
            control.setValue(value, { emitEvent: false });
          }
        });
      })
    );
    this.subscription.add(
      this.isTranslationDeactivationEnabled$.subscribe((enabled) => {
        const control = this.form.controls.showKeys;
        if (enabled) {
          control.enable();
        } else {
          control.disable();
        }
      })
    );
    this.subscription.add(
      this.languages$.subscribe((languages) => {
        const control = this.form.controls.lang;
        if (languages.length >= 2) {
          control.enable();
        } else {
          control.disable();
        }
      })
    );
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
