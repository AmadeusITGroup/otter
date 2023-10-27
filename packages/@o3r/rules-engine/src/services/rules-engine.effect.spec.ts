import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {TypedAction} from '@ngrx/store/src/models';
import {UpdateAsyncStoreItemEntityActionPayloadWithId} from '@o3r/core';
import {firstValueFrom, of, ReplaySubject, Subject, Subscription} from 'rxjs';
import {
  PlaceholderRequestModel,
  PlaceholderRequestReply,
  setPlaceholderRequestEntityFromUrl
} from '@o3r/components';
import {DynamicContentService} from '@o3r/dynamic-content';
import {LocalizationService} from '@o3r/localization';
import {shareReplay} from 'rxjs/operators';
import {RulesEngineService} from './rules-engine.service';
import {PlaceholderTemplateResponseEffect} from './rules-engine.effect';
import {Store} from '@ngrx/store';

describe('Rules Engine Effects', () => {
  let effect: PlaceholderTemplateResponseEffect;
  let actions: Subject<any>;
  let factsStream: { [key: string]: Subject<any> };
  const translations: { [key: string]: string } = {
    localisationkey: 'This is a test with a { parameter }'
  };
  const storeValue = new Subject<any>();
  const mockStore = {
    pipe: jest.fn().mockReturnValue(storeValue),
    dispatch: jest.fn(),
    select: jest.fn().mockReturnValue(of(true))
  };


  const subscriptions: Subscription[] = [];

  afterEach(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));

  beforeEach(async () => {
    actions = new ReplaySubject(1);
    factsStream = {
      myFact: new ReplaySubject(1),
      factInTemplate: new ReplaySubject(1),
      parameter: new ReplaySubject(1)
    };
    await TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions),
        PlaceholderTemplateResponseEffect,
        {
          provide: RulesEngineService,
          useValue: {
            engine: {
              retrieveOrCreateFactStream: (fact: string) => factsStream[fact]
            }
          }
        },
        {
          provide: DynamicContentService,
          useValue: {getMediaPathStream: () => of('fakeUrl')}
        },
        {
          provide: LocalizationService,
          useValue: {
            translate: (keyText: string, parameters?: { [key: string]: any }) => of(
              Object.entries(parameters)
                .reduce(
                  (acc: string, [paramKey, paramValue]: [string, any]) =>
                    acc.replace(`{ ${paramKey} }`, paramValue),
                  translations[keyText] || ''
                )
            )
          }
        },
        {provide: Store, useValue: mockStore}
      ]
    }).compileComponents();

    effect = TestBed.inject(PlaceholderTemplateResponseEffect);
  });

  it('Check if effect is correctly injected', () => {
    expect(effect).toBeDefined();
  });

  it('should resolve vars', async () => {
    const setPlaceholderEffect$ = effect.setPlaceholderRequestEntityFromUrl$.pipe(shareReplay(1));
    const response: PlaceholderRequestReply = {
      vars: {
        myRelPath: {
          type: 'relativeUrl',
          value: 'assets-demo-app/img/logo/logo-positive.png'
        },
        test: {
          type: 'localisation',
          value: 'localisationkey',
          vars: ['parameterForLoc']
        },
        parameterForLoc: {
          type: 'fact',
          value: 'parameter'
        },
        factInTemplate: {
          type: 'fact',
          value: 'factInTemplate',
          path: '$.myKey'
        }
      },
      template: '<img src=\'<%= myRelPath %>\'> <div><%= test %></div><span><%= factInTemplate %></span>'
    };
    actions.next(setPlaceholderRequestEntityFromUrl({
      call: Promise.resolve(response),
      id: 'myPlaceholderUrl',
      resolvedUrl: 'myPlaceholderResolvedUrl'
    }));
    factsStream.myFact.next('ignored');
    factsStream.parameter.next('success');
    factsStream.factInTemplate.next({'myKey': 'Outstanding fact'});

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = (await firstValueFrom(setPlaceholderEffect$)) as UpdateAsyncStoreItemEntityActionPayloadWithId<PlaceholderRequestModel>
      & TypedAction<'[PlaceholderRequest] update entity'>;
    expect(result.type).toBe('[PlaceholderRequest] update entity');
    expect(result.entity.renderedTemplate).toBe('<img src=\'fakeUrl\'> <div>This is a test with a success</div><span>Outstanding fact</span>');
    expect(result.entity.unknownTypeFound).toBeFalsy();
  });

  it('should notify user some vars have an unknown type', async () => {
    const setPlaceholderEffect$ = effect.setPlaceholderRequestEntityFromUrl$.pipe(shareReplay(1));
    const response: any = {
      vars: {
        test: {
          type: 'invalidType',
          value: 'test'
        }
      },
      template: '<div><%= test %></div>'
    };
    actions.next(setPlaceholderRequestEntityFromUrl({
      call: Promise.resolve(response),
      id: 'myPlaceholderUrl',
      resolvedUrl: 'myPlaceholderResolvedUrl2'
    }));
    factsStream.myFact.next('ignored');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = (await firstValueFrom(setPlaceholderEffect$)) as UpdateAsyncStoreItemEntityActionPayloadWithId<PlaceholderRequestModel>
      & TypedAction<'[PlaceholderRequest] update entity'>;
    expect(result.entity.unknownTypeFound).toBeTruthy();
    expect(result.entity.renderedTemplate).toBe('<div><%= test %></div>');
  });

  it('should not trigger an update if the jsonpath computed value did not change', async () => {
    const effectFn = jest.fn();
    subscriptions.push(effect.setPlaceholderRequestEntityFromUrl$.subscribe(effectFn));
    const response: PlaceholderRequestReply = {
      vars: {
        factInTemplate: {
          type: 'fact',
          value: 'factInTemplate',
          path: '$.myKey'
        }
      },
      template: '<%= factInTemplate %>'
    };
    actions.next(setPlaceholderRequestEntityFromUrl({
      call: Promise.resolve(response),
      id: 'myPlaceholderUrl',
      resolvedUrl: 'myPlaceholderResolvedUrl'
    }));

    effectFn.mockReset();
    factsStream.factInTemplate.next({myKey: 'actual content'});
    await jest.runAllTimersAsync();
    expect(effectFn).toHaveBeenCalledWith(expect.objectContaining({entity: expect.objectContaining({renderedTemplate: 'actual content'})}));

    effectFn.mockReset();
    factsStream.factInTemplate.next({myKey: 'actual content', unrelated: 'this should not do anything'});
    await jest.runAllTimersAsync();
    expect(effectFn).not.toHaveBeenCalled();

    effectFn.mockReset();
    factsStream.factInTemplate.next({myKey: 'this should do something', unrelated: 'this should not do anything'});
    await jest.runAllTimersAsync();
    expect(effectFn).toHaveBeenCalledWith(expect.objectContaining({entity: expect.objectContaining({renderedTemplate: 'this should do something'})}));
  });

  it('should not convert all falsy values to empty string', async () => {
    const effectFn = jest.fn();
    subscriptions.push(effect.setPlaceholderRequestEntityFromUrl$.subscribe(effectFn));
    const response: PlaceholderRequestReply = {
      vars: {
        factInTemplate: {
          type: 'fact',
          value: 'factInTemplate',
          path: '$.myKey'
        }
      },
      template: '<%= factInTemplate %>'
    };
    actions.next(setPlaceholderRequestEntityFromUrl({
      call: Promise.resolve(response),
      id: 'myPlaceholderUrl',
      resolvedUrl: 'myPlaceholderResolvedUrl'
    }));

    effectFn.mockReset();
    factsStream.factInTemplate.next({myKey: 0});
    await jest.runAllTimersAsync();
    expect(effectFn).toHaveBeenCalledWith(expect.objectContaining({entity: expect.objectContaining({renderedTemplate: '0'})}));

    effectFn.mockReset();
    factsStream.factInTemplate.next({myKey: false});
    await jest.runAllTimersAsync();
    expect(effectFn).toHaveBeenCalledWith(expect.objectContaining({entity: expect.objectContaining({renderedTemplate: 'false'})}));

    effectFn.mockReset();
    factsStream.factInTemplate.next({myKey: undefined});
    await jest.runAllTimersAsync();
    expect(effectFn).toHaveBeenCalledWith(expect.objectContaining({entity: expect.objectContaining({renderedTemplate: ''})}));
  });
});
