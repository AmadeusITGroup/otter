# Placeholders

## Localization
When a placeholder content is created using the CMS, it provides the default language in assets folder: <em>placeholders/my-placeholder-content-name/master.json</em>
Then for each new locale that you want to support, you will have to create the associated placeholder that will be automatically added to <em>placeholders/my-placeholder-content-name/[LANG]/name.json.</em>

For more information about experience fragments, please check: [Experience fragment](https://dev.azure.com/AmadeusDigitalAirline/DES%20Platform/_wiki/wikis/DES%20Documentation/1964/Experience-Fragments-in-DES).

The dynamic part of the URL is replaced by the locale, and each locale change triggers a new call that will retrieve the associated localized template.


## Format of the placeholder file

The placeholder file that will be sent by the CMS is a JSON file that contains both the HTML template and the variables that will be replaced.

example:
```json
{
  "vars": {
    "myRelPath": {
      "type": "relativeUrl",
      "value": "assets-demo-app/img/logo/logo-positive.png"
    },
    "pageUrl": {
      "type": "fact",
      "value": "pageUrl"
    }
  },
  "template": "<div>Placeholder from the library, only default language pageUrl=<%= pageUrl %></div><img src=\"<%= myRelPath %>\">"
}
```

As of today, three different types of variables are supported:
* `relativeUrl`: Path to a resource from the dynamicContent (more info at [Dynamic Content](../../dynamic-content/DYNAMIC_CONTENT.md)), the mediaPath will be used to create the full path
* `fact`: reference to a fact, that will be replaced and plugged to the fact streams (when a fact that is referenced by the template changes, it triggers a refresh)
* `fullUrl`: simple replace will be performed for this one

## Technical details
Placeholders added to the application or library requires a [metadata file](../how-to-use/integration.md), that will be merged in the component metadata file by the cms-adapter and sent to the CMS.
Placeholder contents are created using the admin UI and associated to a placeholder via a rules engine action:
```json
  {
    "elementType": "ACTION",
    "actionType": "UPDATE_PLACEHOLDER",
    "value": "assets/placeholders/[LANGUAGE]/searchSecondPlaceholder.json",
    "placeholderId": "pl2358lv-2c63-42e1-b450-6aafd91fbae8"
  }
```
The service processes the action, and set the URL of the template in the store. The call to retrieve the associated template is processed, the template rendered and the result is added in the store.
Each change facts referenced in the template will trigger a new render, and each language change will trigger a new call to get the associated template (except if the content is not localized).
