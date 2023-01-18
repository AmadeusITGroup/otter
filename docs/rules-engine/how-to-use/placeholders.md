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
* Localization : for each change a new url will be fetched

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

