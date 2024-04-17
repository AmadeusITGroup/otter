import { effect, inject, Injectable, signal, type Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import type {
  GetTranslationValuesContentMessage,
  IsTranslationDeactivationEnabledContentMessage,
  LanguagesContentMessage,
  LocalizationsContentMessage,
  SwitchLanguageContentMessage
} from '@o3r/localization';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { ChromeExtensionConnectionService, filterAndMapMessage } from './connection.service';

@Injectable({ providedIn: 'root' })
export class LocalizationService {
  private readonly connectionService = inject(ChromeExtensionConnectionService);
  public readonly localizationsMetadata = toSignal(
    this.connectionService.message$.pipe(
      filterAndMapMessage(
        (message): message is LocalizationsContentMessage => message.dataType === 'localizations',
        (message) => message.localizations
      )
    ),
    { initialValue: [] }
  );
  public readonly languages = toSignal(
    this.connectionService.message$.pipe(
      filterAndMapMessage(
        (message): message is LanguagesContentMessage => message.dataType === 'languages',
        (message) => message.languages
      )
    ),
    { initialValue: [] }
  );
  public readonly isTranslationDeactivationEnabled = toSignal(
    this.connectionService.message$.pipe(
      filterAndMapMessage(
        (message): message is IsTranslationDeactivationEnabledContentMessage => message.dataType === 'isTranslationDeactivationEnabled',
        (message) => message.enabled
      )
    ),
    { initialValue: false }
  );
  private readonly lang = signal<string | undefined>(undefined);
  public readonly currentLanguage = this.lang.asReadonly();

  public readonly translationsForCurrentLanguage: Signal<Record<string, string>> = toSignal(
    toObservable(this.currentLanguage).pipe(
      switchMap(() => this.connectionService.message$.pipe(
        filter((message): message is GetTranslationValuesContentMessage => message.dataType === 'getTranslationValuesContentMessage'),
        map((message) => message.translations),
        distinctUntilChanged()
      ))
    ),
    { initialValue: {} }
  );

  constructor() {
    effect(() => {
      this.connectionService.sendMessage('switchLanguage', { language: this.currentLanguage() });
      this.connectionService.sendMessage('requestMessages', { only: ['getTranslationValuesContentMessage'] });
    });
    const externalSwitchLanguage = toSignal(
      this.connectionService.message$.pipe(
        filterAndMapMessage(
          (message): message is SwitchLanguageContentMessage => message.dataType === 'switchLanguage',
          (message) => message.language
        )
      )
    );
    effect(() => {
      this.lang.set(externalSwitchLanguage());
    }, { allowSignalWrites: true });
  }

  /**
   * Change the current language
   * @param language
   */
  public switchLanguage(language?: string | null) {
    if (language && this.currentLanguage() !== language) {
      this.connectionService.sendMessage('switchLanguage', { language });
      this.lang.set(language);
    }
  }
}
