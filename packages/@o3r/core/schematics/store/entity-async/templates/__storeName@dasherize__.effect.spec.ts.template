import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { <%= storeName %>Effect } from './<%= fileName %>.effect';

describe('<%= storeName %> Effects', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}));

  let effect: <%= storeName %>Effect;
  let actions: Subject<any>;
  const subscriptions: Subscription[] = [];

  const storeValue = new Subject<any>();
  const mockStore = {
    pipe: <% if (testFramework === 'jest') { %>jest.fn().mockReturnValue<% } else { %>jasmine.createSpy('select').and.returnValue<% } %>(storeValue),
    dispatch: <% if (testFramework === 'jest') { %>jest.fn()<% } else { %>jasmine.createSpy('dispatch')<% } %>
  };

  afterEach(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));

  beforeEach(async () => {
    actions = new ReplaySubject(1);
    await TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions),
        <%= storeName %>Effect,
        {provide: Store, useValue: mockStore}
      ]
    }).compileComponents();

    effect = TestBed.inject(<%= storeName %>Effect);
  });

  it('Check if effect is correctly injected', () => {
    expect(effect).toBeDefined();
  });
});
