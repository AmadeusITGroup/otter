# Migration Guide: @o3r/localization to @o3r/transloco

## Running the Migration Schematic

First, run the automated migration schematic to handle package updates and basic transformations:

```bash
ng g @o3r/transloco:migration-localization-to-transloco
```

Or using the alias:

```bash
ng g @o3r/transloco:migrate
```

This schematic will:
- Remove `@o3r/localization` from package.json dependencies
- Clean up old message format references (`MESSAGE_FORMAT_CONFIG`, `TranslateMessageFormatLazyCompiler`, `TranslateCompiler`)
- Install `@o3r/transloco` via ng-add (which sets up `provideLocalization()` and `provideTranslocoMessageformat()`)
- Transform import paths from `@o3r/localization` to `@o3r/transloco`
- Transform executors in project configuration files (angular.json, project.json)
- Update testing imports from `@o3r/testing/localization` to `@o3r/testing/transloco`
- Replace `mockTranslationModules` with `provideLocalizationMock` (requires manual provider placement)

After running the schematic, proceed with the manual steps below.

## Manual Steps

### Migrating Test Files

After running the automatic migration schematic, test files require manual updates to convert from module-based mocking to provider-based mocking.

#### Import Path and Function Name

The migration schematic automatically updates:
- Import path: `@o3r/testing/localization` → `@o3r/testing/transloco`
- Function name: `mockTranslationModules` → `provideLocalizationMock`

#### Moving from imports to providers

**Before (module-based):**
```typescript
import { mockTranslationModules } from '@o3r/testing/localization';

TestBed.configureTestingModule({
  imports: [
    ...mockTranslationModules()
  ]
});
```

**After (provider-based):**
```typescript
import { provideLocalizationMock } from '@o3r/testing/transloco';

TestBed.configureTestingModule({
  providers: [
    ...provideLocalizationMock()
  ]
});
```

#### With custom configuration

The function signature remains similar, but now returns providers instead of modules:

**Before:**
```typescript
TestBed.configureTestingModule({
  imports: [
    ...mockTranslationModules(
      { supportedLocales: ['en', 'fr'], language: 'en' },
      { en: { key: 'value' }, fr: { key: 'valeur' } }
    )
  ]
});
```

**After:**
```typescript
TestBed.configureTestingModule({
  providers: [
    ...provideLocalizationMock(
      { supportedLocales: ['en', 'fr'], language: 'en' },
      { en: { key: 'value' }, fr: { key: 'valeur' } }
    )
  ]
});
```

#### Key Differences

- **mockTranslationModules**: Returns `ModuleWithProviders<LocalizationModule>[]` (for imports)
- **provideLocalizationMock**: Returns `(Provider | EnvironmentProviders)[]` (for providers)

This change aligns with Angular's modern standalone and provider-based testing approach.

---

### Migrating Modules to Providers

The `@o3r/transloco` package uses provider functions instead of NgModules, following Angular's modern standalone approach. Module imports need to be converted to providers.

#### LocalizationModule → provideLocalization

**Before (module-based):**
```typescript
import { LocalizationModule } from '@o3r/localization';

@NgModule({
  imports: [
    LocalizationModule.forRoot(() => ({
      language: 'en-US',
      supportedLocales: ['en-US', 'fr-FR']
    }))
  ]
})
export class AppModule {}
```

**After (provider-based):**
```typescript
import { provideLocalization } from '@o3r/transloco';

@NgModule({
  providers: [
    provideLocalization(() => ({
      language: 'en-US',
      supportedLocales: ['en-US', 'fr-FR']
    }))
  ]
})
export class AppModule {}
```

**In standalone applications:**
```typescript
import { provideLocalization } from '@o3r/transloco';

bootstrapApplication(App, {
  providers: [
    provideLocalization({
      language: 'en-US',
      supportedLocales: ['en-US', 'fr-FR']
    })
  ]
});
```

#### LocalizationDevtoolsModule → provideLocalizationDevtools

**Before (module-based):**
```typescript
import { LocalizationDevtoolsModule } from '@o3r/localization';

@NgModule({
  imports: [
    LocalizationDevtoolsModule.instrument({
      isActivatedOnBootstrap: true
    })
  ]
})
export class AppModule {}
```

**After (provider-based):**
```typescript
import { provideLocalizationDevtools } from '@o3r/transloco';

@NgModule({
  providers: [
    provideLocalizationDevtools({
      isActivatedOnBootstrap: true
    })
  ]
})
export class AppModule {}
```

