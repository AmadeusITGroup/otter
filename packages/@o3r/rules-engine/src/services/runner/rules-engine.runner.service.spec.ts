import {
  getTestBed,
  TestBed
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import {
  EffectsModule
} from '@ngrx/effects';
import {
  select,
  Store,
  StoreModule
} from '@ngrx/store';
import {
  computeItemIdentifier
} from '@o3r/core';
import {
  BehaviorSubject,
  firstValueFrom,
  Observable,
  of,
  Subject
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  take
} from 'rxjs/operators';
import {
  jsonOneRulesetOneRuleNoCondPlaceholder
} from '../../../testing/mocks/oneruleset-onerule-nocond-placeholder.mock';
import {
  jsonOneRulesetOneRuleNoCond
} from '../../../testing/mocks/oneruleset-onerule-nocond.mock';
import {
  jsonOneRulesetOneRuleReexecution
} from '../../../testing/mocks/oneruleset-onerule-reexecution.mock';
import {
  jsonOneRulesetThreeRulesOneThrows
} from '../../../testing/mocks/oneruleset-threerules-onethrows.mock';
import {
  jsonOneRulesetThreeRulesUndefinedFactUsed
} from '../../../testing/mocks/oneruleset-threerules-undefinedfactused.mock';
import {
  jsonOneRulesetTwoNestedRules
} from '../../../testing/mocks/oneruleset-twonestedrules.mock';
import {
  jsonOneRulesetTwoRulesAnyAndAll
} from '../../../testing/mocks/oneruleset-tworules-any-and-all.mock';
import {
  jsonOneRulesetTwoRules
} from '../../../testing/mocks/oneruleset-tworules.mock';
import {
  jsonOneRulesetValidOneRuleNoCond
} from '../../../testing/mocks/onerulesetvalid-onerule-nocond.mock';
import {
  selectCurrentShoppingCart,
  selectShoppingCart,
  setShoppingCartEntity,
  setXmasHampersInCart,
  type ShoppingCartStore,
  ShoppingCartStoreModule
} from '../../../testing/mocks/stores/shopping-cart/index';
import {
  ShoppingCart
} from '../../../testing/mocks/stores/shopping-cart/shopping-cart.model';
import {
  jsonTwoRulesetsBothOnDemand
} from '../../../testing/mocks/tworulesets-both-ondemand';
import {
  jsonTwoRulesetsOneOnDemand
} from '../../../testing/mocks/tworulesets-one-ondemand';
import {
  jsonTwoRulesetTwoRulesNoContext
} from '../../../testing/mocks/tworulesets-tworules-nocontext.mock';
import {
  jsonTwoRulesetTwoRules
} from '../../../testing/mocks/tworulesets-tworules.mock';
import {
  xmasHamper
} from '../../../testing/mocks/xmas-hamper.mock';
import {
  RulesetsStore,
  RulesetsStoreModule,
  setRulesetsEntities
} from '../../stores/index';
import {
  RulesEngineRunnerService
} from './rules-engine.runner.service';

describe('Rules engine service', () => {
  let service: RulesEngineRunnerService;

  let store: Store<ShoppingCartStore & RulesetsStore>;
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
        RulesetsStoreModule,
        ShoppingCartStoreModule
      ],
      providers: [
        RulesEngineRunnerService
      ]
    });
    service = TestBed.inject(RulesEngineRunnerService);
    store = TestBed.inject(Store);

    const createCartAction = setShoppingCartEntity({ entity: { id: 'cart1' } });
    const selectCartAction = selectShoppingCart({ id: 'cart1' });
    const setHamperInCartAction = setXmasHampersInCart({ id: 'cart1', xmasHampers: [xmasHamper] });

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

  it('Should support Block with no condition', async () => {
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetOneRuleNoCond.ruleSets }));
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(1);
    expect(actions[0].actionType).toBe('UPDATE_LOCALISATION');
  });

  it('should handle linked components and validity range properly', (done) => {
    service.events$.pipe(take(1)).subscribe((actions) => {
      expect(actions.length).toBe(1);
      expect(actions[0].actionType).toBe('UPDATE_LOCALISATION');
      done();
    });
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetValidOneRuleNoCond.ruleSets }));
  });

  it('should have configuration updated in the store', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    }, {
      id: 'cart', value$: cartFact$
    }, {
      id: 'foieGrasPrice', value$: foieGrasPriceFact$
    }
    ]);

    store.dispatch(setRulesetsEntities({ entities: jsonTwoRulesetTwoRules.ruleSets }));
    const actions = await firstValueFrom(service.events$);
    // RunTime fact should be properly propagated to the next rule depending on it, with the proper value
    // Actions should be returned in the correct order
    expect(actions.length).toBe(4);
    expect(actions[0].actionType).toBe('UPDATE_CONFIG');
    expect(actions[1].actionType).toBe('UPDATE_ASSET');
    expect(actions[2].value).toBe('my.custom.ssci.loc.key2');
    expect(actions[3].value).toBe('my.custom.ssci.loc.key3');
  });

  it('re-evaluation should work properly', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    },
    { id: 'cart', value$: cartFact$ },
    { id: 'foieGrasPrice', value$: foieGrasPriceFact$ }
    ]);

    store.dispatch(setRulesetsEntities({ entities: jsonTwoRulesetTwoRulesNoContext.ruleSets }));
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
    { id: 'pageUrl', value$: of('/search') }
    ]);

    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetOneRuleReexecution.ruleSets }));
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
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetThreeRulesUndefinedFactUsed.ruleSets }));
    const actions = await firstValueFrom(service.events$);
    // RunTime fact should be properly propagated to the next rule depending on it, with the proper value
    // Actions should be returned in the correct order
    expect(actions.length).toBe(3);
    expect(actions[0].value).toBe('my.loc.value.failure');
    expect(actions[1].value).toBe('my.loc.value2.success');
    expect(actions[2].value).toBe('my.loc.value3.success');
  });

  it('should ignore all actions from a ruleset if one rules throws', async () => {
    service.engine.upsertFacts<any>([{
      id: 'factWithUndefinedValue',
      value$: of(undefined)
    }]);
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetThreeRulesOneThrows.ruleSets }));
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(0);
  });

  it('should supported nested rules', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    }, { id: 'cart', value$: cartFact$ }
    ]);
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetTwoNestedRules.ruleSets }));
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(4);
    expect(actions[0].value).toBe('my.loc.value2.success');
    expect(actions[1].value).toBe('my.loc.value3.success');
    expect(actions[2].value).toBe('my.loc.value4.success');
    expect(actions[3].value).toBe('my.loc.value6.success');
  });

  it('should work properly if the fact is added after the first initialization, should trigger changes', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: isMobileDevice$
    }, {
      id: 'foieGrasPrice',
      value$: foieGrasPriceFact$
    }]);

    store.dispatch(setRulesetsEntities({ entities: jsonTwoRulesetTwoRulesNoContext.ruleSets }));
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(2);
    expect(actions[0].value).toBe('my.loc.value.failure');
    expect(actions[1].value).toBe('my.loc.value2.failure');

    service.engine.upsertFacts<any>([{ id: 'cart', value$: cartFact$ }]);
    const nextActions = await firstValueFrom(service.events$);
    expect(nextActions.length).toBe(2);
    expect(nextActions[0].value).toBe('my.loc.value.failure');
    expect(nextActions[1].value).toBe('my.loc.value2.success');
  });

  it('should enable/disable an on demand ruleset', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: of(true)
    }]);
    store.dispatch(setRulesetsEntities({ entities: jsonTwoRulesetsOneOnDemand.rulesets }));
    const actions = await firstValueFrom(service.events$);
    // should execute the actions from active rulesets at bootstrap
    expect(actions.length).toBe(4);
    service.enableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
    const nextActions = await firstValueFrom(service.events$);

    // should execute the extra action added by the ruleset on demand (linked to the component)
    expect(nextActions.length).toBe(5);
    service.disableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
    const nextNextActions = await firstValueFrom(service.events$);
    // should execute the actions from active rulesets after deactivating the ruleset on demand
    expect(nextNextActions.length).toBe(4);
  });

  it('should handle linked component(s) rulesets', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: of(true)
    }]);
    const nextFn = jest.fn();
    store.dispatch(setRulesetsEntities({ entities: jsonTwoRulesetsBothOnDemand.rulesets }));
    const sub = service.events$.subscribe({
      next: (value) => nextFn(value)
    });
    // should output no actions as all rulesets are on demand
    expect(nextFn).not.toHaveBeenCalled();
    sub.unsubscribe();

    // activate ruleset 1 via his own linked component
    service.enableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont-2', '@otter/demo-app-components'));
    let nextActions = await firstValueFrom(service.events$);
    // should execute the action from the first ruleset
    expect(nextActions.length).toBe(1);

    // activate ruleset 2 via his linked component ( the same component is linked to ruleset 1 )
    service.enableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
    nextActions = await firstValueFrom(service.events$);
    // should execute the actions from both rulesets
    expect(nextActions.length).toBe(5);

    // unlink ruleset 1 private component, should not change the output as the common component is still linked
    service.disableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont-2', '@otter/demo-app-components'));
    nextActions = await firstValueFrom(service.events$);
    // should still execute the actions from both rulesets as ruleset 1 is still having a linked component
    expect(nextActions.length).toBe(5);

    // re-link the component for ruleset 1, should not change the output as both rulesets will stay active
    service.enableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont-2', '@otter/demo-app-components'));
    nextActions = await firstValueFrom(service.events$);
    // should execute the action from both rulesets
    expect(nextActions.length).toBe(5);

    // unlink the common component, should disable ruleset 2, but not ruleset 1 which still has a linked component
    service.disableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
    nextActions = await firstValueFrom(service.events$);
    // should execute the action from ruleset 1
    expect(nextActions.length).toBe(1);
  });

  it('should keep enabled for multiple instances of components', async () => {
    service.engine.upsertFacts<any>([{
      id: 'isMobileDevice',
      value$: of(true)
    }]);
    store.dispatch(setRulesetsEntities({ entities: jsonTwoRulesetsOneOnDemand.rulesets }));
    const actions = await firstValueFrom(service.events$);
    // should execute the actions from active rulesets at bootstrap
    expect(actions.length).toBe(4);
    service.enableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
    service.enableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
    const nextActions = await firstValueFrom(service.events$);
    // should execute once the extra action added by the ruleset on demand (linked to the component multiple instances)
    expect(nextActions.length).toBe(5);
    service.disableRuleSetFor(computeItemIdentifier('o3r-calendar-per-bound-cont', '@otter/demo-app-components'));
    const nextNextActions = await firstValueFrom(service.events$);
    // should keep the ruleset active after deactivating the ruleset for one component instance
    expect(nextNextActions.length).toBe(5);
  });

  it('should skip the entire ruleset if undefined fact encountered', async () => {
    const aNumberSubj = new BehaviorSubject<number | undefined>(undefined);
    // const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    service.engine.upsertFacts<any>([{
      id: 'aNumber',
      value$: aNumberSubj
    }]);
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetTwoRules.ruleSets }));

    expect(consoleSpy).toHaveBeenCalled();
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(1);
    // Fake emit of same value from sNumber fact, should not do anything
    aNumberSubj.next(undefined);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    // Fake emit of new value from sNumber fact, should trigger error, but not the events$
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    aNumberSubj.next(null as any);

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    // Fake emit of new value from sNumber fact, should not trigger error, and trigger events$
    aNumberSubj.next(4);
    const newActions = await firstValueFrom(service.events$);
    expect(newActions.length).toBe(3);
  });

  it('Placeholder actions should be processed properly', async () => {
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetOneRuleNoCondPlaceholder.ruleSets }));
    const actions = await firstValueFrom(service.events$);
    expect(actions.length).toBe(1);
    expect(actions[0].actionType).toBe('UPDATE_PLACEHOLDER');
  });

  it('should not process unnecessary conditions', async () => {
    const foieGrasPrice = new Subject<string | undefined>();
    service.engine.upsertFacts<any>([{
      id: 'foieGrasPrice',
      value$: foieGrasPrice.asObservable()
    }]);
    store.dispatch(setRulesetsEntities({ entities: jsonOneRulesetTwoRulesAnyAndAll.ruleSets }));
    const evaluateConditionSpy = jest.spyOn((service.engine as any).rulesetMapSubject.value['e5th46e84-5e4th-54eth65seth46se8th8'], 'evaluateCondition' as any);
    foieGrasPrice.next(undefined);
    await firstValueFrom(service.events$);
    expect(evaluateConditionSpy.mock.calls.length).toBe(4);
    // It should only call the first condition of the ALL block (as it evaluates as false)
    expect(evaluateConditionSpy.mock.calls[0][0]).toEqual(jsonOneRulesetTwoRulesAnyAndAll.ruleSets[0].rules[0].rootElement.condition);
    expect(evaluateConditionSpy.mock.calls[1][0]).toEqual(jsonOneRulesetTwoRulesAnyAndAll.ruleSets[0].rules[0].rootElement.condition.all[0]);
    // It should only process the first condition of the ANY block (as it evaluates as true)
    expect(evaluateConditionSpy.mock.calls[2][0]).toEqual(jsonOneRulesetTwoRulesAnyAndAll.ruleSets[0].rules[1].rootElement.condition);
    expect(evaluateConditionSpy.mock.calls[3][0]).toEqual(jsonOneRulesetTwoRulesAnyAndAll.ruleSets[0].rules[1].rootElement.condition.any[0]);
  });
});
