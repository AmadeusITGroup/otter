# Placeholder component

The Otter framework provides a placeholder component mechanism to help integrate dynamic HTML elements (with a basic
rendering system) at a predefined position in the application.

The placeholder component is exposed by the **@o3r/components** package and is working with the NgRX *
*placeholderTemplate** store exposed by the same package.

The component only has 1 input and supports a *content value*.

- The **id** input is required and will determine the unique identification for a specific placeholder component.
- The *content value* (or child nodes), if provided, will be used by the placeholder component as default display when
  no template has been found.

## How it works

Based on the **id** provided to the placeholder component, it will register itself to the event coming from *
*placeholderTemplate** and will display the template corresponding to its ID in the store.

> **note**: it is **strongly encouraged** to use the placeholder mechanism in concert with
> the [Rules Engine](../rules-engine/) following [this documentation](../rules-engine/how-to-use/placeholders.md).

## How to define a placeholder template

The placeholder template is defined in a JSON file following this JSON
Schema [placeholder-template.schema.json](../../packages/@o3r/components/schemas/placeholder-template.schema.json).

Example:

```json
{
  "template": "<p>My fact : <%= myFact %></p>",
  "vars": {
    "myFact ": {
      "value": "myFact ",
      "type": "fact"
    }
  }
}
```

Then the JSON File can be downloaded and dispatched to the store as follows:

```typescript
import { setPlaceholderTemplateEntityFromUrl } from '@o3r/components';

const JsonFileUrl = 'url-to-the-json-file';

store.dispatch(setPlaceholderTemplateEntityFromUrl({
  call: (await fetch(JsonFileUrl)).json(),
  id: 'my-placeholder-template',
  resolvedUrl: JsonFileUrl,
  url: JsonFileUrl
}));
```

## How to integrate a placeholder in the application

The following steps should be followed in the application:

- Importing the `PlaceholderTemplateStoreModule` module in the application `AppModule`.
- Importing the `PlaceholderModule` module in the component using the placeholder in its template.

```typescript
import { PlaceholderModule } from '@o3r/components';

@NgModule({
  imports: [
    ...
      PlaceholderModule
  ],
  ...
})
export class MyComponentModule {
}

@Component({
  selector: 'my-component',
  template: `<p>the placeholder:</p><o3r-placeholder messagePanel id="pl2358lv-2c63-42e1-b450-6aafd91fbae8">Placeholder loading ...</o3r-placeholder>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
}
```

### Static localization

The first choice you have when you want to localize your template is the static localization.
You need to create a localized template for each locale and provide the template URL with `[LANGUAGE]` (
ex: `assets/placeholders/[LANGUAGE]/myPlaceholder.json`)
The rules engine service will handle the replacement of `[LANGUAGE]` for you, and when you change language a new call
will be performed to the new 'translated' URL.

> **Note**: the URL caching mechanism is based on the url NOT 'translated', meaning that if you change from en-GB to
> fr-FR then you decide to switch back and all the calls will be done again.
> This behavior is based on the fact that a real user rarely goes back and forth with the language update.


### Dynamic localization
Your second option is to manage your placeholder in a single template and use the dynamic localization mechanism.

In that use case, you can refer to localization keys in your master placeholder template.
The module will then translate the template based on the localization service and keep it updated after every language
change.  
As your placeholder URL remains the same, it will be updated dynamically without any server call.

#### Implementation

You can activate the dynamic localization feature in your placeholder by following this example:

```json
{
  "vars": {
    "keyToTranslation": {
      "type": "localisation",
      "value": "my-localisation-key"
    }
  },
  "template": "<div class=\"fancy-box\"><%= keyToTranslation %></div>"
}
```

Your key should be described in a placeholder variable where the type will be ``localisation`` and its value
the translation key itself. You can refer to the variable in your template thanks to the variable
key (``keyToTranslation`` in the example above).

**Note**: you should **not** create [LANGUAGE] files for placeholders that use the dynamic localization feature. The
static localization is not compatible with the dynamic localization.

#### ICU and parameter support

Today, the Otter Framework supports the ICU syntax as well as parameters. You only need to bind your parameter with a
fact sharing the same name.

As an example, let's create a counter that will emit every second.
You will first need to design your placeholder referencing the translation key and the facts it is bound to.

Let's consider what this placeholder would look like if it were completely integrated in your angular component

```html
"
<div style=\"border-radius:10%; background:red;\">{{'o3r-increment-key' | translate}}</div>"
```

Then, let's create a new localization key for each of your supported languages:

* en-GB.json

```json
{
  "o3r-increment-key": "{increment, plural, =1 {1 second has} other {{{increment}} seconds have}} elapsed since you opened the page"
}
```

* fr-FR.json

```json
{
  "o3r-increment-key": "Cela fait {increment, plural, =1 {1 seconde}} other {{{increment} secondes} que tu as ouvert cette page"
}
```

Note that the ``o3r-increment-key`` translations take ``increment`` as a parameter. This means you need to create
an ``increment`` fact to fill the value. 
You can follow the [fact creation documentation](../rules-engine/how-to-use/create-custom-fact.md).

```typescript
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FactsService, RulesEngineRunnerService } from '@o3r/rules-engine';
import { interval } from 'rxjs';
import { retrieveUrl } from './fact-factories/index';
import { PageFacts } from './page.facts';

