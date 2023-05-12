import {Inject, Injectable, OnDestroy, Optional} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import type { PlaceholderRequestReply, PlaceholderTemplateStore } from '@o3r/components';
import {
  deletePlaceholderTemplateEntity,
  selectPlaceholderRequestEntities,
  selectPlaceholderTemplateEntities,
  setPlaceholderRequestEntityFromUrl,
  setPlaceholderTemplateEntity,
  updatePlaceholderRequestEntity
} from '@o3r/components';
import {computeConfigurationName, setConfigOverride} from '@o3r/configuration';
import type { ConfigOverrideStore, PropertyOverride } from '@o3r/configuration';
import {AssetPathOverrideStore, DynamicContentService, setAssetPathOverride} from '@o3r/dynamic-content';
import type { LocalizationOverrideStore } from '@o3r/localization';
import {setLocalizationOverride} from '@o3r/localization';
import {BehaviorSubject, combineLatest, firstValueFrom, Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';
import type {ActionBlock, Fact, Operator, Ruleset, UnaryOperator} from '../engine/index';
import {EngineDebugger, operatorList, RulesEngine} from '../engine/index';
import type {ActionOverrideBlock} from '../interfaces/index';
import type {RulesetsStore} from '../stores';
import {selectActiveRuleSets, selectAllRulesets, selectRuleSetLinkComponents} from '../stores';
import {RULES_ENGINE_OPTIONS, RulesEngineServiceOptions} from './rules-engine.token';
import {LoggerService} from '@o3r/logger';

@Injectable()
export class RulesEngineService implements OnDestroy {
  /** Map of engines dedicated to each rule sets */
  public readonly engine: RulesEngine;

  /** stream of the whole ruleset results */
  public events$: Observable<ActionOverrideBlock[]>;

  /** Enable action execution on new state change */
  public enabled: boolean;

  protected subscription = new Subscription();

  /** Map that stores subscriptions to onDemand ruleset */
  protected readonly temporarySubscriptionMap: Record<string, Subscription> = {};

  /** Rulesets to restrict the execution of the engine */
  protected ruleSets$: Observable<string[] | undefined>;

  protected linkedComponents$: BehaviorSubject<{ [key: string]: number }> = new BehaviorSubject({});

  protected placeholdersActions$: Subject<{ placeholderId: string; templateUrl: string; priority: number }[]> = new Subject();

  constructor(
    private store: Store<RulesetsStore & PlaceholderTemplateStore & AssetPathOverrideStore & LocalizationOverrideStore & ConfigOverrideStore>,
    private translateService: TranslateService,
    private dynamicContentService: DynamicContentService,
    private logger: LoggerService,
    @Optional() @Inject(RULES_ENGINE_OPTIONS) engineConfig?: RulesEngineServiceOptions) {

    this.enabled = !engineConfig?.dryRun;
    this.engine = new RulesEngine({
      debugger: engineConfig?.debug ? new EngineDebugger({eventsStackLimit: engineConfig?.debugEventsStackLimit}) : undefined,
      logger: this.logger
    });
    this.ruleSets$ = combineLatest([
      this.store.pipe(select(selectActiveRuleSets)),
      this.linkedComponents$.pipe(
        switchMap((linkedComponentsNamesMap) => this.store.pipe(
          select(selectRuleSetLinkComponents),
          map((linkComponentMap) => Object.keys(linkedComponentsNamesMap)
            .filter((linkedComponentsName) => linkedComponentsNamesMap[linkedComponentsName] > 0)
            .reduce((acc, compName) => {
              acc.push(...(linkComponentMap[compName] || []));
              return acc;
            }, [] as string[]))
        ))
      )
    ]).pipe(
      map(([activeRulesets, linkedComponentsRulesetsIds]) => ([...activeRulesets, ...linkedComponentsRulesetsIds]))
    );

    this.events$ = this.ruleSets$.pipe(
      this.engine.getEventStream<ActionOverrideBlock>(),
      shareReplay(1)
    );

    this.upsertOperators(operatorList);

    this.subscription.add(
      this.store.pipe(
        select(selectAllRulesets)
      ).subscribe((rulesets: Ruleset[]) => this.engine.upsertRulesets(rulesets))
    );

    this.subscription.add(
      this.events$.pipe(filter(() => this.enabled)).subscribe((events) => this.executeActionSync(events))
    );

    const lang$ = this.translateService.onLangChange.pipe(
      map(({lang}) => lang),
      distinctUntilChanged()
    );
    // TODO Check if distinctUntilChanged is a good idea
    // DistinctUntilChanged will prevent double instant emission (second processed before first reach the store)
    const filteredActions$ = combineLatest([lang$, this.placeholdersActions$.pipe(distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)))]).pipe(
      withLatestFrom(
        combineLatest([this.store.pipe(select(selectPlaceholderTemplateEntities)), this.store.pipe(select(selectPlaceholderRequestEntities))])
      ),
      map(([langAndTemplatesUrls, storedPlaceholdersAndRequests]) => {
        const [lang, placeholderActions] = langAndTemplatesUrls;
        const storedPlaceholders = storedPlaceholdersAndRequests[0] || {};
        const storedPlaceholderRequests = storedPlaceholdersAndRequests[1] || {};
        const placeholderNewRequests: { rawUrl: string; resolvedUrl: string }[] = [];
        // Stores all raw Urls used from the current engine execution
        const usedUrls = {};
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
        this.store.dispatch(deletePlaceholderTemplateEntity({
          id: placeholderId
        }))
      );
      placeholdersUpdates.placeholdersTemplatesToBeSet.forEach(placeholdersTemplateToBeSet => {
        this.store.dispatch(setPlaceholderTemplateEntity({entity: placeholdersTemplateToBeSet}));
      });
      placeholdersUpdates.placeholderRequestsToDisable.forEach(placeholderRequestToDisable => {
        this.store.dispatch(updatePlaceholderRequestEntity({entity: {id: placeholderRequestToDisable, used: false}}));
      });
      placeholdersUpdates.placeholderRequestsToEnable.forEach(placeholderRequestToEnable => {
        this.store.dispatch(updatePlaceholderRequestEntity({entity: {id: placeholderRequestToEnable, used: true}}));
      });
      placeholdersUpdates.placeholderNewRequests.forEach(placeholderNewRequest => {
        this.store.dispatch(setPlaceholderRequestEntityFromUrl({
          resolvedUrl: placeholderNewRequest.resolvedUrl,
          id: placeholderNewRequest.rawUrl,
          call: this.retrieveTemplate(placeholderNewRequest.resolvedUrl)
        }));
      });
    }));
  }

  /**
   * Execute the list of actions
   *
   * @param ruleEvent Rule engine execution result
   * @param actions
   */
  protected executeActionSync(actions: ActionOverrideBlock[]) {
    const configOverrides: { library: string; component: string; property: string; value: any }[] = [];
    const assets: Record<string, string> = {};
    const locs: Record<string, string> = {};
    const templates: { placeholderId: string; templateUrl: string; priority: number }[] = [];

    // create a map of actions depending on actions type
    actions.forEach((action: (ActionBlock & Record<string, any>)) => {
      switch (action.actionType) {
        case 'UPDATE_ASSET': {
          assets[action.asset] = action.value;
          break;
        }
        case 'UPDATE_LOCALISATION': {
          locs[action.key] = action.value;
          break;
        }
        case 'UPDATE_CONFIG': {
          if (action.library && action.component && action.property && typeof action.value !== 'undefined') {
            configOverrides.push({
              component: action.component,
              library: action.library,
              property: action.property,
              value: action.value
            });
          }
          break;
        }
        case 'UPDATE_PLACEHOLDER': {
          templates.push({
            placeholderId: action.placeholderId,
            templateUrl: action.value,
            priority: action.priority || 0
          });
          break;
        }
        default: {
          break;
        }
      }
    });

    const configOverrideMap: { [key: string]: { overrides: PropertyOverride } } =
      configOverrides.reduce<{ [key: string]: { overrides: PropertyOverride } }>((acc, ov) => {
        const configName = computeConfigurationName(ov.component, ov.library);
        acc[configName] ||= {overrides: {}};
        acc[configName].overrides[ov.property] = ov.value;
        return acc;
      }, {} as { [key: string]: { overrides: PropertyOverride } });

    const configs: Record<string, PropertyOverride> = {};
    Object.entries(configOverrideMap).forEach(([key, value]) => {
      configs[key] = value.overrides;
    });
    this.store.dispatch(setAssetPathOverride({state: {assetPathOverrides: assets}}));
    this.store.dispatch(setLocalizationOverride({state: {localizationOverrides: locs}}));
    this.placeholdersActions$.next(templates);
    this.store.dispatch(setConfigOverride({state: {configOverrides: configs}}));
  }

  /**
   * Update or insert fact in rules engine
   *
   * @param facts fact list to add / update
   */
  public upsertFacts(facts: Fact<unknown> | Fact<unknown>[]) {
    this.engine.upsertFacts(facts);
  }

  /**
   * Update or insert operator in rules engine
   *
   * @param operators operator list to add / update
   */
  public upsertOperators(operators: (Operator<any, any> | UnaryOperator<any>)[]) {
    this.engine.upsertOperators(operators);
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Enable temporary a rule set
   *
   * @param componentComputedName Name of the component to enable the ruleset for
   */
  public enableRuleSetFor(componentComputedName: string) {
    const newMap = this.linkedComponents$.value;
    newMap[componentComputedName] = newMap[componentComputedName] ? newMap[componentComputedName] + 1 : 1;
    this.linkedComponents$.next(newMap);
  }

  /**
   * Disable temporary a rule set
   *
   * @param componentComputedName Name of the component to disable the ruleset for
   */
  public disableRuleSetFor(componentComputedName: string) {
    const newMap = this.linkedComponents$.value;
    if (newMap[componentComputedName] > 0) {
      newMap[componentComputedName]--;
      this.linkedComponents$.next(newMap);
    }
  }

  /**
   * Localize the url, replacing the language marker
   *
   * @param url
   * @param language
   */
  public resolveUrlWithLang(url: string, language: string): string {
    return url.replace(/\[LANGUAGE]/g, language);
  }

  /**
   * Retrieve template as json from a given url
   *
   * @param url
   */
  public async retrieveTemplate(url: string): Promise<PlaceholderRequestReply> {
    const fullUrl = await firstValueFrom(this.dynamicContentService.getContentPathStream(url));
    return fetch(fullUrl).then((response) => response.json());
  }
}
