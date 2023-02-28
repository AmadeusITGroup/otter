import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { deletePlaceholderTemplateEntity, PlaceholderTemplateReply, PlaceholderTemplateStore, selectPlaceholderTemplateEntities, setPlaceholderTemplateEntityFromUrl } from '@o3r/components';
import { computeConfigurationName, ConfigurationStore, PropertyOverride, setConfigOverride } from '@o3r/configuration';
import { AssetPathOverrideStore, DynamicContentService, setAssetPathOverride } from '@o3r/dynamic-content';
import { LocalizationOverrideStore, setLocalizationOverride } from '@o3r/localization';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';
import type { ActionBlock, Fact, Operator, Ruleset, UnaryOperator } from '../engine/index';
import { EngineDebugger, operatorList, RulesEngine } from '../engine/index';
import { ActionOverrideBlock } from '../interfaces/index';
import {
  RulesetsStore,
  selectActiveRuleSets,
  selectAllRulesets,
  selectRuleSetLinkComponents
} from '../stores';
import { RULES_ENGINE_OPTIONS, RulesEngineServiceOptions } from './rules-engine.token';
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

  protected placeholdersActions$: Subject<{ placeholderId: string; templateUrl: string }[]> = new Subject();

  constructor(
    private store: Store<RulesetsStore & PlaceholderTemplateStore & AssetPathOverrideStore & LocalizationOverrideStore & ConfigurationStore>,
    private translateService: TranslateService,
    private dynamicContentService: DynamicContentService,
    private logger: LoggerService,
    @Optional() @Inject(RULES_ENGINE_OPTIONS) engineConfig?: RulesEngineServiceOptions) {

    this.enabled = !engineConfig?.dryRun;
    this.engine = new RulesEngine({debugger: engineConfig?.debug ? new EngineDebugger({eventsStackLimit: engineConfig?.debugEventsStackLimit}) : undefined, logger: this.logger});
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
    // Will prevent double instant emission
    const filteredActions$ = combineLatest([lang$, this.placeholdersActions$]).pipe(
      withLatestFrom(this.store.pipe(select(selectPlaceholderTemplateEntities))),
      map(([langAndTemplatesUrls, storedPlaceholders]) => {
        const [lang, placeholderActions] = langAndTemplatesUrls;
        const storedPlaceholdersDefined = storedPlaceholders || {};
        // Placeholder that are no longer filled by the current engine execution output will be cleared
        const placeholdersIdsToBeCleanedUp = Object.keys(storedPlaceholdersDefined)
          .filter(placeholderId => !placeholderActions.find(placeholderAction => placeholderAction.placeholderId === placeholderId));
        // Filters out the placeholders that have the same Url in the store than the current execution
        // Actions that need to be cleaned up will be added as well, with an empty string as Url
        const placeholdersToBeSet = placeholderActions
          .map((placeholderAction) => {
            return {...placeholderAction, resolvedUrl: this.resolveUrlWithLang(placeholderAction.templateUrl, lang)};
          })
          .filter((placeholderAction) => {
            if (!storedPlaceholdersDefined[placeholderAction.placeholderId]) {
              return true;
            }
            return storedPlaceholdersDefined[placeholderAction.placeholderId]!.resolvedUrl !== placeholderAction.resolvedUrl;
          });
        // ex: { toSet: [{placeholderId: 'id1', templateUrl: '...'}], toClean: ['id2'] }
        return {toSet: placeholdersToBeSet, toClean: placeholdersIdsToBeCleanedUp};
      })
    );
    this.subscription.add(filteredActions$.subscribe((placeholdersUpdates) => {
      placeholdersUpdates.toClean.forEach(placeholderId =>
        this.store.dispatch(deletePlaceholderTemplateEntity({
          call: Promise.resolve(),
          id: placeholderId
        }))
      );
      placeholdersUpdates.toSet.forEach(placeholderUpdate => {
        this.store.dispatch(setPlaceholderTemplateEntityFromUrl({
          call: this.retrieveTemplate(placeholderUpdate.resolvedUrl),
          id: placeholderUpdate.placeholderId,
          resolvedUrl: placeholderUpdate.resolvedUrl,
          url: placeholderUpdate.templateUrl
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
    const templates: { placeholderId: string; templateUrl: string }[] = [];

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
          templates.push({placeholderId: action.placeholderId, templateUrl: action.value});
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
   * @param componentComputedName Name of the component to active the ruleset for
   */
  public enableRuleSetFor(componentComputedName: string) {
    const newMap = this.linkedComponents$.value;
    newMap[componentComputedName] = newMap[componentComputedName] ? newMap[componentComputedName] + 1 : 1;
    this.linkedComponents$.next(newMap);
  }

  /**
   * Disable temporary a rule set
   *
   * @param componentComputedName Name of the component to inactive the ruleset for
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
  public async retrieveTemplate(url: string): Promise<PlaceholderTemplateReply> {
    const fullUrl = await firstValueFrom(this.dynamicContentService.getContentPathStream(url));
    return fetch(fullUrl).then((response) => response.json());
  }
}