@Injectable()
export class PageFactsService extends FactsService<PageFacts> {

  public facts = {
    pageUrl: this.router.events.pipe(retrieveUrl()),
    // This is for demo app testing only, don't do this in a real application
    increment: interval(2000)
  };

  constructor(rulesEngine: RulesEngineRunnerService, private router: Router) {
    super(rulesEngine);
  }

}
```

Once the translation keys and the referenced fact exist, you can link them to your placeholder.   
See how the original translation pipe has been replaced and how the localization key is bound to the ``increment`` fact:

```json
{
  "vars": {
    "incrementKey": {
      "type": "localisation",
      "value": "o3r-increment-key",
      "vars": [
        "increment"
      ]
    },
    "increment": {
      "type": "fact",
      "value": "increment"
    }
  },
  "template": "<div style=\"border-radius:10%; background:red;\"><%= incrementKey %></div>"
}
```

**Limitations:**
Today you cannot only make a reference to a fact with the same name. You also cannot use json path to resolve your fact.
This means the following is not possible:

``ruleset.json``
```json
{
  "vars": {
    "incrementKey": {
      "type": "localisation",
      "value": "o3r-increment-key",
      "vars": [
        "increment"
      ]
    },
    "unsuported-increment": {
      "type": "fact",
      "value": "incrementFact",
      "path": "$.this.is.a.json.path"
    }
  },
  "template": "<div style=\"border-radius:10%; background:red;\"><%= incrementKey %></div>"
}
```

**General notice**:

Keep in mind that this feature deeply binds functional facts exposed in your application to your translations.
You will need to carefully plan the way you bind your localization key to your facts to avoid messy references.

For example, let's imagine you want a generic counter until specific events.
You will probably want to reuse your placeholder in different pages for different events:

```json
{
  "vars": {
    "titleKey": {
      "type": "localisation",
      "value": "o3r-event-title-key"
    },
    "contentWithCounterKey": {
      "type": "localisation",
      "value": "o3r-event-counter-key",
      "vars": [
        "increment"
      ]
    },
    "increment": {
      "type": "fact",
      "value": "increment"
    }
  },
  "template": "<div style=\"fancy-style: with-many-properties;\"><span style=\"fancy-title-style: nice-properties;\"><%= titleKey %></span><div><%= contentWithCounterKey %></div></div>"
}
```

You might be tempted to use this generic template for all your events but the value of your counter parameter will
depend on the event itself (Easter or next Summer Holidays for example).
This means that ``increment`` might have a different value depending on the context of the page which might be tricky to
maintain and to debug. 
Try to keep it as simple as possible.
