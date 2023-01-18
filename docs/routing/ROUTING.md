# Routing
This document provides guidelines around routing management in your application.
It will cover the below topics:
- Preloading configuration
- Back navigation
- Guard
- Application entry point definition

## Preloading configuration
To optimize the navigation between the pages, you can specify the *page preloading strategy* of your application

### How to register your preloading strategy
In the file containing your routes you can add a preloading strategy (`MyPreloadingStrategyClass`) as following:
```typescript
import {NgModule} from '@angular/core';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: '/myPage', pathMatch: 'full'},
      {path: 'myPage', loadChildren: () => import('/flow/myPage/index').then(m => m.MyPageModule)}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: MyPreloadingStrategyClass })],
  providers: [O3rOnNavigationPreloadingStrategy],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

### Available Strategies
Angular already provide 2 strategies:
* **[NoPreloading](https://angular.io/api/router/NoPreloading)** : no preloading at all
* **[PreloadAllModules](https://angular.io/api/router/PreloadAllModules)** : preload every pages as soon as possible

To be more flexible, the Otter Library provides a custom preloading strategy `O3rOnNavigationPreloadingStrategy`. The purpose is to preload a page only when the user navigates to one of the pages specified in `preloadOn` property.
You can use it as following:
```typescript
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {O3rOnNavigationPreloadingStrategy} from '@o3r/routing';
const appRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: '/myPage', pathMatch: 'full'},
      {path: 'myPage', loadChildren: () => import('./flow/myPage/index').then((m) => m.MyPageModule)},
      {path: 'myPage2', loadChildren: () => import('./flow/myPage2/index').then((m) => m.MyPageModule2), data: {preloadOn: ['/myPage']}}, // will be preloaded when arrived on myPage
      {path: 'myPage3', loadChildren: () => import('./flow/myPage3/index').then((m) => m.MyPageModule3), data: {preloadOn: ['/myPage2', '/myPage3']}}, // will be preloaded when arrived on myPage2 or myPage3
      {path: 'myPage4', loadChildren: () => import('./flow/myPage4/index').then((m) => m.MyPageModule4), data: {preloadOn: '*'}}, // will be preloaded as quick as possible
      {path: 'myPage5', loadChildren: () => import('./flow/myPage5/index').then((m) => m.MyPageModule5), data: {preloadOn: /\/myPage[2-4]$/}}, // (advised) will be preloaded when arrived on pages myPage2 or myPage3 or myPage4
      {path: 'myPage6', loadChildren: () => import('./flow/myPage6/index').then((m) => m.MyPageModule6), data: {preloadOn: new RegExp('/myPage[2-4]')}}, // will be preloaded when arrived on pages myPage2 or myPage3 or myPage4
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: O3rOnNavigationPreloadingStrategy })],
  providers: [O3rOnNavigationPreloadingStrategy],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

