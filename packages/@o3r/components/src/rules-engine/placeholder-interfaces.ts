import type {
  RulesEngineAction,
} from '@o3r/core';
import type {
  Observable,
} from 'rxjs';

/**
 * Minimal subset of the underlying translation service (ngx-translate's `TranslateService` or
 * transloco's `TranslocoService`) exposing language-change notifications.
 * TODO: remove this abstraction and rely on the single supported translation service in v16
 */
export interface PlaceholderTranslateService {
  /** Language-change stream exposed by ngx-translate (`@o3r/localization`) */
  onLangChange?: Observable<{ lang: string }>;
  /** Language-change stream exposed by transloco (`@o3r/transloco`) */
  langChanges$?: Observable<string>;
}

/**
 * Minimal subset of the `LocalizationService` API (from `@o3r/localization` or `@o3r/transloco`)
 * used by the placeholder rules engine. Declared locally so that neither package is a hard dependency.
 * TODO: remove this abstraction and import `LocalizationService` directly from the single supported translation package in v16
 */
export interface PlaceholderLocalizationService {
  /** Translate a localization key, resolving the given interpolation parameters */
  translate(key: string, interpolateParams?: object): Observable<string>;
  /** Get the underlying translation service used by the localization service */
  getTranslateService(): PlaceholderTranslateService;
  /** Get the current active language */
  getCurrentLanguage(): string;
}

/** ActionUpdatePlaceholderBlock  */
export const RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE = 'UPDATE_PLACEHOLDER';

/**
 * Content of action that updates a placeholder
 */
export interface ActionUpdatePlaceholderBlock extends RulesEngineAction {
  actionType: typeof RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE;
  placeholderId: string;
  value: string;
  priority?: number;
}
