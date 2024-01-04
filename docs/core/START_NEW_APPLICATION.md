# Get Started

Start a new Otter application.

## Required environment

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com))
  * [GitHub's Guide to Installing
    Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=18.0.0`)
  * This is used to run tests and generate distributable files. We strongly encourage to use an up-to-date LTS version of Node.js to ensure the support of all the Otter packages.
    Each package comes with a minimum Node.js version range defined in the `engine` property of its package.json file.

## Creating a new Otter application

```shell
# Create new application
npm create @o3r my-project
# Or
yarn create @o3r my-project
```

The application will contain the minimum setup to follow the otter recommendations and to activate the features requested
during the installation of the `@o3r/core`.

For instance, if you activated the store, your ``app.module.ts`` shall integrate the ngrx Store implementation:

```typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    //...
    EffectsModule.forRoot([]),
    StoreModule.forRoot(rootReducers, {metaReducers, runtimeChecks}),
    StoreRouterConnectingModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

You will also find recommendations for your application such accessibility configuration like the
[Application Reduced Motion](docs/application/REDUCED_MOTION.md)

It will also update your ``angular.json`` with the feature enabled for your project. This will configure the different generators
to create components and services consistent with your project.

```json
{
  "schematics": {
    "@o3r/core:component": {
      "useOtterTheming": true,
      "useOtterAnalytics": true
    }
  }
}
```

## Adding Material design theming

```shell
# Add material design
npx ng add @angular/material
# ? Choose a prebuilt theme name, or "custom" for a custom theme: Indigo/Pink
# ? Set up HammerJS for gesture recognition? Yes
# ? Set up browser animations for Angular Material? Yes
```

Then uncomment the following lines in the `src/styles.scss` file to apply the Otter theming to Material Design components :

```scss
@include mat.core();
@include mat.all-component-typographies($typography);
@include mat.all-component-themes($mat-theme);
```
