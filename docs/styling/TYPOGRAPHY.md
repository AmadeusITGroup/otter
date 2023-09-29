# Typography

For more information about the typography, you refer to the [Angular Material documentation](https://material.angular.io/guide/typography)

## How to use Material Design Typography in components

### Global rule

Since `Otter v3`, the components are built independently of the application, so it is not possible to provide SASS variable (defined in the application) before the build of the components.
We should use css classes to apply Material Design typographies.

Material design provides a set of CSS classes to apply the typography according to the function of the element.
Example :

```html
<div class="mat-headline">My Header</div>
```

By default, the typography design will be applied to all the Material Angular and the element containing the `.mat-typography` CSS class.
Example:

```html
<div class="mat-typography">
  <h1>My Header</h1>
<div>
<!-- equivalent to -->
<div class="mat-headline">My Header</div>
```

### Usage in a component

A component developer would have 3 choices to apply a typography to its component:

#### 1. Using **Material Classes**

This will specify that your HTML tag has a specific functionality.
Example:

```html
<div class="mat-typography">
  <h1>This is a Header</h1>
</div>
...
<div class="mat-headline">This is another Header</div>
...
<h2 class="mat-headline">Still a Header</h2>
```

#### 2. Using **Material Classes** with specific **constraints**

This is used to specify that the HTML tag has a specific functionality but with a specific constraint only for this component:

```html

<h2 class="mat-headline close-to-text">A Header</h2>
<p>Some text</p>
```

```scss
my-component {
  h2.close-to-text {
    margin-bottom: 0;
  }
}
```

> **WARNING**: This override should be done *only* if the constraints make sense for the structure of the component, not because it is part of the global design strategy.

#### 3. Not using **Material Design** *(not recommended)*

You can actually import your own typography in your component. This is not recommended because it will lead to an additional font download only for 1 component (even if it is not used by it after a customization).
Example:

```html
<h1 class="header">A custom Header</h1>
```

```css
@font-face {
  font-family: 'custom';
  src: url('my/font/custom.ttf');
  font-weight: 300;
  font-style: normal;
}

my-component {
  .header {
    font: 'custom'
  }
}
```

### Usage in the **custom**/**bespoke** application

The customization of the typography should be done in a **custom** or **bespoke** application.

A custom typography can be specified via the Angular Material Design mixin:

```scss
@use '@angular/material' as mat;
@use '@o3r/styling' as o3r;

$custom-typography: mat.define-typography-config(
  $font-family: 'Roboto, monospace',
  $headline-5: mat.define-typography-level(32px, 48px, 700),
  $body-1: mat.define-typography-level(16px, 24px, 500)
);

@include mat.core($custom-typography);
// or: @include mat.all-component-typographies($custom-typography);
```

Once added the typography scss will look like this.

```scss
@include o3r.apply-typography($custom-typography);

@include mat.core($custom-typography);
@include mat.all-component-typographies($custom-typography);
```

---

The Material Design mixins generate the material CSS classes which are coming with additional styling, these can be customized at application level:

```scss
  .mat-h1, .mat-headline-5, .mat-typography h1 {
    margin: 0;
  }

  .mat-h2, .mat-headline-6, .mat-typography h2 {
    margin: 0;
  }

  .mat-h3, .mat-subtitle-2, .mat-typography h3 {
    margin: 0;
  }

  .mat-h4, .mat-subtitle-1, .mat-typography h4 {
    margin: 0;
  }

  .mat-h5, .mat-typography h5 {
    margin: 0;
  }

  .mat-h6, .mat-typography h6 {
    margin: 0;
  }

  .mat-body-strong, .mat-body-2 {
    margin: 0;
  }

  .mat-body, .mat-body-1, .mat-typography {
    margin: 0;
  }

  .mat-small, .mat-caption {
    margin: 0;
  }

  .mat-headline-4, .mat-typography .mat-headline-4 {
    margin: 0;
  }

  .mat-headline-3, .mat-typography .mat-headline-3 {
    margin: 0;
  }

  .mat-headline-2, .mat-typography .mat-headline-2 {
    margin: 0;
  }

  .mat-headline-1, .mat-typography .mat-headline-1 {
    margin: 0;
  }
```

> **Information**: The full list is available on [Typography helpers](https://github.com/angular/components/blob/main/src/material/core/typography/_typography.scss).

---

In the case a design requires to apply a typography to a component's HTML tag that has **not been defined with typography class**, or if the typography **does not have a functional meaning**, a CSS override should be done at **custom** or **bespoke** application level.
Example:

```scss
@use '@angular/material' as mat;

$typography: mat.define-typography-config(...);

@include mat.core($typography);

...

my-component {
  p.with-title-typo {
    @include mat.typography-level($config, title);
  }
}

```
