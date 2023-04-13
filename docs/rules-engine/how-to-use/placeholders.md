# Rules engine - Placeholders

## How to integrate

### Inside an application

Import the placeholder module in your component/page module

```typescript
// app.module.ts
...
import {PlaceholderModule} from '@o3r/components';

@NgModule({
  imports: [
    ...
    PlaceholderModule
  ],
...
})
export class SearchModule {}
```

Then add the placeholder in your html with a unique id
```typescript
...
<o3r-placeholder messagePanel id="pl2358lv-2c63-42e1-b450-6aafd91fbae8">Placeholder loading ...</o3r-placeholder>
...
```
The loading message is provided by projection. Feel free to provide a spinner if you need.

Once your placeholder has been added, you will need to manually create the metadata file and add the path to the extract-components property in your angular.json
Metadata file example :
```json
[
  {
    "library": "@scope/app",
    "name": "ExampleComponent",
    "placeholders": [
      {
        "id": "pl2358lv-2c63-42e1-b450-6aafd91fbae8",
        "description": "Example component placeholder from app"
      }
    ]
  }
]
```
And then, in the angular.json :
```json
...
"extract-components": {
  "builder": "@o3r/components:extractor",
  "options": {
    "tsConfig": "./tsconfig.cms.json",
    "libraries": [
      "@scope/components"
    ],
    "placeholdersMetadataFilePath": "placeholders.metadata.manual.json"
  }
},
...

The placeholders will be merged inside the component metadata file that will be sent to the cms.
```

### Inside a library component
Add the module and the placeholder to your html the same way as before but this time you need to create the metadata file in an associated package.
Metadata file example :
```json
[
  {
    "library": "@scope/library",
    "name": "ExamplePresComponent",
    "placeholders": [
      {
        "id": "placeholderIdFromLib-2c63-42e1-b450-6aafd91fbae",
        "description": "ExampleContComponent placeholder"
      }
    ]
  }
]
```
And then in the angular.json :
```json
...
        "extract-components": {
          "builder": "@o3r/components:extractor",
          "options": {
            "tsConfig": "modules/@scope/components/tsconfig.metadata.json",
            "configOutputFile": "modules/@scope/components/dist/component.config.metadata.json",
            "componentOutputFile": "modules/@scope/components/dist/component.class.metadata.json",
            "placeholdersMetadataFilePath": "placeholders.metadata.json"
          }
        },
...
```

## Supported features (check how-it-works section for more details)
* Html limited to angular sanitizer supported behavior
* Urls (relative ones will be processed to add the dynamic-media-path)
* Facts references

### Static localization
The first choice you have when you want to localize your template is the static localization.
You need to create a localized template for each locale and provide the template URL with [LANGUAGE] (ex: assets/placeholders/[LANGUAGE]/myPlaceholder.json)
The rules engine service will handle the replacement of [LANGUAGE] for you, and when you change language a new call will be performed to the new 'translated' URL.

Note that the URL caching mechanism is based on the url NOT 'translated', meaning that if you change from en-GB to fr-FR then you decide to switch back and all the calls will be made again.
This behavior is based on the fact that a real user rarely goes back and forth with the language update.

### Dynamic localization

### Multiple templates in same placeholder
You can use placeholder actions to target the same placeholderId with different template URLs.
It groups the rendered templates in the same placeholder, and you can choose the order by using the `priority` attribute in the action.
If not specified, the priority defaults to 0. Then the higher the number, the higher the priority. The final results are displayed in descending order of priority.
The placeholder component waits for all the calls to be resolved (not pending) to display the content.
The placeholder component ignores a template if the application failed to retrieve it.

## Investigate issues
If the placeholder is not rendered properly, you can perform several check to find out the root cause, simply looking at the store state.

Example :
![store-state.png](../../../.attachments/screenshots/rules-engine-debug/store_state.png)

## Reference css classes from AEM Editor
You need to reference one or several css files from your application in the cms.json :
```json
{
  "assetsFolder": "dist/assets",
  "libraries": [
    { "npmName": "@o3r/styling" }
  ],
  "defaultLanguage": "en-GB",
  "placeholderCssFiles": [
    "dist/assets/placeholders/placeholders.css"
  ]
}
```
Those files will be loaded by the CMS to show the placeholder preview.
Note that you could provide an empty file and update it with the dynamic content mechanism from AEM, to be able to reference the new classes afterwards.
There is just no user-friendly editor available yet.
You can include this file in your application using the style loader service in your app component :
```typescript
this.styleLoader.asyncLoadStyleFromDynamicContent({id: 'placeholders-styling', href: 'assets/rules/placeholders.css'});
```

### How to create placeholders from AEM
For this part, please refer to the Experience Fragments in DES documentation : 
https://dev.azure.com/AmadeusDigitalAirline/DES%20Platform/_wiki/wikis/DES%20Documentation/1964/Experience-Fragments-in-DES

