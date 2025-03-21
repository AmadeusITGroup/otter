<h1 align="center">Otter dynamic content</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/dynamic-content?style=for-the-badge)](https://www.npmjs.com/package/@o3r/dynamic-content)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/dynamic-content?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/dynamic-content)

This module provides a mechanism to retrieve media and data depending on the host or a server-specific url.

## How to install

```shell
ng add @o3r/dynamic-content
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Description

In order to get your content from a different location than where your application is hosted, you may use the ``O3rDynamicContentPipe`` or ``DynamicContentService`` from ``@o3r/dynamic-content``.

### O3rDynamicContentPipe

```typescript
import {O3rDynamicContentPipe} from '@o3r/dynamic-content';

@Component({
  ...
  imports: [O3rDynamicContentPipe, ...]
})
export class MyComponent {}
```
```html
<img src="{{'assets-otter/imgs/logo.png' | o3rDynamicContent}}" /> or
<img [src]="'assets-otter/imgs/logo.png' | o3rDynamicContent" />
```

### DynamicContentService

```typescript

@Component({
  /* ... */
})
export class MyComponent {
  public readonly imgSrc = inject(DynamicContentService).getMediaPath('assets/assets-otter/imgs/logo.png');
}
```
```html
<img [src]="imgSrc" />
```

In both examples above, the result will be the same.

### Content base path

By default, both the service and the pipe will concatenate the assets path with a root path injected in the application. By default, the application will try to find the value of the data tag ``data-dynamiccontentpath`` in the body. Example:

```html
<body data-dynamiccontentpath="/cdn/myApp/">
</body>
```

If no tag is present, it defaults to empty string ``''``.

In order to change the default behavior, you can specify a configuration:

```typescript
import {provideDynamicContent, withBasePath} from '@o3r/dynamic-content';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideDynamicContent(withBasePath('a-different-path/'))
  ]
};
```

If you need an external dependency to get the rootpath, you may use need to provide a function.
```typescript
import {provideDynamicContent, withBasePath} from '@o3r/dynamic-content';

export function myContentPath() {
  return 'a-different-path/';
}


export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideDynamicContent(withBasePath(myContentPath))
  ]
};
```

## getContentPathStream

For non-media resources (ex: localization, configuration) one should refer to the ``getContentPath`` method of the ``DynamicContentService``. Doing so will ensure the correct resource path is computed in any environment (e.g. when the ``data-dynamiccontentpath`` tag is present in the body).

The content path is always related to the root of the application.
It also ignores any path overrides from the `AssetPathOverrideStore` store, meaning that you will always get the same file.

```typescript
import {from, type Observable} from 'rxjs';
import {shareReplay, switchMap} from 'rxjs/operators';

@Component({
  /** */
})
export class MyComponent {
  public dynamicConfig$: Observable<Response> = inject(DynamicContentService).getContentPathStream('global.config.post.json').pipe(
    switchMap((filePath) => from(fetch(filePath))),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
```

## getMediaPathStream

This method allows to access all media resources: meaning any resource that is INSIDE the media folder.
The assets path needs to be relative to the media folder.
Example:

```typescript
@Component({
  /** */
})
export class MyComponent {
  private readonly dynamicContentService = inject(DynamicContentService);

  async getDynamicConfig() {
    const filePath = await firstValueFrom(this.service.getMediaPathStream('imgs/my-image.png'));
    const fileContent = await fetch(filePath);
    //  ...
  }
}
```
It also looks for overrides in the `AssetPathOverrideStore`, so it will return the new value instead if an override is found.

## AssetPathOverrideStore

A dedicated store is available in case you want to override any media path.
This store contains a mapping between the current file path and the one that should be used instead.

This override ONLY WORKS for media resources.

