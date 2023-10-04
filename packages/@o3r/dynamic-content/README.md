<h1 align="center">Otter dynamic content</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/.attachments/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

This module provides a mechanism to retrieve media and data depending on the host or a server specific url.

## How to install

```shell
ng add @o3r/dynamic-content
```

> **Warning**: this module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Description

In order to get your content from a different location than where your application is hosted, you may use the ``DynamicContentModule`` from ``@o3r/dynamic-content``. To include the module, you should just:

```typescript
import {DynamicContentModule} from '@o3r/dynamic-content';

@NgModule({
  imports: [DynamicContentModule]
})
export class MyModule {}
```

The module provides two things:

A pipe to be used in your component templates:

```html
<img src="{{'assets-otter/imgs/logo.png' | dynamicContent}}" /> or
<img ngSrc="{{'assets-otter/imgs/logo.png' | dynamicContent}}"/>
```

and a service to be used in your component classes, for example:

```typescript
import { firstValueFrom } from 'rxjs';
@Component({
  /* ... */
})
export class MyComponent {
  constructor(private service: DynamicContentService) {
  }
  async getLogoPath() {
    const result = await firstValueFrom(this.service.getMediaPathStream('assets/assets-otter/imgs/logo.png'));
    //...
  }
}
```

In both examples above, the result will be the same.

### Content base path

By default, both the service and the pipe will concatenate the assets path with a root path injected in the application. By default, the application will try to find the value of the data tag ``data-dynamiccontentpath`` in the body. Example:

```html
<body data-dynamiccontentpath="/cdn/myApp/">
</body>
```

If no tag is present, it defaults to empty string ``''``.

In order to change the default behavior, you can use the ``forRoot`` method from the module and pass a new function. Example:

```typescript
import {DynamicContentModule} from '@o3r/dynamic-content';

@NgModule({
  imports: [
    DynamicContentModule.forRoot({content: 'a-different-path/'})
  ]
})
export class MyModule {}
```

If you need an external dependency to get the rootpath, you may need to provide the token directly.
Example:

```typescript
import {DynamicContentModule, DYNAMIC_CONTENT_BASE_PATH_TOKEN} from '@o3r/dynamic-content';

export function myContentPath() {
  return 'a-different-path/';
}

@NgModule({
  imports: [
    DynamicContentModule
  ],
  providers: {
    {provide: DYNAMIC_CONTENT_BASE_PATH_TOKEN, useFactory: myContentPath}
  }
})
export class MyModule {}
```

## getContentPath

For non-media resources (ex: localization, configuration) one should refer to the ``getContentPath`` method of the ``DynamicContentService``. Doing so will ensure the correct resource path is computed in an ACS-enabled environment (e.g. when the ``data-dynamiccontentpath`` tag is present in the body).

```typescript
@Component({
  /** */
})
export class MyComponent {
  constructor(private service: DynamicContentService) {}

  async getDynamicConfig() {
    const result = await fetch(this.dynamicContentService.getContentPath('global.config.post.json'));
    ...
  }
}
```