## Back navigation
In order to align the routing navigation with the back browser history, we recommend the usage of the [Location](https://angular.io/api/common/Location) 
service provided by Angular.
When your page is triggering a back navigation, it should call the method `back` from the Location service, as 
shown in the example below

```typescript
import {Location} from '@angular/common';
...
@Component({
  selector: 'o3r-example',
  styleUrls: ['./example.style.scss'],
  templateUrl: './example.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent implements OnInit, OnDestroy, Configurable<ExampleConfig> {

  constructor(private location: Location) {}
    ...
    goBack() {
      this.location.back();
    }
    ...
}
```
Why doing so ?
- It will prevent you from knowing the routing table definition or implementing logic to navigate back.
- The user will navigate back even if he clicks on the back browser button (application navigation flow will be kept
aligned with browser history).
- It is mandatory to use the `RoutingGuard` store.

## Guard
To make sure that the navigation is not triggered in case of error or wrong context, or if you need to retrieve data 
before navigating , you should use [route guards](https://angular.io/guide/router#milestone-5-route-guards).

### Managing guard in the scope of form submission
In some cases a page will host multiple blocks, where each block implements a form.
The problem we face in such situation, is how to authorize the user to land on the next page 
only when all API calls are successful, and block him when at least one call is failing.
Blocks and pages should not be aware of each other's context.
A solution to share with the page the status of the API calls is to use the `RoutingGuardStore` provided by the 
Otter Library.

How will it work in your application:
- First your blocks will register to the `RoutingGuardStore` in a READY state.
- When the user clicks on submit, the page will launch the form submission of each block, and wait for the registered blocks to be in a PENDING state before starting the navigation.
- Based on the API call status your block will update its state as PENDING, FAILURE or SUCCESS in the `RoutingGuardStore`.
- Once there's no remaining blocks in READY or FAILURE state the navigation starts and the canDeactivate guard
is triggered.
- The guard will wait for the blocks to be in a final state (either in READY, FAILURE or SUCCESS state) before deciding if the page can be deactivated or not
- If no block is in FAILURE the can canDeactivate guard authorize the user to navigate to the next page. But if at 
least one block is in FAILURE, the user will stay on the page.

Now that we have a global overview of the strategy, let's check how you should implement it in your application. 

#### RoutingGuardStore
The `RoutingGuardStore` works as a bridge between the page and block components.
This store has been designed to track API calls status of blocks in order to manage the navigation from the page.

##### RoutingGuardStore actions
The `RoutingGuardStore` exposes the below actions to update the status of your block:
- `RegisterRoutingGuardEntity`: To register your block in the store and set its status as READY by default
- `SetRoutingGuardEntityAsFailure`: To set your block status as FAILING
- `SetRoutingGuardEntityAsSuccess`: To set your block status as SUCCESS
- `SetRoutingGuardEntityAsPending`: To set your block status as PENDING

And an action to clear all the registered blocks
- `ClearRoutingGuardEntities`

##### RoutingGuardStore effect
The `RoutingGuardStore` exposes an extra effect which reacts on `NgRx/router-store` `ROUTER_REQUEST` action and 
`NgRx/router-store` `ROUTER_NAVIGATED` action.

`ROUTER_REQUEST` action is triggered at the start of each navigation, and before the execution of any guards or 
resolvers.
In the payload of the action, we check that the navigation was triggered by a popstate event. This event is fired only
when the user has clicked on the browser back button or when the `back` method from the history has been called 
programmatically.
In such case we clear the registered block list from the store to avoid being blocked by the `CanDeactivateRoutingGuard`.

`ROUTER_NAVIGATED` action is triggered at the end of all successful navigation. We take this opportunity to clear 
the registered block list from the store to make sure that the next page context is clean.

To use this extra effect, add it as shown in the example below
```typescript
...
import {NgrxStoreRouterEffect} from '@o3r/routing';
...

@NgModule({
  imports: [
    ...
    EffectsModule.forRoot([NgrxStoreRouterEffect]),
    ...
  ],
  ...
})
export class AppModule {}
```

##### RoutingGuardStore selector
The `RoutingGuardStore` exposes the below selectors:
- `hasNoEntityInReadyOrFailureState`: used to trigger the router navigation in your page.
- `hasNoEntitiesInPendingState`: used to trigger the canDeactivate logic in the RoutingGuard.
- `hasNoEntitiesInFailureState`: used to authorize or not the navigation in the RoutingGuard.

#### CanDeactivateRoutingGuard
`CanDeactivateRoutingGuard` is a generic guard which aims at tracking the registered block status to authorize or not the 
navigation to the next page.
The guard will wait until no item from the store is in PENDING state before analysing the `RoutingGuardStore` state.
It will then authorize the navigation to the next page only if no registered item in the `RoutingGuardStore` 
is in FAILURE state.

To use it you will have to first import the `CanDeactivateRoutingGuardModule` in your page module, and provide the 
`CanDeactivateRoutingGuard` in your page routing path definition as below:
```typescript
@NgModule({
  imports: [
    RouterModule.forChild([{path: '', component: MyPageComponent, canDeactivate: [CanDeactivateRoutingGuard]}]),
    CanDeactivateRoutingGuardModule
    ...
  ],
  ...
})
export class MyPageModule {}
```

#### How to update your block component
To benefit from the `RoutingGuardStore` in your block component definition, you will have to first import the `RoutingGuardStoreModule` in your block module.
```typescript
  @NgModule({
    imports: [..., RoutingGuardStoreModule, CanDeactivateRoutingGuardModule],
    ...
  })
  export class YourBlockContModule {}
```
and then inject the store in your block component constructor.
```typescript
...
import { v4 as uuidGenerate } from 'uuid';
...
export class YourBlockContComponent {
  private readonly routingGuardId: string;
  
  constructor(..., private store: Store<RoutingGuardStore>) {
    // We define a unique ID which will be used to identify the registered form
    this.routingGuardId = 'myForm-' + uuidGenerate();
  }
  ...
}
```
At the initialisation of the component, you will have to register to the `RoutingGuardStore`. This step is necessary to make 
sure that the API calls triggered by your block are taken into account in the CanDeactivateFormPage guard.
```typescript
...
import { v4 as uuidGenerate } from 'uuid';
...
export class YourBlockContComponent implements OnInit {
  private readonly routingGuardId: string;
  
  constructor(..., private store: Store<RoutingGuardStore>) {
    // We define a unique ID which will be used to identify the registered form
    this.routingGuardId = 'myForm-' + uuidGenerate();
  }
  ngOnInit() {
    // We register the component as an actor of the routing navigation management
    this.store.dispatch(new RegisterRoutingGuardEntity({id: this.routingGuardId}));
    ...
  }
  ...
}
```
In order to synchronise the block API calls with the `RoutingGuardStore` state, we create an Observable which will only emit 
when the block state is PENDING.
We will then subscribe to this new Observable to update the state of the block in the `RoutingGuardStore` based on the API call 
status.
```typescript
...
import { v4 as uuidGenerate } from 'uuid';
...
export class YourBlockContComponent implements OnInit, OnDestroy {
  
  private myBlockStatus$: Observable<AsyncItem | undefined>;
  
  private readonly routingGuardId: string;
  
  private subscriptions: Subscription[] = [];
  
  constructor(..., private store: Store<RoutingGuardStore>) {
    // We define a unique ID which will be used to identify the registered form
    this.routingGuardId = 'myForm-' + uuidGenerate();
    
    // We bind the registered form status on the block status
    this.myBlockStatus$ = this.store.select(selectMyBlockStatus).pipe(
      skipWhile((myBlockStatus: AsyncItem) => myBlockStatus.isPending !== true)
    );

    this.subscriptions.push(
      this.myBlockStatus$.subscribe((myBlockStatus: AsyncItem) => {
        if (myBlockStatus.isPending) {
          this.store.dispatch(new SetRoutingGuardEntityAsPending({id: this.routingGuardId}));
        } else if (myBlockStatus.isFailure) {
          this.store.dispatch(new SetRoutingGuardEntityAsFailure({id: this.routingGuardId}));
        } else {
          this.store.dispatch(new SetRoutingGuardEntityAsSuccess({id: this.routingGuardId}));
        }
      })
    );
  }
  ngOnInit() {
    // We register the component as an actor of the routing navigation management
    this.store.dispatch(new RegisterRoutingGuardEntity({id: this.routingGuardId}));
    ...
  }
  ...
  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
```
That's it! Your block is all set to share its state with the application. 

#### How to update your page component
To benefit from the `RoutingGuardStore` in your page component definition, you will have to first import the 
`RoutingGuardStoreModule` in your page module, and provide the `CanDeactivateRoutingGuard` as explained in the 
dedicated section.
```typescript
@NgModule({
  imports: [
    RouterModule.forChild([{path: '', component: MyPageComponent, canDeactivate: [CanDeactivateRoutingGuard]}]),
    RoutingGuardStoreModule,
    CanDeactivateRoutingGuardModule,
    ...
  ],
  ...
})
export class MyPageModule {}
```
and then inject the store in your page component constructor.
```typescript
export class YourPageComponent {
  constructor(private store: Store<RoutingGuardStore>) {}
}
```
The page is in charge of triggering the submission of each form's block.
At this same stage, the router navigation will be launched if there is no registered blocks in READY or FAILURE state.
This means that all API calls have been performed.

```typescript
export class YourPageComponent {
  private hasNoEntityInReadyOrFailureState$: Observable<boolean>;
  
  constructor(..., private store: Store<RoutingGuardStore>) {
    ...
    this.hasNoEntityInReadyOrFailureState$ = this.store.select(hasNoEntityInReadyOrFailureState);
  }
  
  goNext(submittables: Submittable[]) {
    ...
  
    // We trigger the navigation only once all missing calls are triggered (no blocks in READY or FAILURE state)
    this.hasNoEntityInReadyOrFailureState$
      .pipe(
        skipWhile((value) => !value),
        take(1)
      )
      .subscribe(() => {
        this.router.navigate(['/nextPage']);
    });
  }
}
```
Your page is now set to trigger the navigation based on the status of its registered blocks and filter the navigation thanks to the `CanDeactivateRoutingGuard`.

## Application entrypoint
Some pages may need extra information in order to be loaded.
As an example you wish to land directly on a profile page and retrieve an existing profile with the id `XXXXX`.

You would target the profile page directly and provide the profileId as a query parameter

`https://example.com/profile?profileId=XXXXX`

But to make sure that your flow is not broken, you will have to set the context properly, so you can continue your navigation based on the retrieved profile.

There are two different ways of achieving this goal. Either you use a resolver which will fetch the data and block 
the navigation until the data has been fetched, or you don't want to block the navigation and display your page with 
the appropriate loading indicator (spinner or skeleton screen).

### [Resolve](https://angular.io/guide/router#resolve-pre-fetching-component-data)
A resolver is used to pre-fetch data before the route is activated. This means that the navigation will be blocked 
until mandatory data has been retrieved.
To do so you will have to create a resolver as shown below (our example will be based on the retrieval of an existing 
cart).
```typescript
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {ProfileService} from '@scope/sdk';
import {ProfileModel, ProfileStore, selectCurrentProfile} from '@scope/store/profile';
import {Observable} from 'rxjs';
import {filter, first} from 'rxjs/operators';

@Injectable()
export class ProfileResolver implements Resolve<ProfileModel | null> {
  private profileModel$: Observable<ProfileModel>;

  constructor(private store: Store<CartStore>, private profileService: ProfileService) {
    this.profileModel$ = this.store.pipe(
      select(selectCurrentProfile),
      filter((profile: ProfileModel | null): profile is ProfileModel => !!profile && !profile.isPending)
    );
  }

  resolve(route: ActivatedRouteSnapshot): Observable<ProfileModel | null> {
    const profileId = route.queryParams.profileId;
    if (profileId !== undefined) {
      this.profileService.retrieveProfile(profileId);
      // We resolve the data once we are sure that the profile definition in the store is the retrieved one
      return this.profileModel$.pipe(
        filter((profile: ProfileModel) => profile.isFailure || profile.id === profileId),
        first()
      );
    }
    return this.profileModel$.pipe(first());
  }
}
```
In our implementation, when the resolver needs to resolve data, it will first check if a profile id has been provided as 
query parameter. If so, it will retrieve the corresponding profile.

__NOTE:__ In our example we have to test the existence of the query parameter, because the resolver is also used in the 
standard flow (we have to wait for the profile to be available in the store before leaving the previous page).

The resolver will unlock the navigation once the profile state is not pending anymore (the API call has been performed).

To make sure that your resolver is taken into consideration during the navigation, you have to reference your 
resolver in the route configuration, and provide it in your module definition:
```typescript
@NgModule({
  imports: [
    RouterModule.forChild([{path: '', component: ExampleComponent, resolve: {profile: ProfileResolver}}]),
    ...
  ],
  ...,
  providers: [..., ProfileResolver]
})
export class ProfileModule {}
```

### [ActivatedRoute](https://angular.io/api/router/ActivatedRoute)
If you don't want to block the navigation and display your page with the appropriate loading indicator 
(spinner or skeleton screen), you could inject in your page component the  [ActivatedRoute](https://angular.io/api/router/ActivatedRoute) 
and make the call in the page constructor.

It will give you the ability to access the query parameters from the route snapshot, set your context (retrieving a 
profile) and display the loading indicator.
```typescript
...
import {ActivatedRoute} from '@angular/router';
...
export class myPageComponent {
  
  constructor(..., private route: ActivatedRoute) {
    const profileId = this.route.snapshot.queryParams.profileId;
    if (profileId) {
      this.profileService.retrieveProfile(profileId);
    }
  }
}
```
My page can then display a loading information (based on the profile status in the store) until the profile has been 
retrieved.
