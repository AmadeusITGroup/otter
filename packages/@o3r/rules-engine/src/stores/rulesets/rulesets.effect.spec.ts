import {getTestBed, TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {ReplaySubject, Subject, Subscription} from 'rxjs';
import {RulesetsEffect} from './rulesets.effect';

describe('Rulesets Effects', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let effect: RulesetsEffect;
  let actions: Subject<any>;
  const subscriptions: Subscription[] = [];

  const storeValue = new Subject<any>();
  const mockStore = {
    pipe: jest.fn().mockReturnValue(storeValue),
    dispatch: jest.fn()
  };

  afterEach(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));

  beforeEach(async () => {
    actions = new ReplaySubject(1);
    await TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions),
        RulesetsEffect,
        {provide: Store, useValue: mockStore}
      ]
    }).compileComponents();

    effect = TestBed.inject(RulesetsEffect);
  });

  it('Check if effect is correctly injected', () => {
    expect(effect).toBeDefined();
  });
});
