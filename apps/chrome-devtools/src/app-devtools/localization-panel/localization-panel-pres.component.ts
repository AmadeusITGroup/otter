import {
  AsyncPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  type Signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  DfTooltipModule,
} from '@design-factory/design-factory';
import {
  NgbAccordionDirective,
  NgbAccordionModule,
} from '@ng-bootstrap/ng-bootstrap';
import type {
  JSONLocalization,
  LocalizationMetadata,
} from '@o3r/localization';
import {
  map,
  throttleTime,
} from 'rxjs/operators';
import {
  ChromeExtensionConnectionService,
  LocalizationService,
  StateService,
} from '../../services';

const THROTTLE_TIME = 100;

type TranslationControl = FormControl<string | null>;
type LangTranslationsControl = FormGroup<Record<string, TranslationControl>>;

@Component({
  selector: 'o3r-localization-panel-pres',
  templateUrl: './localization-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgbAccordionModule,
    DfTooltipModule,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe
  ]
})
export class LocalizationPanelPresComponent {
  private readonly connectionService = inject(ChromeExtensionConnectionService);
  private readonly localizationService = inject(LocalizationService);
  private readonly stateService = inject(StateService);
  private readonly maxItemDisplayed = 20;

  public readonly isTranslationDeactivationEnabled = this.localizationService.isTranslationDeactivationEnabled;
  public readonly localizations: Signal<LocalizationMetadata>;
  public readonly hasLocalizations: Signal<boolean>;
  public readonly currentLanguage = this.localizationService.currentLanguage;
  public readonly filteredLocalizations: Signal<LocalizationMetadata>;
  public readonly languages = this.localizationService.languages;
  public readonly hasSeveralLanguages: Signal<boolean>;
  public readonly isTruncated: Signal<boolean>;

  public readonly localizationActiveStateOverridesForCurrentLang = computed(() => {
    const lang = this.currentLanguage();
    if (!lang) {
      return {};
    }
    return this.stateService.activeState()?.localizations?.[lang] || {};
  });

  public readonly localizationLocalStateOverridesForCurrentLang = computed(() => {
    const lang = this.currentLanguage();
    if (!lang) {
      return {};
    }
    return this.stateService.localState()?.localizations?.[lang] || {};
  });

  public readonly activeStateName = computed(() => this.stateService.activeState()?.name);
  public form = new FormGroup({
    search: new FormControl(''),
    lang: new FormControl(''),
    showKeys: new FormControl(false),
    translations: new FormGroup<Record<string, LangTranslationsControl>>({})
  });

  public accordion = viewChild<NgbAccordionDirective>('acc');

  constructor() {
    this.hasSeveralLanguages = computed(() => this.languages().length >= 2);
    this.localizations = computed(() => this.localizationService.localizationsMetadata().filter((localization) => !localization.dictionary && !localization.ref));
    this.hasLocalizations = computed(() => this.localizations().length > 0);

    const search = toSignal(
      this.form.controls.search.valueChanges.pipe(
        map((text) => text?.toLowerCase() || ''),
        throttleTime(THROTTLE_TIME, undefined, { trailing: true })
      ),
      { initialValue: '' }
    );
    const searchMatch = computed(() => {
      const searchText = search();
      return searchText
        ? this.localizations().filter(({ key, description, tags, ref }) =>
          [key, description, ...(tags || []), ref].some((value) => value?.toLowerCase().includes(searchText))
        )
        : this.localizations();
    });

    this.filteredLocalizations = computed(() => {
      return searchMatch().slice(0, this.maxItemDisplayed);
    });

    this.isTruncated = computed(() => this.filteredLocalizations().length < searchMatch().length);

    effect(() => {
      const lang = this.currentLanguage();
      if (lang) {
        this.form.controls.lang.setValue(lang);
      }
    });
    this.form.controls.lang.valueChanges.pipe(takeUntilDestroyed()).subscribe((language) => {
      // Else refresh issue (maybe can be solved differently)
      this.accordion()?.collapseAll();
      this.localizationService.switchLanguage(language);
    });
    this.form.controls.showKeys.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.connectionService.sendMessage('displayLocalizationKeys', { toggle: !!value });
    });
    effect(() => {
      const translations = this.filteredLocalizations();
      const lang = untracked(this.currentLanguage);
      if (!lang) {
        return;
      }
      translations.forEach(({ key }) => {
        this.upsertKeyForm(key, lang);
      });
    });
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

  private upsertKeyForm(key: string, lang: string) {
    let langControl = this.form.controls.translations.controls[lang];
    if (!langControl) {
      langControl = new FormGroup<Record<string, TranslationControl>>({});
      this.form.controls.translations.addControl(lang, langControl);
    }
    const control = langControl.controls[key];
    const controlValue = this.stateService.localState().localizations?.[this.form.value.lang || '']?.[key]
      || untracked(this.localizationService.localizationsMetadata).find((loc) => loc.key === key)?.value
      || '';
    if (!control) {
      const newControl = new FormControl<string>(controlValue);
      langControl.addControl(key, newControl);
      newControl.valueChanges.pipe(
        takeUntilDestroyed(),
        throttleTime(THROTTLE_TIME, undefined, { trailing: true })
      ).subscribe((newValue) => {
        this.onLocalizationChange(key, newValue ?? '');
      });
    } else if (control.value !== controlValue) {
      control.setValue(controlValue);
    }
  }

  /**
   * Change localization key value
   * @param localizationKey
   * @param newValue
   */
  private onLocalizationChange(localizationKey: string, newValue: string) {
    const lang = this.currentLanguage();
    if (!lang) {
      return;
    }
    const initialValue = this.stateService.localState().localizations?.[lang]?.[localizationKey]
      || this.localizationService.translationsForCurrentLanguage()[localizationKey]
      || this.localizationService.localizationsMetadata().find((loc) => loc.key === localizationKey)?.value
      || '';
    if (newValue !== initialValue) {
      void this.stateService.updateLocalState({
        localizations: {
          [lang]: {
            [localizationKey]: newValue
          }
        }
      });
    }
    this.connectionService.sendMessage('updateLocalization', {
      key: localizationKey,
      value: newValue
    });
  }

  /**
   * Reset localization value
   * @param localization
   */
  public onLocalizationReset(localization: JSONLocalization) {
    const localValue = this.localizationLocalStateOverridesForCurrentLang()[localization.key];
    const stateValue = this.localizationActiveStateOverridesForCurrentLang()[localization.key];
    const runtimeValue = this.localizationService.translationsForCurrentLanguage()[localization.key];
    const newValue = (localValue === stateValue ? undefined : stateValue) || runtimeValue || localization.value || '';
    this.onLocalizationChange(
      localization.key,
      newValue
    );
    const lang = this.currentLanguage();
    if (!lang) {
      return;
    }
    this.form.controls.translations.controls[lang]?.controls[localization.key].setValue(newValue);
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
}
