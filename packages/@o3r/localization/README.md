<h1 align="center">Otter localization</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/.attachments/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

This module provides a fallback language/translation support and debug tools.

## How to install

```shell
ng add @o3r/localization
```

> **Warning**: this module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Features

- Multiple [locales](https://github.com/angular/angular/tree/master/packages/common/locales) support, switchable at runtime

- RTL text direction support

- Translations loader using specific endpoint (external URL source like CMS for example) or defaulting to local translation bundles in **src/assets/assets-otter/i18n** folder of your application. Bundles input folder can be changed by configuration (via shell option).

- Fallback language. In case some resource key does not exist in language X, the loader tries to fetch translation bundle from the endpoint location in fallback language Y in the first place and ends by loading json bundles from the application (root of dist folder **/** by default) if previous steps have failed (bundles output path in dist folder is also configurable via a shell option).

- Resource keys can be translated from templates (*.html) via a [pipe](https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/core/src/lib/translate.pipe.ts) or [directive](https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/core/src/lib/translate.directive.ts) as well as from typescript (*.ts) via a [service](https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/core/src/lib/translate.service.ts).

- Support for resource keys with parameters

- Custom LocalizationConfiguration can be injected from the application

- MissingTranslationsService - tries to fetch key without context if contextualized key not defined in the bundle

- Intelligent fallback support. For any un-supported language request, localization service fallback to fallback locale map language OR first nearest supported language. More information in the `intelligent fallback` section below.

- Ability to toggle translations on and off to help identify the key corresponding to a translation.

## How to use

We provide in [library](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/localization/src/tools/localization.module.ts) an angular module called **LocalizationModule** which comes with translations loader.

- **In your AppModule** you need to **import** the **LocalizationModule** and **TranslateModule**. The LocalizationModule could be imported calling `forRoot` with a custom configuration **factory** to specify the language of the application. This configuration is of type **LocalizationConfiguration** and describes your endpoint URL, supported locales, list of RTL languages, the language of your application and your fallback language.

```typescript

// index.ts

import { LocalizationModule, translateLoaderProvider } from  "@o3r/localization";

import { TranslateModule } from  "@ngx-translate/core";
...
import {BidiModule} from '@angular/cdk/bidi';
import localeAR from  "@angular/common/locales/ar";
import localeEN from  "@angular/common/locales/en";
import localeFR from  "@angular/common/locales/fr";

...

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
    BidiModule
  ...

  ],

  ...,

  providers: []
})
class AppModule {}

```

If you leave **endPointUrl blank** the loader will try to fetch translation bundles from local src/assets/assets-otter/i18n folder.

You can specify a **language** in the configuration, it will be loaded at the bootstrap time of you application.
A language can be specified asynchronously by using the **LocalizationService.useLanguage** function.

- In case it is not enough to provide your configuration object as explained above, you can also provide a new factory for the localization configuration. You only need to provide a token `LOCALIZATION_CONFIGURATION_TOKEN` with you custom factory and dependencies.

```typescript
// index.ts

import { LOCALIZATION_CONFIGURATION_TOKEN, LocalizationModule, translateLoaderProvider } from  "@o3r/localization";

import {BidiModule} from '@angular/cdk/bidi';
import { TranslateModule } from  "@ngx-translate/core";
...
import localeAR from  "@angular/common/locales/ar";
import localeEN from  "@angular/common/locales/en";
import localeFR from  "@angular/common/locales/fr";


...

registerLocaleData(localeEN, 'en-EN');
registerLocaleData(localeFR, 'fr');
registerLocaleData(localeAR, 'ar');

@NgModule({
  imports: [
  LocalizationModule,
  BidiModule,
  TranslateModule.forRoot({
    loader: translateLoaderProvider,
  }),
  ...
  ],
  ...
  providers: [
    {provide: LOCALIZATION_CONFIGURATION_TOKEN, useFactory: customCreateLocalizationConfiguration, deps: [YourServiceNeededByTheFactory]}
  ]
```

You may also need to setup your http server to accept **CORS** and update **connect-src** property of **csp.json** in your application.

```typescript

// configs/csp.json

{

"connect-src": "http://example.com"

}

```

- If you have your own localization you need to create your translation bundles in json format. Each file is named after a locale and holds corresponding translations. For example if your application is meant to support french, english and canadian french you will have 3 separate files called respectively **en.json**, **fr.json** and **fr-CA.json** (the file name should match the official [locale](https://github.com/angular/angular/tree/master/packages/common/locales) name).

- Place your translation budles either at your dedicated endpoint URL or inside your application's folder **src/assets/assets-otter/i18n**. The format of the bundles is a simple key/value pair object where key is the resource name and value its translation. The key naming convention is component selector followed by `.` (dot character) and any string of your choice.

```typescript

// en.json
{
"o3r-simple-header-pres.motto": "Let's shape the future of travel",
"o3r-simple-header-pres.airline": "My Airline",
"o3r-simple-header-pres.logoAltText": "Brand Logo Text",
"o3r-simple-header-pres.language.en": "English",
"o3r-simple-header-pres.language.fr": "Français",
"o3r-simple-header-pres.language.ar": "اللغة العربية",
"o3r-simple-header-pres.locWithArg": "Hello, {{user}}!"
}
```

- Now we are ready to start using **LocalizationModule** in our components/presenters.

- **Import LocalizationModule** into component module that you want to localize.

```typescript

import {CommonModule} from  '@angular/common';
import {NgModule} from  '@angular/core';
import {LocalizationModule} from  '@o3r/localization';
import {SimpleHeaderPresComponent} from  './simple-header-pres.component';
import {SimpleHeaderPresConfig} from  './simple-header-pres.config';

@NgModule({
  imports: [CommonModule, LocalizationModule],
  declarations: [SimpleHeaderPresComponent],
  exports: [SimpleHeaderPresComponent],
  providers: [SimpleHeaderPresConfig]
})
export  class SimpleHeaderPresModule {}
```

- If you need to **only** translate **text** in your template file, simply use **translate pipe** or **translate directive** with/without parameters in the following way.

```typescript

<!-- using a pipe -->

{{ "o3r-simple-header-pres.motto" | translate }} // => this will output Let's shape the future of travel
<!-- using a directive -->

<div [translate]="o3r-simple-header-pres.locWithArg" [translateParams]="{user: 'otter friend'}"> // => this will output Hello, otter friend!

```

- If you need to display **text** that **with HTML markup** that needs to be interpreted by your browser, you need to use binding as follows:

```typescript

<!-- for resource with HTML markup use binding -->

<span [innerHTML]="'someKeyWithHtml' | translate"></span>

```

As a result "**hello bold**" will be printed inside the span element.

- If you need to display **text** with some **dynamic** elements (resouce with parameters)

```typescript

<!-- dynamic resource -->

{{ "someBagsAdded" | translate:{bags: 5} }} // => will output "You have added 5 bags"

```

### How to localize a date, decimal and currency

Use angular built-in [DatePipe](https://angular.io/api/common/DatePipe), [DecimalPipe](https://angular.io/api/common/DecimalPipe) and [CurrencyPipe](https://angular.io/api/common/CurrencyPipe) and pass it current locale as the last parameter. The locale is read from **this.localizationService.getCurrentLanguage()**. To be able to use translateService, your component container should take benefit of dependency injection to get LocalizationService as parameter of constructor as well.

For example if you want to localize simpleHeader component you will start by injecting TranslateService to the constuctor of simple-header-pres.component.ts
Your component also needs to implement Translatable interface which forces you to declare translations property. This property requires 3 decorators (`@Input() and @Localization(url)`. This will let you override localization keys from template and give some default localization to your component if you don't have your own to start with.

```typescript
import {Component, Input} from  '@angular/core';
import {Localization, LocalizationService, Translatable} from  '@o3r/localization';
import {SimpleHeaderPresTranslation, translations} from  './simple-header-pres.translation';

@Component({
  selector: 'o3r-simple-header-pres',
  styleUrls: ['./simple-header-pres.style.scss'],
  templateUrl: './simple-header-pres.template.html'
})

export  class SimpleHeaderPresComponent implements Translatable<SimpleHeaderPresTranslation>, ... {
  /**
  * Localization of the component
  */
  @Input()
  @Localization('./simple-header-pres.localization.json')
  public translations: SimpleHeaderPresTranslation;


  constructor(
    public localizationService: LocalizationService) {
    this.translations = translations;
  }
  /**
   * Called upon language change to set current language
   * @param  language
   */
  useLanguage(language: string) {
    this.localizationService.useLanguage(language);
  }
}
```

Now we can start using pipes:

```typescript

<p>{{today | date:'fullDate': '': localizationService.getCurrentLanguage()}}</p>

<p>{{1.5487 | number: '': localizationService.getCurrentLanguage()}}</p>

<p>{{1.5487 | currency:'EUR':'symbol':'':localizationService.getCurrentLanguage()}}</p>

```

### How to add custom translations in the container

By default, a container needs to provide an override of translation keys to the presenter:

```typescript
import {MyPresTranslation} from '../presenter/my.translation.ts';

@Component({
  selector: 'o3r-forms-poc-cont',
  templateUrl: './forms-poc-cont.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyContComponent implements FormsPocContContext, Block {

  /**
   * Localization of the component
   */
  @Input()
  public translations: Partial<MyPresTranslation>;

  ...

  public getMyPresContext(overrideContext) {
    return {
      translations,
      inputs: {
        // ...
      }
    };
  }
}
```

A container can have its own translation (for error messages for example). In this case the container become `Translatable` as following:

```typescript
import {MyPresTranslation} from '../presenter/my.translation.ts';
import {MyContTranslation} from '../my.translation.ts';
import {Translatable} from '@o3r/localization';

@Component({
  selector: 'o3r-my-cont',
  templateUrl: './my.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyContComponent implements FormsPocContContext, Translatable<MyContTranslation>, Block {

  /**
   * Localization of the component
   */
  @Input()
  @Localization('./my.localization.json')
  public translations: Partial<MyPresTranslation> & MyContTranslation;

  ...

  public getMyPresContext(overrideContext) {
    return {
      translations,
      inputs: {
        // ...
      }
    };
  }
}
```

### Configure TranslateService in your root component app.component.ts

```typescript

// app.component.ts

import { LocalizationService } from  "@o3r/localization";



// Inject LocalizationService which will take care of configuring TranslateService using LocalizationConfiguration and call configure() method

constructor(private router: Router,
  private localizationService: LocalizationService) {
    this.localizationService.configure();
}

```

### How to add RTL support in my app

- Note:  **TextDirectionDirective** is deprecated. Please refer to **TextDirectionService**.

The **TextDirectionService** has to be injected in `app.component.ts` as follows.

```typescript

<!-- app.component.ts -->

constructor(private textDirectionService: TextDirectionService) {}

  public ngOnInit() {
    this.subscriptions.push(this.textDirectionService.onLangChangeSubscription());
  }

```

### Lazy Compiler for ICU Translation support

To be able to handle a large amount of ICU translations, a lazy compiler is provided in `@o3r/localization` package.

```typescript
// index.ts

import {BidiModule} from '@angular/cdk/bidi';
import {
  LazyMessageFormatConfig,
  LocalizationModule,
  translateLoaderProvider,
  TranslateMessageFormatLazyCompiler 
} from  "@o3r/localization";
import { TranslateModule } from  "@ngx-translate/core";
import { MESSAGE_FORMAT_CONFIG } from 'ngx-translate-messageformat-compiler';

...
import localeAR from  "@angular/common/locales/ar";
import localeEN from  "@angular/common/locales/en";
import localeFR from  "@angular/common/locales/fr";


...

registerLocaleData(localeEN, 'en-EN');
registerLocaleData(localeFR, 'fr');
registerLocaleData(localeAR, 'ar');

@NgModule({
  imports: [
    ...,
    BidiModule,
    LocalizationModule.forRoot({ ... }),
    TranslateModule.forRoot({
      ...
      compiler: {provide: TranslateCompiler, useClass: TranslateMessageFormatLazyCompiler}
    })
  ],
  providers: [
    // Optional configuration :
    {provide: MESSAGE_FORMAT_CONFIG, useValue: {enableCache: false}}
  ]
})
class AppModule {}
```

> **Info:** The token `MESSAGE_FORMAT_CONFIG` implement the `LazyMessageFormatConfig` interface from `@o3r/localization`.
> The full documentation about MessageFormat configuration is available on <https://github.com/lephyrus/ngx-translate-messageformat-compiler>.

### How to localize plural expression

For pluralizations we are using *TranslateMessageFormatCompiler*, comming from [ngx-translate-messageformat-compiler](https://www.npmjs.com/package/ngx-translate-messageformat-compiler) package, which is a compiler for *ngx-translate* that uses *messageformat.js* to compile translations using ICU syntax for handling pluralization and gender.  
[ICU Message Format](http://userguide.icu-project.org/formatparse/messages) is a standardized syntax for dealing with the translation of user-visible strings into various languages that may have different requirements for the correct declension of words (e.g. according to number, gender, case) - or to simplify: pluralization.  
Simple pluralization rules like *0, 1 or other* fits well for English but may not fit for many other languages (eastern Europe languages, asiatic languages) where pluralization rules are much more complex. If this does not fit your requirement we recommend to reformulate your text, so that you do not need to use pluralization. Example: instead of saying 'You have added 2 baggages' you may want to say 'Pieces of baggage: 2' which should be fine for most of languages no matter which number is considered to be plural.

#### Integration with ngx-translate

You need to configure *TranslateModule* so it uses *TranslateMessageFormatCompiler* as compiler. We will use *TranslateMessageFormatLazyCompiler* which is an otter extension of the base compiler. See *Lazy Compiler for ICU Translation support* above chapter for details.

```typescript
// in your app module
import {TranslateCompiler, TranslateModule} from '@ngx-translate/core';
import {TranslateMessageFormatLazyCompiler} from '@o3r/localization';
import {MESSAGE_FORMAT_CONFIG} from 'ngx-translate-messageformat-compiler';
...
@NgModule({
  imports: [
    TranslateModule.forRoot({
      ...
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatLazyCompiler
      }
    }),
  ...
  ],
  providers: [
    ...
    // optional compiler configuration
    {provide: MESSAGE_FORMAT_CONFIG, useValue: {locales: ['ar', 'fr']}}
  ]

```

```typescript
// in localization bundle the key has to be defined
"o3r-list-inline-messages-pres.nbOfErrors": "{count, plural, =0{No errors} one{# error} other{# errors}}"
// where 'count' is the parameter received
```

```typescript
// component html template
...
</span> {{translations.nbOfErrors | translate: {count: countMessages} }}
...
```

The value of *translations.nbOfErrors* is the tranlation key 'o3r-list-inline-messages-pres.nbOfErrors'. The next step translates the key passing some parameters to translate pipe.
**Output**
The output will be

- *No errors* if *countMessages* is 0
- *1 error* if *countMessages* is 1
- *'Value of count messages' errors* if *countMessages* is greater than 1 (ex: 10 Errors)

### How to localize a choice

Sometimes you may want to display a different resource based on some property value which does not resolve to a number.

```typescript
// in localization bundle the key has to be defined
"global.people": "{gender, select, male{He is} female{She is} other{They are}} {how}"
// where 'gender' is the parameter used for choice and 'how' it's a parameter used only for display
```

```typescript
// in component html 
<ul>
  <li>{{ translations.people | translate: { gender: 'female', how: 'influential' } }}</li>
  <li>{{ translations.people | translate: { gender: 'male', how: 'funny' } }}</li>
  <li>{{ translations.people | translate: { how: 'affectionate' } }}</li>
</ul>
```

Note again that *translations.people* matches *global.people* key

**Output**

```
- She is influential  
- He is funny  
- They are affectionate  
```

## Debugging

### Runtime: toggle translation on and off

In order to be able to more easily identify which key corresponds to a given text, the ``LocalizationService`` exposes a function ``toggleShowKeys()`` that can be called in order to deactivate or reactivate the translation mechanism at **runtime**.  
While deactivated, the ``translate`` **pipe** and **directive** will output the translation keys instead of their resolved values.

> **Important**: this mechanism only applies to the pipe and directive exported by Otter's ``LocalizationModule``. The original ones from ``ngx-translate`` do not support it.

First, this mechanism has to be activated via the ``LocalizationConfiguration`` that you can provide in your ``ApplicationModule``.  
This is mainly for performances reason: the way it works is it adds a new subscription to every ``translate`` pipe and directive in order to know when translations are turned on or off.  
Not enabling it allows to avoid all those subscriptions, and should be the baseline for a production environment.

Example:

````typescript
// Application module
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
export class AppModule {
}
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

### Bootstrap: enable debug mode to display ``<key> - <translation>``

You can enable debug mode by setting debugMode property of LocalizationConfiguration (by default the value of debugMode is false)

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
  }),
  ...
})

```

By doing this all your translations will be prefixed by the corresponding localization key. That way you can easily map the text to the key.

Examples:

- [simpleHeader.airline] My Airline

- [simpleHeader.motto] Let's shape the future of travel

## How to properly create keys?

It's always good to stick to some naming conventions.

For components we prefix each key by component selector to ensure cross components keys uniqueness.

For example if your `SimpleHeaderPresComponent` has `o3r-simple-header-pres` selector then your keys may look like

```typescript

{
  "o3r-simple-header-pres.motto": {
    "description": "airline motto phrase",
    "defaultValue": "Let's shape the future of travel"
  },
  "o3r-simple-header-pres.airline": {
    "description": "airline name",
    "defaultValue": "My Airline"
  }
}

```

## Intelligent fallback support

The fallback hierarchy is been added to the localization service which explained in detail below. As the last option, the default fallback language picked as usual.

### Scenario 1: Fallback based on **fallbackLocalesMap**, **supportedLocales** language code

Incase if **fallbackLocalesMap** provided and the targeted translation language is unavailable in supported locales list, The priority goes to **fallbackLocalesMap**, to see if targeted translation language can be mapped with the fallback map configured. The second priority goes to **supportedLocales**, to map targeted translation language to the first closest possible language, the locale can be different. If none match, it will fallback to the **default language**.

**Lets assume:**

```typescript
{
  "supportedLocales": ['en-GB', 'en-US', 'fr-FR', 'ar-AR'],
  "fallbackLocalesMap": {
            'en-CA': 'en-US',
            'fr-CA': 'fr-FR',
            'de-CH': 'ar-AR',
            'de': 'fr-FR',
            'it': 'fr-FR',
            'hi': 'en-GB',
            'zh': 'en-GB'
  },
  "fallbackLanguage": 'ar-AR'
}
```

**Fallback scenario's:**

en-CA **fallbacks to** en-US, as direct mapping available in fallback Locale Map.

de-CH **fallbacks to** ar-AR, as direct mapping available in fallback Locale Map.

de-AT **fallbacks to** fr-FR, as language mapping available in fallback Locale Map.

zh-CN **fallbacks to** en-GB, as language mapping available in fallback Locale Map.

en-AU **fallbacks to** en-GB, as fallback locales mapping unavailable, first nearest language available in supported locales.

fr-BE **fallbacks to** fr-FR, as fallback locales mapping unavailable, first nearest language available in supported locales.

bn-BD **fallbacks to** ar-AR, as it is the default fallback.

### Scenario 2: Fallback based on **supportedLocales** language code

In case if **fallbackLocalesMap** is not provided and the targeted translation language is unavailable is supported locales list, The targeted translation language will be matched with supported locales **language** to find out the first nearest match, the **locale** can be different. If none match, it will fallback to the **default language**.

**Lets assume:**

```typescript
{
  "supportedLocales": ['en-GB', 'fr-FR', 'fr-CA', 'ar-AR'],
  "fallbackLanguage": 'en-GB'
}
```

**Fallback scenario's:**

en-US **fallbacks to** en-GB, as en-GB has the same language with a different region.

fr-BE **fallbacks to** fr-FR, as fr-FR is first in the supported locales list.

it-IT **fallbacks to** en-GB, as it is the default fallback.


## Generators

Otter framework provides a set of code generators based on [angular schematics](https://angular.io/guide/schematics).

| Schematics                     | Description                                                    | How to use                           |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------ |
| add                            | Include Otter localization module in a library / application.  | `ng add @o3r/localization`           |
| localization-to-component      | Add localization architecture to an Otter component            | `ng g localization-to-component`     |
| localization-key-to-component  | Add a localization key to an Otter component                   | `ng g localization-key-to-component` |
