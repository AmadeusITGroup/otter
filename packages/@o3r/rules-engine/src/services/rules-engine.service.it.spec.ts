import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { EffectsModule } from '@ngrx/effects';
import { select, Store, StoreModule } from '@ngrx/store';
import { TranslateCompiler, TranslateModule } from '@ngx-translate/core';
import { computeConfigurationName, ConfigOverrideStore, ConfigOverrideStoreModule, ConfigurationStoreModule, selectConfigOverride } from '@o3r/configuration';
import { LocalizationModule, translateLoaderProvider, TranslateMessageFormatLazyCompiler } from '@o3r/localization';
import { RulesetsStore, RulesetsStoreModule, setRulesetsEntities } from '@o3r/rules-engine';
import { StyleLazyLoaderModule } from '@o3r/styling';
import { selectCurrentShoppingCart, selectShoppingCart, setShoppingCartEntity, setXmasHampersInCart, ShoppingCartStore, ShoppingCartStoreModule } from '../../testing/mocks/stores/shopping-cart/index';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { jsonOneRulesetOneRuleNoCondPlaceholder } from '../../testing/mocks/oneruleset-onerule-nocond-placeholder.mock';
import { jsonOneRulesetOneRuleNoCond } from '../../testing/mocks/oneruleset-onerule-nocond.mock';
import { jsonOneRulesetOneRuleReexecution } from '../../testing/mocks/oneruleset-onerule-reexecution.mock';
import { jsonOneRulesetThreeRulesOneThrows } from '../../testing/mocks/oneruleset-threerules-onethrows.mock';
import { jsonOneRulesetThreeRulesUndefinedFactUsed } from '../../testing/mocks/oneruleset-threerules-undefinedfactused.mock';
import { jsonOneRulesetTwoNestedRules } from '../../testing/mocks/oneruleset-twonestedrules.mock';
import { jsonOneRulesetTwoRules } from '../../testing/mocks/oneruleset-tworules.mock';
import { jsonOneRulesetValidOneRuleNoCond } from '../../testing/mocks/onerulesetvalid-onerule-nocond.mock';
import { jsonTwoRulesetsOneOnDemand } from '../../testing/mocks/tworulesets-one-ondemand';
import { jsonTwoRulesetTwoRulesNoContext } from '../../testing/mocks/tworulesets-tworules-nocontext.mock';
import { RulesEngineService } from './rules-engine.service';
import { jsonTwoRulesetTwoRules } from '../../testing/mocks/tworulesets-tworules.mock';
import { xmasHamper } from '../../testing/mocks/xmas-hamper.mock';
import { ShoppingCart } from '../../testing/mocks/stores/shopping-cart/shopping-cart.model';

