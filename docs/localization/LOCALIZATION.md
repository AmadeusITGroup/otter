# Otter Localization

The localization module is built on top of an open source [ngx-translate](https://github.com/ngx-translate/core) library.

[Date](https://angular.io/api/common/DatePipe), [currency](https://angular.io/api/common/CurrencyPipe), [decimal](https://angular.io/api/common/DecimalPipe) number, [pluralization](https://angular.io/api/common/I18nPluralPipe) and [selection](https://angular.io/api/common/I18nSelectPipe) can be easily handled by built-in Angular pipes and by providing them a locale.

# Features

- Multiple [locales](https://github.com/angular/angular/tree/master/packages/common/locales) support, switchable at runtime

- RTL (right-to-left) text direction support

- Translations loader using a specific endpoint (external URL source such as a CMS for example) or defaulting to local translation bundles in the **src/assets/locales** folder of your application. The assets folder for bundles can be changed by configuration (via a CLI option).

- Intelligent fallback support. For any unsupported language request, the localization service will try to fetch the translation bundle from the fallback locale map OR the first closest supported language. More information in the [intelligent fallback section](#intelligent-fallback-support) below.

- Resource keys can be translated from templates (`*.html`) via a [pipe](https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/src/lib/translate.pipe.ts) or [directive](https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/src/lib/translate.directive.ts) as well as from typescript (`*.ts`) via a [service](https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/src/lib/translate.service.ts).

- Support for resource keys with parameters.

- Custom `LocalizationConfiguration` can be injected from the application.

- Ability to toggle translations on and off to help identify the key corresponding to a translation.

# How to use

We provide an Angular module in **@o3r/localization** called [LocalizationModule](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/localization/src/tools/localization.module.ts) which comes with a translations loader.

## Configuration of Localization Module

In your `AppModule`, you need to **import** the `LocalizationModule` and `TranslateModule` (from **@ngx-translate/core**). The `LocalizationModule` could be imported calling its `forRoot` method
with a custom configuration **factory** to specify the language of the application. This configuration is of type `LocalizationConfiguration` and describes:

- The endpoint URL - where to fetch the translation bundles from
- Supported locales - list of available languages
- RTL languages - list of RTL language codes
- The language of the application - display language
- The fallback language - fallback in case the translation in the selected language does not exist

All the possible configuration options can be found in the `LocalizationConfiguration` [interface](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/localization/src/core/localization.configuration.ts).

You can also import the `LocalizationModule` without a configuration parameter in its `forRoot` method. In this case, you will be provided with some default `LocalizationConfiguration`.

```typescript
// app.module.ts

import { registerLocaleData } from '@angular/common';
import localeAR from '@angular/common/locales/ar';
import localeEN from '@angular/common/locales/en';
import localeFR from '@angular/common/locales/fr';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizationModule, translateLoaderProvider } from '@o3r/localization';

// ...

registerLocaleData(localeAR, 'ar-AR');
registerLocaleData(localeEN, 'en-GB');
registerLocaleData(localeFR, 'fr-FR');

export function localizationConfigurationFactory() {
  return {
    supportedLocales: ['en-GB', 'fr-FR', 'ar-AR'],
    fallbackLocalesMap: {
      'en-CA': 'en-GB',
      'en-US': 'en-GB',
      'de': 'fr-FR',
      'zh': 'en-GB'
    },
    fallbackLanguage: 'en-GB',
    bundlesOutputPath: environment.LOCALIZATION_BUNDLES_OUTPUT,
    useDynamicContent: true,
    debugMode: false
  };
}

@NgModule({
  imports: [
    LocalizationModule.forRoot(localizationConfigurationFactory),
    TranslateModule.forRoot({
      loader: translateLoaderProvider,
    }),
    // ...
  ],
  providers: [],
  // ...
})
export class AppModule {}
```

If you leave the property `endPointUrl` **blank** in the localization configuration, the loader will try to fetch translation bundles from your application's `src/assets/assets-otter/i18n` folder.

You can specify a **language** in the configuration, it will be loaded at the bootstrap time of your application.
A language can be specified asynchronously by using the `LocalizationService.useLanguage(...)` function.

- In case it is not enough to provide your configuration object as explained above, you can also provide a new factory for the localization configuration.
  You only need to provide a token `LOCALIZATION_CONFIGURATION_TOKEN` with your custom factory and dependencies.

```typescript
// app.module.ts

import localeAR from '@angular/common/locales/ar';
import localeEN from '@angular/common/locales/en';
import localeFR from '@angular/common/locales/fr';
import { TranslateModule } from '@ngx-translate/core';
import { LOCALIZATION_CONFIGURATION_TOKEN, LocalizationModule, translateLoaderProvider } from '@o3r/localization';
// ...

registerLocaleData(localeEN, 'en-EN');
registerLocaleData(localeFR, 'fr');
registerLocaleData(localeAR, 'ar');

@NgModule({
  imports: [
    LocalizationModule,
    TranslateModule.forRoot({
      loader: translateLoaderProvider,
    })
    // ...
  ],
  // ...
  providers: [
    {provide: LOCALIZATION_CONFIGURATION_TOKEN, useFactory: customCreateLocalizationConfiguration, deps: [YourServiceNeededByTheFactory]}
  ]
})
class AppModule {}
```

## HTTP server

You may also need to set up your http server to accept **CORS** and update the `connect-src` property of `csp.json` in your application.

```json5
// configs/csp.json

{
  "connect-src": "http://example.com"
}
```

## Localizing the components

Now we are ready to localize the components of the application.

### How to generate localization files for a component

#### Generate a localized component

You can directly generate a localized component with the following command:

```shell
ng g component ComponentName --use-localization
```

The `--use-localization` parameter triggers the `localization-to-component` schematic, which adds the localization architecture to a component.

This parameter is only mandatory if it is not provided in the workspace configuration file (such as `angular.json`, `nx.json` or `project.json`)
under the `schematics` property, like this:

```json5
{
  "schematics": {
    "@o3r/core:component": {
      // ...
      "useLocalization": true
    },
  }
}
```

> [!NOTE]
> The `ngAdd` of the **@o3r/localization** package will set the `useLocalization` parameter to true for all schematic packages beginning with `'@o3r/core:component*'`
> (including `@o3r/core:component`, `@o3r/core:component-presenter`, `@o3r/core:component-container`).
>
> ```shell
> ng add @o3r/localization
> ```

#### Add localization to an existing component

You can also localize a component later with:

```shell
ng g localization-to-component --path='path/to/the/component/class/file'
```

As mentioned above, the `localization-to-component` schematic adds the localization architecture to a component. For an existing component, the schematic
first checks that the component does not already contain localization files or properties, otherwise an error is thrown.

> [!NOTE]
> Later you can add a localization key to a component with the following command:
>
> ```shell
> ng g localization-key-to-component --path='path/to/the/component/class/file' --key='localizationKey' --value='Default value for localizationKey'
> ```
>
> You can also do this using the Otter VSCode Extension that contains the `Otter: Add localization key to component` [feature](https://github.com/AmadeusITGroup/otter/blob/main/docs/vscode-extension/ADD_LOCALIZATION_KEY_TO_COMPONENT.md),
> which largely simplifies this command.

### Generated files

#### Localization file (`*.localization.json`)

The JSON localization file defines an object of key/value pairs. Each value is a JSON object with the properties `description` and `defaultValue`.
Eventually, you can reference a global key via `$ref` using a relative path to a global localization JSON file or in a different package in the dependencies.
The purpose of this file is to provide a default localization for a component so that the developer can start building pages using components without worrying about localization.
The `*.localization.json` file specifies default values in English only.

```json5
{
  "o3r-my-component-pres.somekey1": {
    "description": "This is somekey1 description for translators",
    "defaultValue": "This is my default value 1"
  },
  "o3r-my-component-pres.somekey2": {
    "description": "This is somekey2 description for translators",
    "defaultValue": "This is my default value 2"
  },
  "o3r-my-component-pres.someglobalkey1": {
    "$ref": "../global.localization.json#/someglobalkey1"
  },
  "o3r-my-component-pres.someglobalkey2": {
    "$ref": "@scope/common/global.localization.json#/someglobalkey2"
  }
}
```

##### How to properly create keys?

- **Manually:**

To ensure the uniqueness of localization keys, it's a good idea to follow naming conventions. For components, we recommend prefixing each key by the component selector.
Hence, the naming convention for keys is the component selector followed by `.` (dot character) and any string of your choice.

For example, if your `SimpleHeaderPresComponent` has the selector `o3r-simple-header-pres`, then your keys may look like this:

```json5
{
  "o3r-simple-header-pres.airline": {
    "description": "Airline name",
    "defaultValue": "My Airline"
  },
  "o3r-simple-header-pres.motto": {
    "description": "Airline motto phrase",
    "defaultValue": "Let's shape the future of travel"
  },
  "o3r-simple-header-pres.locWithArg": {
    "description": "Hello message to the user (passed as a parameter)",
    "defaultValue": "Hello, { user }!"
  }
}
```

- **VSCode Extension:**

For VSCode users, we provide an Otter extension that allows to create localization keys (and their corresponding descriptions) directly from some selected text in the component's template.

More details on how to do this in the [documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/vscode-extension/ADD_LOCALIZATION_KEY_TO_COMPONENT.md).

#### Translation file (`*.translation.ts`)

The translation file is used to define the localization variables used by the component template.
It typically defines an interface which extends `Translation` from `@o3r/core` with all possible variable names used by your component template.
It also exports a constant (`translations`) that satisfies the above contract. The values for each property are localization keys (real keys from the localization bundle).

```typescript
import {Translation} from  '@o3r/core';

export  interface MyComponentPresTranslation extends Translation {
  prop1: string;
  prop2: string;
}

export  const translations: MyComponentPresTranslation = {
  prop1: 'o3r-my-component-pres.somekey1',
  prop2: 'o3r-my-component-pres.somekey2'
};
```

For the `SimpleHeaderPresComponent` example, the translation file could look something like this:

```typescript
import type { Translation } from '@o3r/core';

export interface SimpleHeaderPresTranslation extends Translation {
  /** Airline name */
  airline: string;
  /** Airline motto phrase */
  motto: string;
  /** Hello message to the user (passed as a parameter) */
  locWithArg: string;
}

export const translations: SimpleHeaderPresTranslation = {
  airline: 'o3r-simple-header-pres.airline',
  motto: 'o3r-simple-header-pres.motto',
  locWithArg: 'o3r-simple-header-pres.locWithArg'
};
```

### Component file

Now to localize your component, you will start by implementing the `Translatable` interface which forces you to declare the `translations` property.
This property requires 2 decorators (`@Input()` and `@Localization(url)`, with `url` corresponding to the relative path of the localization file).
This will let you override localization keys from the template and give your component some default localization if you don't have your own to start with.

```typescript
import { Component, Input } from '@angular/core';
import { Localization, LocalizationModule, Translatable } from '@o3r/localization';
import { SimpleHeaderPresTranslation, translations } from './simple-header-pres.translation';

@Component({
  selector: 'o3r-simple-header-pres',
  imports: [LocalizationModule],
  styleUrls: ['./simple-header-pres.style.scss'],
  templateUrl: './simple-header-pres.template.html'
})

export class SimpleHeaderPresComponent implements Translatable<SimpleHeaderPresTranslation>, ... {
  /**
   * Localization of the component
   */
  @Input()
  @Localization('./simple-header-pres.localization.json')
  public translations: SimpleHeaderPresTranslation = translations;
}
```

### Template file

We can now use the `translations` property (declared in the component file) in the template.

- If you **only** need to translate **text** in your template file, simply use the `o3rTranslate` pipe with/without parameters as follows:

```html
<!-- output: "Let's shape the future of travel" -->
{{ translations.motto | o3rTranslate }}
```

- If you need to display **text with HTML markup** that needs to be interpreted by your browser, you need to use binding as follows:

```html
<!-- use binding for a resource with HTML markup -->
<span [innerHTML]="translations.airline | o3rTranslate"></span>
```

- If you need to display **text** with some **dynamic** elements (resource with parameters), you can pass the translation parameters like this:

```html
<!-- output: "Hello, otter friend!" -->
{{ "o3r-simple-header-pres.locWithArg" | o3rTranslate: {user: 'otter friend'} }}
```

> [!NOTE]
> The code to the `o3rTranslate` pipe can be found in the [tools of the @o3r/localization module](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/localization/src/tools/localization-translate.pipe.ts).

### Localization bundle

#### How to generate a component bundle

```shell
ng run project-name:i18n
```

It will create an `i18n` folder in the component folder, with an `en-GB.json` file containing the mapping between the localization key and the associated default value.

Check the list of options available by running:

```shell
ng run project-name:i18n --help
```

#### How to generate an application bundle

```shell
ng run project-name:generate-translations
```

It will create the application bundle for each supported language.

Check the list of options available by running:

```shell
ng run project-name:generate-translations --help
```

## Additional features

### How to localize a date, decimal and currency

Use Angular's built-in [DatePipe](https://angular.io/api/common/DatePipe), [DecimalPipe](https://angular.io/api/common/DecimalPipe) and [CurrencyPipe](https://angular.io/api/common/CurrencyPipe) pass the current locale as the last parameter.
The locale is read from `this.localizationService.getCurrentLanguage()`. To be able to use this, your component must import the `LocalizationModule`. You will then be able to inject the `LocalizationService` in the component in order to get the current language.

```typescript
import { Component, inject, Input } from '@angular/core';
import { Localization, LocalizationModule, LocalizationService, Translatable } from '@o3r/localization';
import { SimpleHeaderPresTranslation, translations } from './simple-header-pres.translation';

@Component({
  selector: 'o3r-simple-header-pres',
  imports: [LocalizationModule],
  styleUrls: ['./simple-header-pres.style.scss'],
  templateUrl: './simple-header-pres.template.html'
})
export class SimpleHeaderPresComponent implements Translatable<SimpleHeaderPresTranslation>, ... {

  // ...
  private readonly localizationService = inject(LocalizationService);
  public readonly currentLanguage = toSignal(
    this.localizationService.getTranslateService().onLangChange.pipe(map(({ lang }) => lang)),
    { initialData: this.localizationService.getCurrentLanguage() }
  )

  /**
   * Called upon language change to set current language
   * @param  language
   */
  public useLanguage(language: string) {
    this.localizationService.useLanguage(language);
  }
}
```

Now we can start using pipes:

```html
<p>{{today | date: 'fullDate'}}</p>
<p>{{1.5487 | number: ''}}</p>
<p>{{1.5487 | currency: 'EUR' : 'symbol' : ''}}</p>
```

> [!NOTE]
> A locale parameter can be added to the pipe, such as the following:
>
> ```html
> <p>{{today | date: 'fullDate' : '' : currentLanguage()}}</p>
> ```
>
> However, the format of the pipes is based on the current locale so adding the `currentLanguage()` parameter is optional.
> Another locale can be added in order to override the current one, for example:
>
> ```html
> <p>{{1.5487 | currency: 'CAD' : 'symbol' : '' : 'fr-FR'}}</p>
> ```

### How to add custom translations in the container

A container can have its own translations (for error messages for example). In this case, the container becomes `Translatable` as follows:

```typescript
import { Translatable } from '@o3r/localization';
import { MyContTranslation } from '../my.translation.ts';

@Component({
  selector: 'o3r-my-cont',
  templateUrl: './my.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyContComponent implements Translatable<MyContTranslation>, Block {

  /**
   * Localization of the component
   */
  @Input()
  @Localization('./my.localization.json')
  public translations: MyContTranslation;
}
```

There is also a possibility for the container to override the presenter's translations and pass them as input to the presenter.

### Configure the Localization Service in your root component

```typescript
// app.component.ts

import { inject } from '@angular/core';
import { LocalizationService } from '@o3r/localization';

// Inject LocalizationService which will take care of configuring TranslateService using LocalizationConfiguration and call configure() method
constructor() {
  inject(LocalizationService).configure();
}
```

### How to add RTL support in the application

The `TextDirectionService` has to be injected in `app.component.ts` as follows:

```typescript
// app.component.ts

import { inject } from '@angular/core';
import { TextDirectionService } from '@o3r/localization';

private readonly textDirectionService = inject(TextDirectionService);

public ngOnInit() {
  this.subscriptions.push(this.textDirectionService.onLangChangeSubscription());
}
```

### Lazy Compiler for ICU Translation support

To be able to handle a large amount of ICU translations, a lazy compiler is provided in the `@o3r/localization` package.

```typescript
// app.module.ts

import localeAR from '@angular/common/locales/ar';
import localeEN from '@angular/common/locales/en';
import localeFR from '@angular/common/locales/fr';
import { TranslateCompiler, TranslateModule } from '@ngx-translate/core';
import {
  LocalizationModule,
  MESSAGE_FORMAT_CONFIG,
  TranslateMessageFormatLazyCompiler
} from '@o3r/localization';

// ...

registerLocaleData(localeEN, 'en-EN');
registerLocaleData(localeFR, 'fr');
registerLocaleData(localeAR, 'ar');

@NgModule({
  imports: [
    // ...
    LocalizationModule.forRoot({ ... }),
    TranslateModule.forRoot({
      // ...
      compiler: {provide: TranslateCompiler, useClass: TranslateMessageFormatLazyCompiler}
    })
  ],
  providers: [
    // Optional configuration:
    {provide: MESSAGE_FORMAT_CONFIG, useValue: {enableCache: false}}
  ]
})
class AppModule {}
```

> [!NOTE]
> The token `MESSAGE_FORMAT_CONFIG` implements the `LazyMessageFormatConfig` interface from `@o3r/localization`.

### How to localize plural expressions

For pluralization, we are using the `TranslateMessageFormatCompiler`, coming from the [ngx-translate-messageformat-compiler](https://www.npmjs.com/package/ngx-translate-messageformat-compiler) package, which is a compiler for `ngx-translate` that uses `messageformat.js` to compile translations using ICU syntax for handling pluralization and gender.

[ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/) is a standardized syntax for dealing with the translation of user-visible strings into various languages that may have different requirements for the correct declension of words (e.g. according to number, gender, case) - or to simplify: pluralization.

Simple pluralization rules like *0, 1 or other* work well for English, but may not be suitable for many other languages (Eastern European languages, Asian languages) where pluralization rules are much more complex. If this does not meet your requirements, we recommend reformulating your text so that you do not need to use pluralization.
Example: instead of saying **'You have added 2 bags'** you may want to say **'Number of bags: 2'**, which should suit most languages, no matter which number is considered plural.

#### Integration with ngx-translate

You need to configure the `TranslateModule` for it to use `TranslateMessageFormatCompiler` as a compiler. We will use `TranslateMessageFormatLazyCompiler`, which is an Otter extension of the base compiler. See the [Lazy Compiler for ICU Translation support](#lazy-compiler-for-icu-translation-support) section above for details.

```typescript
// app.module.ts

import { TranslateCompiler, TranslateModule } from '@ngx-translate/core';
import { MESSAGE_FORMAT_CONFIG, TranslateMessageFormatLazyCompiler } from '@o3r/localization';

// ...

@NgModule({
  imports: [
    TranslateModule.forRoot({
      // ...
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatLazyCompiler
      }
    }),
  // ...
  ],
  providers: [
    // Optional compiler configuration:
    {provide: MESSAGE_FORMAT_CONFIG, useValue: {locales: ['ar', 'fr']}}
  ]
})
class AppModule {}
```

```json5
{
  // the key has to be defined in the localization bundle
  "o3r-list-inline-messages-pres.nbOfErrors": "{count, plural, =0{No errors} one{# error} other{# errors}}"
  // where 'count' is the parameter received
}
```

```html
<!-- component HTML template -->
</span> {{translations.nbOfErrors | o3rTranslate: {count: countMessages} }}
```

The value of `translations.nbOfErrors` is the translation key `o3r-list-inline-messages-pres.nbOfErrors`. The next step translates the key by passing some parameters to the translate pipe.

The output will be:

- `No errors` if `countMessages` is 0
- `1 error` if `countMessages` is 1
- `'Value of countMessages' errors` if `countMessages` is greater than 1 (ex: `10 errors`)

### How to localize a choice

Sometimes you may want to display a different resource based on the value of a property that is not a number.

```json5
{
  // the key has to be defined in the localization bundle
  "global.people": "{gender, select, male{He is} female{She is} other{They are}} {how}"
  // where 'gender' is the parameter used for choice and 'how' it's a parameter used only for display
}
```

```html
<!-- in component HTML -->
<ul>
  <li>{{ translations.people | o3rTranslate: { gender: 'female', how: 'influential' } }}</li>
  <li>{{ translations.people | o3rTranslate: { gender: 'male', how: 'funny' } }}</li>
  <li>{{ translations.people | o3rTranslate: { how: 'affectionate' } }}</li>
</ul>
```

Note again that `translations.people` matches the `global.people` key:

```
- She is influential
- He is funny
- They are affectionate
```

# Intelligent fallback support

The localization service supports a fallback strategy described in the details below.

## Scenario 1: Fallback based on `fallbackLocalesMap` and `supportedLocales`

In case `fallbackLocalesMap` is provided and the targeted translation language is unavailable in the list of supported locales,
the first priority goes to `fallbackLocalesMap` to see if the targeted translation language can be mapped with the configured fallback map.
The second priority goes to `supportedLocales` to match the targeted translation language to the first closest possible language, the **locale** may be different.
If none match, it will fall back to the **default language**.

**Let's assume:**

```typescript
return {
  // ...
  supportedLocales: ['en-GB', 'en-US', 'fr-FR', 'ar-AR'],
  fallbackLocalesMap: {
    'en-CA': 'en-US',
    'fr-CA': 'fr-FR',
    'de-CH': 'ar-AR',
    'de': 'fr-FR',
    'it': 'fr-FR',
    'hi': 'en-GB',
    'zh': 'en-GB'
  },
  fallbackLanguage: 'ar-AR'
}
```

**Fallback scenarios:**

- `en-CA` **fallbacks to** `en-US`, as direct mapping available in fallback locales map.
- `de-CH` **fallbacks to** `ar-AR`, as direct mapping available in fallback locales map.
- `de-AT` **fallbacks to** `fr-FR`, as language mapping available in fallback locales map.
- `zh-CN` **fallbacks to** `en-GB`, as language mapping available in fallback locales map.
- `en-AU` **fallbacks to** `en-GB`, as fallback locales mapping unavailable, first nearest language available in supported locales.
- `fr-BE` **fallbacks to** `fr-FR`, as fallback locales mapping unavailable, first nearest language available in supported locales.
- `bn-BD` **fallbacks to** `ar-AR`, as it is the default fallback.

## Scenario 2: Fallback based on `supportedLocales`

In case `fallbackLocalesMap` is not provided and the targeted translation language is unavailable in the list of supported locales,
the targeted translation language will be compared to the supported locales to find the first closest match, the **locale** may be different.
If none match, it will fall back to the **default language**.

**Let's assume:**

```typescript
return {
  // ...
  supportedLocales: ['en-GB', 'fr-FR', 'fr-CA', 'ar-AR'],
  fallbackLanguage: 'en-GB'
}
```

**Fallback scenarios:**

- `en-US` **fallbacks to** `en-GB`, as en-GB has the same language with a different region.
- `fr-BE` **fallbacks to** `fr-FR`, as fr-FR is first in the supported locales list.
- `it-IT` **fallbacks to** `en-GB`, as it is the default fallback.

# Debugging

## Runtime: toggle translation on and off

To make it easier to identify which key corresponds to a given text, the ``LocalizationService`` exposes a function ``toggleShowKeys()`` that can be called to deactivate or reactivate the translation mechanism at **runtime**.
While deactivated, the ``translate`` **pipe** and **directive** will output the translation keys instead of their resolved values.

> [!NOTE]
> This mechanism only applies to the pipe and directive exported by Otter's ``LocalizationModule``. The original ones from ``ngx-translate`` do not support it.

First, this mechanism has to be activated via the ``LocalizationConfiguration`` that you can provide in your ``AppModule``.

> [!IMPORTANT]
> This is mainly for performance reasons, as it adds a new subscription to every ``translate`` pipe and directive in order to know when translations are turned on or off.
> Not enabling it prevents all these subscriptions and should be the baseline for a production environment.

Example:

````typescript
// app.module.ts

export function localizationConfigurationFactory(): LocalizationConfiguration {
  return {
    ...DEFAULT_LOCALIZATION_CONFIGURATION,
    supportedLocales: ['en-GB', 'fr-FR', 'ar-AR'],
    fallbackLocalesMap: {
      'en-CA': 'en-GB',
      'en-US': 'en-GB',
      'de': 'fr-FR',
      'zh': 'en-GB'
    },
    fallbackLanguage: 'en-GB',
    bundlesOutputPath: environment.LOCALIZATION_BUNDLES_OUTPUT,
    useDynamicContent: true,
    // dummy example
    enableTranslationDeactivation: window.location.search.indexOf('debug=true') >= 0
  };
}

@NgModule({
  imports: [LocalizationModule],
  providers: [{provide: LOCALIZATION_CONFIGURATION_TOKEN, useFactory: localizationConfigurationFactory}]
})
export class AppModule {}
````

Example of usage in a debug component:

````typescript
// Component class
@Component({
  selector: 'debug',
  templateUrl: './debug.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebugComponent {
  constructor(private localizationService: LocalizationService) {}

  public toggleTranslation() {
    this.localizationService.toggleShowKeys();
  }
}
````

````angular2html
<!-- Component template -->
<div>
  <h3>Debug:</h3>
  <button (click)="toggleTranslation()">Toggle translation</button>
</div>
````

## Bootstrap: enable debug mode to display ``<key> - <translation>``

You can enable debug mode by setting `debugMode` property of `LocalizationConfiguration` to **true** (the default value is false).

```typescript

registerLocaleData(localeEN, 'en-EN');
registerLocaleData(localeFR, 'fr');
registerLocaleData(localeAR, 'ar');

@NgModule({
  imports: [
    LocalizationModule.forRoot({
      language: 'fr',
      endPointUrl: 'http://example.com',
      bundlesOutputPath: config.LOCALIZATION_BUNDLES_OUTPUT,
      supportedLocales: ['en-EN', 'fr', 'ar'],
      debugMode: true
    })
    // ...
  ]
})
```

This way, all your translations will be prefixed by the corresponding localization key, so you can easily map the text to the key.

Examples:

- `simpleHeader.airline - My Airline`
- `simpleHeader.motto - Let's shape the future of travel`

## Enable Chrome extension debugging

The Otter framework provides a [Chrome Extension](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) to help debug the application.
To enable the communication with the [Otter Devtools](https://chrome.google.com/webstore/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne), the two following steps are required:

1. Importing the Devtools module into the application module:

```typescript
import { LocalizationDevtoolsModule } from '@o3r/localization';

@NgModule({
  imports: [
    // ...,
    LocalizationDevtoolsModule
  ]
})
export class AppModule {}
```

2. Importing the `LocalizationDevtoolsMessageService` in the `main.ts` file of the application (we recommend doing this to avoid polluting the `app.component.ts` file):

```typescript
// main.ts

import { inject, runInInjectionContext } from '@angular/core';
import '@angular/localize/init';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { LocalizationDevtoolsMessageService } from '@o3r/localization';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule).then((m) => runInInjectionContext(m.injector, () => inject(ConfigurationDevtoolsConsoleService)))
```

3. The debug message service needs to be activated:

You can do this in the `main.ts` file:

```typescript
// main.ts
platformBrowserDynamic().bootstrapModule(AppModule).then((m) => runInInjectionContext(m.injector, () => inject(ConfigurationDevtoolsConsoleService).activate()));
```

Or in the `AppModule`:

```typescript
// app.module.ts

import { OTTER_LOCALIZATION_DEVTOOLS_OPTIONS } from '@o3r/localization';

@NgModule({
  // ...
  providers: [
    // ...
    {provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true}}
  ]
})
export class AppModule {}
```

> [!NOTE]
> Get more details on [Otter Chrome DevTools session](../dev-tools/chrome-devtools.md).

# Package link

[Link to the `@o3r/localization` package](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/localization/README.md).
