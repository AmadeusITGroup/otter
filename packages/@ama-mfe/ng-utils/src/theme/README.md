# Initial theme load
The __applyInitialTheme__ helper exposed by this package allows the host application and the embedded application to apply a specific theme at load time. The mechanism is based on the `theme=${theme-name}` query parameter which, if present, will download the theme file with the name `${theme-name}-theme.css` from the root of the application that calls the helper and applies the style. So the theme file has to be at the root of the distribution folder of the app.

## How does it work for an embedded application
The theme mechanism defined in this package allows the host application to drive the theming. This means that if the initial theme helper is called on an embedded module, in addition to searching for its own `${theme-name}-theme.css`, it will search for the theme file of the host application (which will have the same name `${theme-name}-theme.css` but will be served by the host domain).

If both calls are successful, the theme from the host will be applied first, then the theme from the module will come in second place. It is done this way because the theme from the module will handle corner cases and specific elements which cannot be covered by the host application. Moreover, the module-specific style might override some generic CSS rules that came from the host.

In case of call failures, the helper ignores them, but returns the result of the calls in case of a custom need.

# Theme Message Service

## Introduction
The theme service allows a host application to share its CSS theme with an embedded application.

## How to use
### Consumer - apply a theme
For this use case, the embedded application is the consumer. It will react to the theme message and apply the CSS theme
on top of its current design.
This is the default behavior of the `ThemeConsumerService`. Simply call the `start` method to use it
as described in the [package consumer documentation](../../README.md#consumers).

If you have specific CSS to apply, as for today, you can only rely on the theme parameter set by the host in the
`apply-theme` pipe.

In future versions, the `ThemeConsumerService` will be able to handle the load of the consumer's specific styling.

### Producer - communicate a theme
For this use case, the host is in charge of informing its embedded app which theme the user may have selected (based on
user preferences for example). That makes it the producer of the theme message.

Themes are characterized by a name and a potential CSS file with a list of common CSS rules and variables that will be
applied to all their embedded applications.
Note that this common CSS should not have dedicated rules for the applications.

Consider it as a parent theme which should have no knowledge on how the applications underneath it are coded, except the
common rules (shared design system and variable for example).

Let's see an example of a `dark` theme message.

The host defines the dark theme in the `dark-theme.css` file:
```css
:root {
  --body-bg: #000000;
  --body-color: #ffffff;
}
```

Note that the theme must be part at the root of the bundle.
The CSS file must be included in the `angular.json` file:
```json5
{
  projects: {
    hostApplication: {
      projectType: "application",
      //      ...
      architect: {
        build: {
          //          ...
          options: {
            //            ...
            "styles": [
              "apps/hostApplication/src/styles.scss",
              {
                "inject": false,
                "input": "apps/cockpit/src/style/dark-theme/dark-theme.scss",
                "bundleName": "dark-theme"
              }
            ]
          }
        }
      }
    }
  }
}
```

Now, the host application can just call the `changeTheme` method to generate a theme message with the content of the
dark theme stylesheet.

```typescript
import {CommonModule} from '@angular/common';
import {Component, inject, computed} from '@angular/core';
import {ThemeService} from '@ama-mfe/ng-utils';

@Component({
  selector: 'theme-selection',
  imports: [
    CommonModule
  ],
  templateUrl: './navigation-header.template.html',
})
export class NavigationHeaderComponent {

  private readonly themeManagerService = inject(ThemeService);

  constructor() {
    // Emit a new theme message with the following content:
    // {
    //   type: theme,
    //   name: 'dark',
    //   css: ':root { --body-bg: #000000; --body-color: #ffffff; }'
    //   version: '1.0'
    // }
    this.themeManagerService.changeTheme(theme.name);
  }
}
```

The host can also pass the theme information to the iframe via a query parameter using the `applyTheme` pipe:
```html
<iframe [src]="moduleUrl | applyTheme"></iframe>
```
