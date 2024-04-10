import { Injectable, Injector, OnDestroy, type ProviderToken } from '@angular/core';
import { LoggerService } from '@o3r/logger';
import { catchError, combineLatest, distinctUntilChanged, firstValueFrom, from, map, of, Subject, Subscription, switchMap, withLatestFrom } from 'rxjs';
import {
  deletePlaceholderTemplateEntity,
  PlaceholderRequestReply,
  PlaceholderTemplateStore,
  selectPlaceholderRequestEntities,
  selectPlaceholderTemplateEntities,
  setPlaceholderRequestEntityFromUrl,
  setPlaceholderTemplateEntity,
  updatePlaceholderRequestEntity
} from '../../stores/index';
import { select, Store } from '@ngrx/store';
import type { PlaceholderUrlUpdate } from './placeholder.interface';
import type { LocalizationService } from '@o3r/localization';
import type { DynamicContentService } from '@o3r/dynamic-content';

/**
 * Service to handle async PlaceholderTemplate actions
 */
@Injectable({
  providedIn: 'root'
})
export class PlaceholderService implements OnDestroy {

  protected subscription = new Subscription();

  protected placeholdersActions$: Subject<{ placeholderId: string; templateUrl: string; priority: number }[]> = new Subject();

  constructor(store: Store<PlaceholderTemplateStore>, private readonly injector: Injector, private readonly logger: LoggerService) {

    const lang$ = from(import(/* @vite-ignore */ `${'@o3r/localization'}`)).pipe(
      // eslint-disable-next-line @typescript-eslint/naming-convention
      switchMap(({ LocalizationService }: { LocalizationService: ProviderToken<LocalizationService> }) =>
        this.injector.get(LocalizationService, null)?.getTranslateService().onLangChange.pipe(
          map(({ lang }) => lang),
          distinctUntilChanged()
        ) || of(null)
      ),
      catchError(() => of(null)));

    const filteredActions$ = combineLatest([
      lang$,
      this.placeholdersActions$.pipe(distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)))
    ]).pipe(
      withLatestFrom(
        combineLatest([store.pipe(select(selectPlaceholderTemplateEntities)), store.pipe(select(selectPlaceholderRequestEntities))])
      ),
      map(([langAndTemplatesUrls, storedPlaceholdersAndRequests]) => {
        const [lang, placeholderActions] = langAndTemplatesUrls;
        const storedPlaceholders = storedPlaceholdersAndRequests[0] || {};
        const storedPlaceholderRequests = storedPlaceholdersAndRequests[1] || {};
        const placeholderNewRequests: { rawUrl: string; resolvedUrl: string }[] = [];
        // Stores all raw Urls used from the current engine execution
        const usedUrls: Record<string, boolean> = {};
        // Get all Urls that needs to be resolved from current rules engine output
        const placeholdersTemplates = placeholderActions.reduce((acc, placeholderAction) => {
          const placeholdersTemplateUrl = {
            rawUrl: placeholderAction.templateUrl,
            priority: placeholderAction.priority
          };
          if (acc[placeholderAction.placeholderId]) {
            acc[placeholderAction.placeholderId].push(placeholdersTemplateUrl);
          } else {
            acc[placeholderAction.placeholderId] = [placeholdersTemplateUrl];
          }
          const resolvedUrl = this.resolveUrlWithLang(placeholderAction.templateUrl, lang);
          // Filters duplicates and resolved urls that are already in the store
          if (!usedUrls[placeholderAction.templateUrl] && (!storedPlaceholderRequests[placeholderAction.templateUrl]
              || storedPlaceholderRequests[placeholderAction.templateUrl]!.resolvedUrl !== resolvedUrl)) {
            placeholderNewRequests.push({
              rawUrl: placeholderAction.templateUrl,
              resolvedUrl: this.resolveUrlWithLang(placeholderAction.templateUrl, lang)
            });
          }
          usedUrls[placeholderAction.templateUrl] = true;
          return acc;
        }, {} as { [key: string]: { rawUrl: string; priority: number }[] });
          // Urls not used anymore and not already disabled
        const placeholderRequestsToDisable: string[] = [];
        // Urls used that were disabled
        const placeholderRequestsToEnable: string[] = [];
        Object.keys(storedPlaceholderRequests).forEach((storedPlaceholderRequestRawUrl) => {
          const usedFromEngineIteration = usedUrls[storedPlaceholderRequestRawUrl];
          const usedFromStore = (storedPlaceholderRequests && storedPlaceholderRequests[storedPlaceholderRequestRawUrl]) ? storedPlaceholderRequests[storedPlaceholderRequestRawUrl]!.used : false;
          if (!usedFromEngineIteration && usedFromStore) {
            placeholderRequestsToDisable.push(storedPlaceholderRequestRawUrl);
          } else if (usedFromEngineIteration && !usedFromStore) {
            placeholderRequestsToEnable.push(storedPlaceholderRequestRawUrl);
          }
        });
        // Placeholder that are no longer filled by the current engine execution output will be cleared
        const placeholdersTemplatesToBeCleanedUp = Object.keys(storedPlaceholders)
          .filter(placeholderId => !placeholdersTemplates[placeholderId]);

        const placeholdersTemplatesToBeSet = Object.keys(placeholdersTemplates).reduce((changedPlaceholderTemplates, placeholderTemplateId) => {
          // Caching if the placeholder template already exists with the same urls
          if (!storedPlaceholders[placeholderTemplateId] ||
              !(JSON.stringify(storedPlaceholders[placeholderTemplateId]!.urlsWithPriority) === JSON.stringify(placeholdersTemplates[placeholderTemplateId]))) {
            changedPlaceholderTemplates.push({
              id: placeholderTemplateId,
              urlsWithPriority: placeholdersTemplates[placeholderTemplateId]
            });
          }
          return changedPlaceholderTemplates;
        }, [] as { id: string; urlsWithPriority: { rawUrl: string; priority: number }[] }[]);
        return {
          placeholdersTemplatesToBeCleanedUp,
          placeholderRequestsToDisable,
          placeholderRequestsToEnable,
          placeholdersTemplatesToBeSet,
          placeholderNewRequests
        };
      })
    );
    this.subscription.add(filteredActions$.subscribe((placeholdersUpdates) => {
      placeholdersUpdates.placeholdersTemplatesToBeCleanedUp.forEach(placeholderId =>
        store.dispatch(deletePlaceholderTemplateEntity({
          id: placeholderId
        }))
      );
      placeholdersUpdates.placeholdersTemplatesToBeSet.forEach(placeholdersTemplateToBeSet => {
        store.dispatch(setPlaceholderTemplateEntity({ entity: placeholdersTemplateToBeSet }));
      });
      placeholdersUpdates.placeholderRequestsToDisable.forEach(placeholderRequestToDisable => {
        store.dispatch(updatePlaceholderRequestEntity({ entity: { id: placeholderRequestToDisable, used: false } }));
      });
      placeholdersUpdates.placeholderRequestsToEnable.forEach(placeholderRequestToEnable => {
        store.dispatch(updatePlaceholderRequestEntity({ entity: { id: placeholderRequestToEnable, used: true } }));
      });
      placeholdersUpdates.placeholderNewRequests.forEach(placeholderNewRequest => {
        store.dispatch(setPlaceholderRequestEntityFromUrl({
          resolvedUrl: placeholderNewRequest.resolvedUrl,
          id: placeholderNewRequest.rawUrl,
          call: this.retrieveTemplate(placeholderNewRequest.resolvedUrl)
        }));
      });
    }));
  }

  /**
   * Localize the url, replacing the language marker
   * @param url
   * @param language
   */
  protected resolveUrlWithLang(url: string, language: string | null): string {
    if (!language && url.includes('[LANGUAGE]')) {
      this.logger.warn(`Missing language when trying to resolve ${url}`);
    }
    return language ? url.replace(/\[LANGUAGE]/g, language) : url;
  }

  /**
   * Retrieve template as json from a given url
   * @param url
   */
  protected async retrieveTemplate(url: string): Promise<PlaceholderRequestReply> {
    const resolvedUrl$ = from(import(/* @vite-ignore */ `${'@o3r/dynamic-content'}`)).pipe(
      // eslint-disable-next-line @typescript-eslint/naming-convention
      switchMap(({ DynamicContentService }: { DynamicContentService: ProviderToken<DynamicContentService> }) =>
        this.injector.get(DynamicContentService, null)?.getContentPathStream(url) || of(url)),
      catchError(() => of(url))
    );
    const fullUrl = await firstValueFrom(resolvedUrl$);
    return fetch(fullUrl).then((response) => response.json());
  }

  /**
   * Update the template URLs of all the placeholders
   * @param placeholderUpdates list of placeholder templates to update
   */
  public updatePlaceholderTemplateUrls(placeholderUpdates: PlaceholderUrlUpdate[]) {
    const templates = placeholderUpdates.map((action) => ({
      placeholderId: action.placeholderId,
      templateUrl: action.value,
      priority: action.priority || 0
    }));

    this.placeholdersActions$.next(templates);
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
