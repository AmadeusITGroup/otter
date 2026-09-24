import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  EventType,
} from '@angular/router';
import {
  provideMockActions,
} from '@ngrx/effects/testing';
import {
  BaseRouterStoreState,
  ROUTER_NAVIGATED,
  ROUTER_REQUEST,
  RouterNavigatedAction,
  RouterRequestAction,
} from '@ngrx/router-store';
import {
  firstValueFrom,
  ReplaySubject,
  Subject,
  toArray,
} from 'rxjs';
import * as actions from '../routing-guard.actions';
import {
  NgrxStoreRouterEffect,
} from './ngrx-store-router.effect';

describe('Routing guard effects', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let effect: NgrxStoreRouterEffect;
  let actions$: Subject<any>;

  beforeEach(async () => {
    actions$ = new ReplaySubject(1);
    await TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        NgrxStoreRouterEffect
      ]
    }).compileComponents();

    effect = TestBed.inject(NgrxStoreRouterEffect);
  });

  describe('for ROUTER_REQUEST action from NgRx/router-store', () => {
    it('should clear the list of entities', async () => {
      const routerNavigationRequest: RouterRequestAction<BaseRouterStoreState> = {
        type: ROUTER_REQUEST,
        payload: {
          routerState: {
            url: ''
          },
          event: {
            id: 0,
            url: '',
            type: EventType.NavigationStart,
            navigationTrigger: 'popstate'
          }
        }
      };
      const actionPromise = firstValueFrom(effect.resetRouterRegistrationOnRequest$);

      actions$.next(routerNavigationRequest);

      await expect(actionPromise).resolves.toEqual(expect.objectContaining({
        type: actions.clearRoutingGuardEntities.type
      }));
    });

    it('should ignore imperative requests', async () => {
      const routerNavigationRequest: RouterRequestAction<BaseRouterStoreState> = {
        type: ROUTER_REQUEST,
        payload: {
          routerState: {
            url: ''
          },
          event: {
            id: 0,
            url: '',
            type: EventType.NavigationStart,
            navigationTrigger: 'imperative'
          }
        }
      };
      const actionsPromise = firstValueFrom(effect.resetRouterRegistrationOnRequest$.pipe(toArray()));

      actions$.next(routerNavigationRequest);
      actions$.complete();

      await expect(actionsPromise).resolves.toEqual([]);
    });
  });

  describe('for ROUTER_NAVIGATED action from NgRx/router-store', () => {
    it('should clear the list of entities', async () => {
      const routerNavigated: RouterNavigatedAction<BaseRouterStoreState> = {
        type: ROUTER_NAVIGATED,
        payload: {
          routerState: {
            url: ''
          },
          event: {
            id: 0,
            url: '',
            type: EventType.NavigationEnd,
            urlAfterRedirects: ''
          }
        }
      };
      const actionPromise = firstValueFrom(effect.resetRouterRegistrationOnNavigated$);

      actions$.next(routerNavigated);

      await expect(actionPromise).resolves.toEqual(expect.objectContaining({
        type: actions.clearRoutingGuardEntities.type
      }));
    });
  });
});
