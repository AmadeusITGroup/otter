# About 

Allows the override of the CSS of each component of the library(ies) from the application. 

> You should use the component style override only if the SCSS variables already defined do not fit your customization's needs.

### Component style override

To override the style for components you can define component override files, which will be imported by your app level styling file.

Here is an example of how your files architecture could look:
> **component-styling-override.scss**\
> **component-variables-override.scss**\
> **app-styling.scss**: import component-styling-override.scss, component-variables-override.scss \
...
>> **component**
>>> **presenter**
>>>> **my-component-pres.component.ts**: styleUrls='my-component-pres.style.scss'\
>>>> **my-component-pres.style.scss**: component style - import style.theme.scss\
>>>> **my-component-pres.style.theme.scss**: variables - import app-styling.scss\
>>>> ...
