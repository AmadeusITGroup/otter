# Get Started
Start a new Otter application.

## Required environment
*  **Git** : [https://gitforwindows.org/](https://gitforwindows.org/)
*  **NodeJs 14.x** : [NodeJS LTS](https://nodejs.org/)
*  **Yarn** : [https://yarnpkg.com/lang/en/](https://yarnpkg.com/)

**Yarn** can be installed directly using NPM:
```bash
# Installing yarn
npm install --global yarn
```

## Creating a new Angular application

```bash
# Create new application
npx -y -p @angular/cli ng new
# ? What name would you like to use for the new workspace and initial project? <application name>
# ? Would you like to add Angular routing? Yes
# ? Which stylesheet format would you like to use? SCSS

```
> **Information**: You can also install and run the `Angular CLI` locally with the following commmands:
> ```bash
> yarn add @angular/cli
> yarn ng new
> ```


## Adding Otter dependency

Add Otter as dependency

```bash
# Setup Otter dependencies
yarn ng add @o3r/core
# ? Activate Otter localization? Yes
# ? Work on Otter with symlinks? No
```

or for NPM users

```bash
npx ng add @o3r/core
```

The application will contain the minimum setup to follow the otter recommendations and to activate the features requested 
during the installation of the @o3r/core. 

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
      "useStorybook": true,
      "useOtterTheming": true,
      "useOtterAnalytics": true
    }
  }
}
```

## Adding Material design theming

```bash
# Add material design
yarn ng add @angular/material
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

