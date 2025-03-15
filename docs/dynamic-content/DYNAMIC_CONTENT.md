# Dynamic content

In order to get your content from a different location from where your application is hosted, you may use the ``O3rDynamicContentPipe`` from ``@o3r/dynamic-content``. To include the pipe, you should just:

```typescript
import {O3rDynamicContentPipe} from '@o3r/dynamic-content';

@Component({
  imports: [O3rDynamicContentPipe]
})
export class MyComponent {}
```

The module provides two things:

A pipe to be used in your component templates:

```html
<img src="{{'assets-otter/imgs/logo.png' | o3rDynamicContent}}" /> or
<img [src]="'assets-otter/imgs/logo.png' | o3rDynamicContent" />
```

and a service to be used in your component classes, for example:

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

## Content base path

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

## getContentPath

For non-media resources (ex: localization, configuration) one should refer to the ``getContentPath`` method of the ``DynamicContentService``. Doing so will ensure the correct resource path is computed in an ACS-enabled environment (e.g. when the ``data-dynamiccontentpath`` tag is present in the body).

```typescript
@Component({
  /** */
})
export class MyComponent {
  private readonly dynamicContentService = inject(DynamicContentService);

  async getDynamicConfig() {
    const result = await fetch(this.dynamicContentService.getContentPath('global.config.post.json'));
    ...
  }
}
```
