# Otter: Add localization key to component

Thanks to the Otter VSCode extension, you can extract a localization key from selected text in a component's template. The name and the description of this localization
key will be set by the user when asked by the prompt. This key will be added to the localization file of the component and will replace the text in the template.

## Command

`Otter: Add localization key to component`

[//]: # (TO DO: add example GIF)

## Example

### Before

The HTML template contains text that needs to be translated.

```html
<!-- template file -->
<div>
  <label>This is some sample text.</label>
</div>
```

In order to create a localization key and its description in the localization file of the component:

* Select the wanted text in the template
* Right-click the selection and use the command `Otter: Add localization key to component`
* The extension will ask you the name you would like to set for the key and its description
* The localization key will be added to the localization file of the component and the selected text will be replaced in the template

### After

```html
<!-- template file -->
<div>
  <label>{{ translations.sampleText | o3rTranslate }}</label>
</div>
```

```json5
// localization file
{
  "o3r-sample-component.sampleText": {
    "defaultValue": "This is some sample text.",
    "description": "Description of the sample text."
  }
}
```
