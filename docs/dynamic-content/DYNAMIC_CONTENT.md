# Dynamic content

In order to get your content from a different location from where your application is hosted, you may use the ``DynamicContentModule`` from ``@o3r/dynamic-content``. To include the module, you should just:

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
<img src="{{'assets-otter/imgs/logo.png' | o3rDynamicContent}}" /> or
<img [src]="'assets-otter/imgs/logo.png' | o3rDynamicContent" />
```

and a service to be used in your component classes, for example:

```typescript

@Component({
  /* ... */
})
export class MyComponent {
  constructor(private service: DynamicContentService) {
    const imgSrc = this.service.getMediaPath('assets/assets-otter/imgs/logo.png');
  }
}
```

In both examples above, the result will be the same.

## Content base path

By default, both the service and the pipe will concatenate the assets path with a root path injected in the application. By default, the application will try to find the value of the data tag ``data-dynamiccontentpath`` in the body. Example:

```html
<body data-dynamiccontentpath="/cdn/myApp/">
</body>
```

If no tag is present, it defaults to empty string ``''``.

In order to change the default behavior, you can use the ``forRoot`` method from the module and passing a new function. Example:

```typescript
import {DynamicContentModule} from '@o3r/dynamic-content';

@NgModule({
  imports: [
    DynamicContentModule.forRoot({content: 'a-different-path/'})
  ]
})
export class MyModule {}
```

If you need an external dependency to get the rootpath, you may use need to provide directly the token.
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
