export const asyncEntityEffectSpecContent = `import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { ExampleEffect } from './example.effect';

describe('Example Effects', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {teardown:{destroyAfterEach:false}}));

  let effect: ExampleEffect;
  let actions: Subject<any>;
  const subscriptions: Subscription[] = [];

  const storeValue = new Subject<any>();
  const mockStore = {
    pipe: jasmine.createSpy('select').and.returnValue(storeValue),
    dispatch: jasmine.createSpy('dispatch')
  };

  afterEach(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));

  beforeEach(async () => {
    actions = new ReplaySubject(1);
    await TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions),
        ExampleEffect,
        {provide: Store, useValue: mockStore}
      ]
    }).compileComponents();

    effect = TestBed.inject(ExampleEffect);
  });

  it('Check if effect is correctly injected', () => {
    expect(effect).toBeDefined();
  });
});

`;
