# Logs

The Logger service aim is to ease and centralize logging of an Otter based application.

## Connection to third-party services

The `LoggerService` offers the capability to connect to third-party logging and session replay services (e.g. LogRocket, FullStory, SmartLook).

This can be achieved by binding a `LoggerClient` implementation to the `LoggerService`.

Some Otter packages provide implementations for LogRocket (@o3r/logger/logrocket-logger-client), FullStory (@o3r/logger/fullstory-logger-client) and SmartLook (@o3r/logger/smartlook-logger-client). Other implementations can be used.

### Setup

The `LoggerModule` should be imported in the main Module of the application and an instance of a `LoggerClient` implementation bound through the `forRoot` method.

```typescript
// in app.module.ts

import {LogRocketClient} from '@o3r/logger/logrocket-logger-client';
// import {SmartLookClient} from '@o3r/logger/smartlook-logger-client';
// import {FullStoryClient} from '@o3r/logger/fullstory-logger-client';
import {LoggerModule} from '@o3r/logger';

// ...

@NgModule({
  imports: [
    // ...
    LoggerModule.forRoot(
      new LogRocketClient('LogRocket appId')
      // new SmartLookClient('SmartLook key')
      // new FullStoryClient('FullStory orgId')
    )
  ]
})
export class AppModule {}

```

The store can also be bound to the third-party logging service by using the `LoggerService.createMetaReducer()` method.

```typescript
// in app.module.ts

import {Action, MetaReducer, USER_PROVIDED_META_REDUCERS} from '@ngrx/store';
import {LoggerServuce} from '@o3r/logger';

// ...

export function getUserProvidedMetaReducers(logger: LoggerService): MetaReducer<any, Action>[] {
  const loggerServiceMetaReducer = logger.createMetaReducer();
  return loggerServiceMetaReducer ? [loggerServiceMetaReducer] : [];
}

// ...

@NgModule({
  providers: [
    // ...
    {provide: USER_PROVIDED_META_REDUCERS, deps: [LoggerService], useFactory: getUserProvidedMetaReducers}
  ]
})
export class AppModule {}
```

### Advance usage

To provide complex logger client, the client can be provided via the `LOGGER_CLIENT_TOKEN` as following:

```typescript
import {LogRocketClient} from '@o3r/logger/logrocket-logger-client';
import {LOGGER_CLIENT_TOKEN, LoggerModule} from '@o3r/logger';

// ...

@NgModule({
  imports: [
    LoggerModule
  ],
  providers: [
    { provide: LOGGER_CLIENT_TOKEN, useValue: new LogRocketClient('LogRocket appId') }
  ]
})
export class AppModule {}
```

### Multi Client

The Logger service supports multi logger clients.
This can be provided via the `.forRoot()` function of the `LoggerModule` as following:

```typescript
import {LogRocketClient} from '@o3r/logger/logrocket-logger-client';
import {SmartLookClient} from '@o3r/logger/smartlook-logger-client';
import {LoggerModule} from '@o3r/logger';

// ...

@NgModule({
  imports: [
    // ...
    LoggerModule.forRoot(
      new LogRocketClient('LogRocket appId'),
      new SmartLookClient('SmartLook key')
    )
  ]
})
export class AppModule {}
```

Or via multi providers:

```typescript
import {LogRocketClient} from '@o3r/logger/logrocket-logger-client';
import {SmartLookClient} from '@o3r/logger/smartlook-logger-client';
import {LOGGER_CLIENT_TOKEN, LoggerModule} from '@o3r/logger';

@NgModule({
  imports: [
    LoggerModule
  ],
  providers: [
    { provide: LOGGER_CLIENT_TOKEN, useValue: new LogRocketClient('LogRocket appId'), multi: true },
    { provide: LOGGER_CLIENT_TOKEN, useValue: new SmartLookClient('SmartLook key'), multi: true }
  ]
})
export class AppModule {}
```

### How to use

The `LoggerService` is agnostic of the third-party services and offers an abstraction layer for the application.

It exposes generic method that can be called directly regardless of the client used.

For instance:

```typescript
// ...

import {LoggerService} from '@o3r/logger';

export class TravelerComponent {
  constructor(private loggerService: LoggerService) {}

  public ngOnInit() {
    this.loggerService.identify(emailAddress, {
      name: firstName + ' ' + lastName,
      email: emailAddress,
      ff: frequentFlyerNumber
    });
  }
}
```