**In standalone applications:**
```typescript
import { provideLocalizationDevtools } from '@o3r/transloco';

bootstrapApplication(App, {
  providers: [
    provideLocalizationDevtools({ isActivatedOnBootstrap: true })
  ]
});
```

**Alternative: Options via injection token**

You can also provide options using the injection token (useful when you need to keep configuration separate):

```typescript
import { 
  provideLocalizationDevtools,
  OTTER_LOCALIZATION_DEVTOOLS_OPTIONS 
} from '@o3r/transloco';

@NgModule({
  providers: [
    { provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: { isActivatedOnBootstrap: true } },
    provideLocalizationDevtools()
  ]
})
export class AppModule {}
```

---

### Migrating TranslateMessageFormatLazyCompiler

> **Note:** The migration schematic automatically handles cleanup of old message format references. The ng-add schematic automatically adds `provideTranslocoMessageformat()`.

The `TranslateMessageFormatLazyCompiler` class is replaced by the `provideTranslocoMessageformat` function from `@jsverse/transloco-messageformat`.

The migration schematic will automatically:
- Detect usage of `TranslateMessageFormatLazyCompiler` or `MESSAGE_FORMAT_CONFIG`
- Remove old imports (`TranslateMessageFormatLazyCompiler`, `TranslateCompiler`, `MESSAGE_FORMAT_CONFIG`)
- Remove old provider configuration for `MESSAGE_FORMAT_CONFIG`

The ng-add schematic (which runs as part of the migration) will automatically add `provideTranslocoMessageformat()` to your providers

**Before (class-based):**
```typescript
import { TranslateMessageFormatLazyCompiler } from '@o3r/localization';
import { TranslateCompiler } from '@ngx-translate/core';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatLazyCompiler
      }
    })
  ]
})
export class AppModule {}
```

**After (provider-based):**
```typescript
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

@NgModule({
  providers: [
    provideTranslocoMessageformat()
  ]
})
export class AppModule {}
```

**In standalone applications:**
```typescript
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

bootstrapApplication(App, {
  providers: [
    provideTranslocoMessageformat()
  ]
});
```

**Note:** The `provideTranslocoMessageformat` function should be added alongside other localization providers. The migration from `@ngx-translate/core` to `@jsverse/transloco` is handled separately by the `@jsverse/transloco-schematics:ngx-migrate` schematic.

---

### Pipe Naming Changes

#### LocalizedDecimalPipe: 'decimal' → 'number'

The `LocalizedDecimalPipe` has been renamed from `decimal` to `number` to align with Angular's naming conventions.

**Before:**
```html
<p>{{ value | decimal:'1.2-2' }}</p>
```

**After:**
```html
<p>{{ value | number:'1.2-2' }}</p>
```

**How to find instances:**

You can search for instances in your HTML templates using:

```bash
# Find all uses of | decimal in templates
grep -r "| decimal" --include="*.html" .
```

**Important:** Angular's built-in `DecimalPipe` also uses the name `decimal`. If your component was importing/providing `LocalizedDecimalPipe` from `@o3r/localization`, those usages need to be updated to `number`. If you were using Angular's native `DecimalPipe`, no change is needed.

To identify which pipe you're using, check your component's imports:
- If you see `LocalizedDecimalPipe` imported from `@o3r/localization` → change to `number`
- If you only see Angular's `DecimalPipe` or no explicit import → leave as `decimal`

---

### Additional Configuration Changes

#### MESSAGE_FORMAT_CONFIG Removal

> **Note:** The migration schematic automatically handles cleanup. This section is provided for reference.

If you were using `MESSAGE_FORMAT_CONFIG` from `@o3r/localization`, it's no longer needed with the new Transloco-based implementation. The migration schematic will automatically remove `MESSAGE_FORMAT_CONFIG` imports and provider configuration. The ng-add schematic (part of migration) will add `provideTranslocoMessageformat()` from `@jsverse/transloco-messageformat`

**Before:**
```typescript
import { MESSAGE_FORMAT_CONFIG } from '@o3r/localization';

@NgModule({
  providers: [
    { provide: MESSAGE_FORMAT_CONFIG, useValue: {} }
  ]
})
export class AppModule {}
```

**After:**
```typescript
// MESSAGE_FORMAT_CONFIG removed by migration schematic
// Message format configuration is now handled by provideTranslocoMessageformat()

@NgModule({
  providers: [
    provideTranslocoMessageformat()
  ]
})
export class AppModule {}
```

The message format configuration is now integrated into the `provideTranslocoMessageformat()` provider function.