describe('Rules engine service', () => {

  let service: RulesEngineService;
  let store: Store<ShoppingCartStore & RulesetsStore & ConfigOverrideStore>;
  let foieGrasPriceFact$: Observable<string | undefined>;
  let cartFact$: Observable<ShoppingCart | null>;
  let isMobileDevice$: BehaviorSubject<boolean | undefined>;
  let evaluateRuleFirstRulesetSpy: jest.SpyInstance;
  let evaluateRuleSecondRulesetSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  afterEach(() => {
    consoleSpy.mockClear();
  });

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    Object.defineProperty(window, 'performance', {
      value: {
        mark: jest.fn(),
        measure: jest.fn()
      }
    });

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        EffectsModule.forRoot(),
        LocalizationModule.forRoot(),
        TranslateModule.forRoot({
          loader: translateLoaderProvider,
          compiler: {
            provide: TranslateCompiler,
            useClass: TranslateMessageFormatLazyCompiler
          }
        }),
        StyleLazyLoaderModule,
        RulesetsStoreModule,
        ConfigurationStoreModule,
        ConfigOverrideStoreModule,
        ShoppingCartStoreModule
      ],
      providers: [
        RulesEngineService
      ]
    });
    service = TestBed.inject(RulesEngineService);
    store = TestBed.inject(Store);

    const createCartAction = setShoppingCartEntity({entity: {id: 'cart1'}});
    const selectCartAction = selectShoppingCart({id: 'cart1'});
    const setHamperInCartAction = setXmasHampersInCart({id: 'cart1', xmasHampers: [xmasHamper]});

    store.dispatch(createCartAction);
    store.dispatch(selectCartAction);
    store.dispatch(setHamperInCartAction);

    cartFact$ = store.pipe(
      select(selectCurrentShoppingCart)
    );

    foieGrasPriceFact$ = store.pipe(
      select(selectCurrentShoppingCart),
      map((cart) => cart?.xmasHampers?.[0].hamperItems[1].price),
      distinctUntilChanged()
    );
    isMobileDevice$ = new BehaviorSubject<boolean | undefined>(false);
    jest.spyOn(console, 'warn').mockImplementation();
  });

  it('Should support Block with no condition', (done) => {
    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetOneRuleNoCond.ruleSets}));
    service.events$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(1);
      expect(actions[0].actionType).toBe('UPDATE_LOCALISATION');
      done();
    });
  });

  it('should handle linked components and validity range properly', (done) => {
    service.events$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(1);
      expect(actions[0].actionType).toBe('UPDATE_LOCALISATION');
      done();
    });
    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetValidOneRuleNoCond.ruleSets}));
  });


  it('should have configuration updated in the store', (done) => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    }, {
      id: 'cart', value$: cartFact$
    }, {
      id: 'foieGrasPrice', value$: foieGrasPriceFact$
    }
    ]);

    store.dispatch(setRulesetsEntities({entities: jsonTwoRulesetTwoRules.ruleSets}));
    service.events$.pipe(take(1)).subscribe((actions) => {
      // RunTime fact should be properly propagated to the next rule depending on it, with the proper value
      // Actions should be returned in the correct order
      expect(actions.length).toBe(4);
      expect(actions[0].actionType).toBe('UPDATE_CONFIG');
      expect(actions[1].actionType).toBe('UPDATE_ASSET');
      expect(actions[2].value).toBe('my.custom.ssci.loc.key2');
      expect(actions[3].value).toBe('my.custom.ssci.loc.key3');

      store.pipe(
        select(selectConfigOverride),
        filter((configs) => Object.keys(configs).length > 0),
        take(1)
      ).subscribe((configs) => {
        expect(configs['@otter/library#TheConfig']).toBeDefined();
        expect(configs['@otter/library#TheConfig']?.theproperty).toEqual(['raviole', 'truelle']);
        done();
      });
    });

  });

  it('re-evaluation should work properly', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    },
    {id: 'cart', value$: cartFact$},
    {id: 'foieGrasPrice', value$: foieGrasPriceFact$}
    ]);


    store.dispatch(setRulesetsEntities({entities: jsonTwoRulesetTwoRulesNoContext.ruleSets}));
    evaluateRuleFirstRulesetSpy = jest.spyOn((service.engine as any).rulesetMapSubject.value['e5th46e84-5e4th-54eth65seth46se8th4'], 'evaluateRule' as any);
    evaluateRuleSecondRulesetSpy = jest.spyOn((service.engine as any).rulesetMapSubject.value['e5th46e84-5e4th-54eth65seth46se8th1'], 'evaluateRule' as any);
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(2);
    isMobileDevice$.next(true);
    const nextActions = await firstValueFrom(service.events$);
    expect(nextActions.length).toBe(2);
    expect(evaluateRuleFirstRulesetSpy.mock.calls.length).toBe(1);
    expect(evaluateRuleSecondRulesetSpy.mock.calls.length).toBe(0);
  });

  it('should reevaluate everything if side effect found in the ruleset', async () => {
    const foieGrasPrice$ = new BehaviorSubject('20');
    service.engine.upsertFacts<any>([{
      id: 'foieGrasPrice',
      value$: foieGrasPrice$
    },
    {id: 'pageUrl', value$: of('/search')}
    ]);

    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetOneRuleReexecution.ruleSets}));
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(0);
    foieGrasPrice$.next('50');
    const nextActions = await firstValueFrom(service.events$);
    expect(nextActions.length).toBe(1);
  });

  it('should work with fact having undefined value', async () => {
    service.engine.upsertFacts<any>([{
      id: 'factWithUndefinedValue',
      value$: of(undefined)
    }]);
    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetThreeRulesUndefinedFactUsed.ruleSets}));
    const actions = await firstValueFrom(service.events$);
    // RunTime fact should be properly propagated to the next rule depending on it, with the proper value
    // Actions should be returned in the correct order
    expect(actions.length).toBe(3);
    expect(actions[0].value).toBe('my.loc.value.failure');
    expect(actions[1].value).toBe('my.loc.value2.success');
    expect(actions[2].value).toBe('my.loc.value3.success');
  });

  it('should ignore all actions from a ruleset if one rules throws', (done) => {
    service.engine.upsertFacts<any>([{
      id: 'factWithUndefinedValue',
      value$: of(undefined)
    }]);
    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetThreeRulesOneThrows.ruleSets}));
    service.events$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(0);
      done();
    });
  });

  it('should supported nested rules', (done) => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    }, {id: 'cart', value$: cartFact$}
    ]);
    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetTwoNestedRules.ruleSets}));
    service.events$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(4);
      expect(actions[0].value).toBe('my.loc.value2.success');
      expect(actions[1].value).toBe('my.loc.value3.success');
      expect(actions[2].value).toBe('my.loc.value4.success');
      expect(actions[3].value).toBe('my.loc.value6.success');
      done();
    });
  });

  it('should work properly if the fact is added after the first initialization, should trigger changes', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    }, {
      id: 'foieGrasPrice',
      value$: foieGrasPriceFact$
    }]);

    store.dispatch(setRulesetsEntities({entities: jsonTwoRulesetTwoRulesNoContext.ruleSets}));
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(2);
    expect(actions[0].value).toBe('my.loc.value.failure');
    expect(actions[1].value).toBe('my.loc.value2.failure');

    service.engine.upsertFacts<any>([{id: 'cart', value$: cartFact$}]);
    const nextActions = await firstValueFrom(service.events$);
    expect(nextActions.length).toBe(2);
    expect(nextActions[0].value).toBe('my.loc.value.failure');
    expect(nextActions[1].value).toBe('my.loc.value2.success');
  });

  it('should enable/disable an on demand ruleset', (done) => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: of(true)
    }]);
    store.dispatch(setRulesetsEntities({entities: jsonTwoRulesetsOneOnDemand.rulesets}));
    service.events$.pipe(take(1)).subscribe((actions) => {
      // should execute the actions from active rulesets at bootstrap
      expect(actions.length).toBe(4);
      service.enableRuleSetFor(computeConfigurationName('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
      service.events$.pipe(take(1)).subscribe((nextActions) => {
        // should execute the extra action added by the ruleset on demand (linked to the component)
        expect(nextActions.length).toBe(5);
        service.disableRuleSetFor(computeConfigurationName('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
        service.events$.pipe(take(1)).subscribe((nextNextActions) => {
          // should execute the actions from active rulesets after deactivating the ruleset on demand
          expect(nextNextActions.length).toBe(4);
          done();
        });
      });
    });
  });

  it('should keep enabled for multiple instances of components', (done) => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: of(true)
    }]);
    store.dispatch(setRulesetsEntities({entities: jsonTwoRulesetsOneOnDemand.rulesets}));
    service.events$.pipe(take(1)).subscribe((actions) => {
      // should execute the actions from active rulesets at bootstrap
      expect(actions.length).toBe(4);
      service.enableRuleSetFor(computeConfigurationName('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
      service.enableRuleSetFor(computeConfigurationName('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
      service.events$.pipe(take(1)).subscribe((nextActions) => {
        // should execute once the extra action added by the ruleset on demand (linked to the component multiple instances)
        expect(nextActions.length).toBe(5);
        service.disableRuleSetFor(computeConfigurationName('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
        service.events$.pipe(take(1)).subscribe((nextNextActions) => {
          // should keep the ruleset active after deactivating the ruleset for one component instance
          expect(nextNextActions.length).toBe(5);
          done();
        });
      });
    });
  });

  it('should skip the entire ruleset if undefined fact encountered', (done) => {
    const aNumberSubj = new BehaviorSubject<number | undefined>(undefined);
    // const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    service.engine.upsertFacts<any>([{
      id: 'aNumber',
      value$: aNumberSubj
    }]);
    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetTwoRules.ruleSets}));
    // eslint-disable-next-line no-console
    expect(consoleSpy).toHaveBeenCalled();
    service.events$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(1);
      // Fake emit of same value from sNumber fact, should not do anything
      aNumberSubj.next(undefined);
      // eslint-disable-next-line no-console
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      // Fake emit of new value from sNumber fact, should trigger error, but not the events$
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      aNumberSubj.next(null as any);
      // eslint-disable-next-line no-console
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      // Fake emit of new value from sNumber fact, should not trigger error, and trigger events$
      aNumberSubj.next(4);
      service.events$.pipe(take(1)).subscribe((newActions) => {
        expect(newActions.length).toBe(3);
        done();
      });

    });
  });


  it('Placeholder actions should be processed properly', (done) => {
    store.dispatch(setRulesetsEntities({entities: jsonOneRulesetOneRuleNoCondPlaceholder.ruleSets}));
    service.events$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(1);
      expect(actions[0].actionType).toBe('UPDATE_PLACEHOLDER');
      done();
    });
  });
});
