import { Injectable, Injector, OnDestroy, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import type { RulesEngineActionHandler } from '@o3r/core';
import {
  deletePlaceholderTemplateEntity,
  PlaceholderRequestReply,
  PlaceholderTemplateStore,
  selectPlaceholderRequestEntities,
  selectPlaceholderTemplateEntities,
  setPlaceholderRequestEntityFromUrl,
  setPlaceholderTemplateEntity,
  updatePlaceholderRequestEntity
} from '@o3r/components';
import { DynamicContentService } from '@o3r/dynamic-content';
import { LocalizationService } from '@o3r/localization';
import { LoggerService } from '@o3r/logger';
import { combineLatest, distinctUntilChanged, firstValueFrom, map, of, startWith, Subject, Subscription, withLatestFrom } from 'rxjs';
import { ActionUpdatePlaceholderBlock, RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE } from './placeholder.interfaces';

/**
 * Service to handle async PlaceholderTemplate actions
 */
@Injectable()
export class PlaceholderRulesEngineActionHandler implements OnDestroy, RulesEngineActionHandler<ActionUpdatePlaceholderBlock> {

  protected subscription = new Subscription();

  protected placeholdersActions$: Subject<{ placeholderId: string; templateUrl: string; priority: number }[]> = new Subject();

  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE] as const;

  constructor(
    store: Store<PlaceholderTemplateStore>,
    private readonly logger: LoggerService,
    private readonly injector: Injector,
    @Optional() translateService?: LocalizationService
  ) {

    const lang$ = translateService ? translateService.getTranslateService().onLangChange.pipe(
      map(({ lang }) => lang),
      startWith(translateService.getCurrentLanguage()),
      distinctUntilChanged()
    ) : of(null);

    const filteredActions$ = combineLatest([
      lang$,
      this.placeholdersActions$.pipe(
        distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next))
      )
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
    const resolvedUrl$ = this.injector.get(DynamicContentService, null, { optional: true })?.getContentPathStream(url) || of(url);
    const fullUrl = await firstValueFrom(resolvedUrl$);
    return fetch(fullUrl).then((response) => response.json());
  }

  /** @inheritdoc */
  public executeActions(actions: ActionUpdatePlaceholderBlock[]) {
    const templates = actions.map((action) => ({
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
