import { computed, effect, inject, Injectable, type Signal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import {
  ChromeExtensionConnectionService,
  filterAndMapMessage,
  isApplicationInformationMessage
} from './connection.service';
import { ACTIVE_STATE_NAME_KEY, type State, type StateOverride, STATES_KEY } from '../extension/interface';
import { LocalizationService } from './localization.service';

@Injectable({providedIn: 'root'})
export class StateService {
  private readonly connectionService = inject(ChromeExtensionConnectionService);
  private readonly localizationService = inject(LocalizationService);
  private readonly statesStorageKey: Signal<string | undefined>;
  private readonly activeStateNameStorageKey: Signal<string | undefined>;
  private readonly activeStateName = signal<string>('local');
  public readonly languages$ = this.localizationService.languages$;

  public readonly states = signal<Record<string, State>>({});
  public readonly localState = signal<State>({ name: 'local', color: 'black', colorContrast: 'white' });
  public readonly activeState: Signal<State | undefined>;
  public readonly hasLocalChanges: Signal<boolean>;

  constructor() {
    const appName = toSignal(
      this.connectionService.message$.pipe(
        filterAndMapMessage(
          isApplicationInformationMessage,
          (message) => message.appName
        )
      )
    );

    this.statesStorageKey = computed(() => appName() && `${appName()}_${STATES_KEY}`);
    effect(async () => {
      const key = this.statesStorageKey();
      if (key) {
        const states = (await chrome.storage.sync.get(key))[key] as Record<string, State> | undefined;
        if (states) {
          this.states.set(states);
        }
      }
    }, { allowSignalWrites: true });
    effect(() => {
      const key = this.statesStorageKey();
      if (key) {
        const states = this.states();
        void chrome.storage.sync.set({
          [key]: states
        });
      }
    });

    this.activeStateNameStorageKey = computed(() => appName() && `${appName()}_${ACTIVE_STATE_NAME_KEY}`);
    effect(async () => {
      const key = this.activeStateNameStorageKey();
      if (key) {
        const name = (await chrome.storage.sync.get(key))[key] as string | undefined;
        if (name) {
          this.activeStateName.set(name);
        }
      }
    }, { allowSignalWrites: true });
    effect(() => {
      const key = this.activeStateNameStorageKey();
      if (key) {
        const name = this.activeStateName();
        void chrome.storage.sync.set({
          [key]: name
        });
      }
    });

    this.activeState = computed(() => {
      const stateName = this.activeStateName();
      return stateName ? this.states()[stateName] : undefined;
    });

    combineLatest([
      toObservable(this.activeState),
      this.languages$
    ]).pipe(
      takeUntilDestroyed()
    ).subscribe(([state, languages]) => {
      this.updateLocalState(state || {}, true);
      // TODO reset configuration (is it possible? based on default value from metadata if present?)
      // Reset all styling variables before applying override of the new state
      this.connectionService.sendMessage('resetStylingVariables', {});
      languages.forEach((lang) => this.connectionService.sendMessage('reloadLocalizationKeys', {lang}));
      if (!state) {
        this.connectionService.sendMessage('unselectState', {});
        return;
      }
      Object.entries(state.configurations || {}).forEach(([id, configValue]) => {
        this.connectionService.sendMessage('updateConfig', { id, configValue });
      });
      Object.entries(state.localizations || {}).forEach(([lang, overrides]) => {
        Object.entries(overrides).forEach(([key, value]) => {
          this.connectionService.sendMessage('updateLocalization', {
            key, value, lang
          });
        });
      });
      if (state.stylingVariables && Object.keys(state.stylingVariables).length) {
        this.connectionService.sendMessage('updateStylingVariables', {
          variables: state.stylingVariables
        });
      }
      this.connectionService.sendMessage('stateSelection', {
        stateName: state.name,
        stateColor: state.color,
        stateColorContrast: state.colorContrast
      });
    });

    this.hasLocalChanges = computed(() => {
      const {
        stylingVariables: localStylingVariableOverride = {},
        configurations: localConfigurationsOverride = {},
        localizations: localLocalizationsOverride = {}
      } = this.localState() || {};
      const {
        stylingVariables: activeStylingVariableOverride = {},
        configurations: activeConfigurationsOverride = {},
        localizations: activeLocalizationsOverride = {}
      } = this.activeState() || {};

      const hasLocalConfigOverride = Object.keys(activeConfigurationsOverride).length !== Object.keys(localConfigurationsOverride).length
        || Object.entries(activeConfigurationsOverride).some(([key, value]) => JSON.stringify(activeConfigurationsOverride[key]) !== JSON.stringify(value));
      const hasLocalLocalizationOverride = Object.keys(activeLocalizationsOverride).length !== Object.keys(localLocalizationsOverride).length
        || Object.entries(activeLocalizationsOverride).some(([lang, value]) =>
          Object.keys(value).length !== Object.keys(localLocalizationsOverride[lang]).length
          || Object.entries(value).some(([key, localization]) => localization !== localLocalizationsOverride[lang][key])
        );
      const hasLocalStylingVariableOverride = Object.keys(activeStylingVariableOverride).length !== Object.keys(localStylingVariableOverride).length
        || Object.entries(activeStylingVariableOverride).some(([key, value]) => localStylingVariableOverride[key] !== value);

      return hasLocalConfigOverride || hasLocalLocalizationOverride || hasLocalStylingVariableOverride;
    });
  }

  public updateState(oldStateName: string, state: State) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.states.update(({ [oldStateName]: oldState, ...remainingStates }) => ({
      ...remainingStates,
      [state.name]: state
    }));
  }

  public deleteState(stateName: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.states.update(({ [stateName]: state, ...remainingStates }) => remainingStates);
  }

  /**
   * Change the active state
   * @param stateName
   */
  public setActiveState(stateName: string | undefined | null) {
    this.activeStateName.set(stateName || 'local');
  }

  /**
   * Update the session state
   * @param changes
   * @param override
   */
  public updateLocalState(
    changes: Omit<StateOverride, 'stylingVariables'> & { stylingVariables?: Record<string, string | null> },
    override = false
  ) {
    this.localState.update((state) => {
      const configurationOverrides = {
        ...(override ? undefined : state.configurations),
        ...changes.configurations
      };
      const localizationOverrides = Object.entries(changes.localizations || {})
        .reduce((acc, [lang, overrides]) => {
          Object.entries(overrides).forEach(([locKey, locValue]) => {
            acc ||= {};
            acc[lang] ||= {};
            acc[lang][locKey] = locValue;
          });
          return acc;
        }, override ? undefined : state.localizations);
      const stylingOverrides = Object.fromEntries(Object.entries({
        ...(override ? undefined : state.stylingVariables),
        ...changes.stylingVariables
      }).filter((entry): entry is [string, string] => entry[1] !== null));
      const stateOverrides = {
        configurations: Object.keys(configurationOverrides).length ? configurationOverrides : undefined,
        localizations: Object.keys(localizationOverrides || {}).length ? localizationOverrides : undefined,
        stylingVariables: Object.keys(stylingOverrides).length ? stylingOverrides : undefined
      } satisfies StateOverride;
      return {
        ...state,
        ...stateOverrides
      };
    });
  }
}
