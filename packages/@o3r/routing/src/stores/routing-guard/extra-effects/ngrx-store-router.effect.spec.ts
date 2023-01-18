import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { EventType } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import {
  BaseRouterStoreState,
  ROUTER_NAVIGATED,
  ROUTER_REQUEST,
  RouterNavigatedAction,
  RouterRequestAction
} from '@ngrx/router-store';

import { ReplaySubject, Subject, Subscription } from 'rxjs';
import * as actions from '../routing-guard.actions';
import { NgrxStoreRouterEffect } from './ngrx-store-router.effect';

describe('Routing guard effects', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let effect: NgrxStoreRouterEffect;
  let actions$: Subject<any>;
  const subscriptions: Subscription[] = [];

  afterEach(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));

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
    it('should clear the list of entities', (done) => {

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

      actions$.next(routerNavigationRequest);

      subscriptions.push(
        effect.resetRouterRegistrationOnRequest$.subscribe((action) => {
          expect(action.type).toBe(actions.clearRoutingGuardEntities.type);
          done();
        })
      );
    });

    it('should ignore imperative requests', (done) => {

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

      actions$.next(routerNavigationRequest);

      subscriptions.push(
        effect.resetRouterRegistrationOnRequest$
          .subscribe({
            next: () => done.fail(),
            complete: () => {
              expect(true).toBe(true);
              done();
            }
          })
      );
      actions$.complete();
    });
  });

  describe('for ROUTER_NAVIGATED action from NgRx/router-store', () => {
    it('should clear the list of entities', (done) => {

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

      actions$.next(routerNavigated);

      subscriptions.push(
        effect.resetRouterRegistrationOnNavigated$.subscribe((action) => {
          expect(action.type).toBe(actions.clearRoutingGuardEntities.type);
          done();
        })
      );
    });
  });
});
