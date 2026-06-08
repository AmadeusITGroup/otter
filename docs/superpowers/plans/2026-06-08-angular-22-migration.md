# Angular 22 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the o3r monorepo from Angular 21.2.x to Angular 22.0.0 with TypeScript 6.0 and full signal/standalone modernization.

**Architecture:** Sequential migration — bump versions first to get a compiling baseline, then run official Angular migration schematics, then manual modernization pass for NgModules and remaining decorator APIs.

**Tech Stack:** Angular 22, TypeScript 6.0, Nx 22.7, NgRx 21.1 (peer override), Yarn 4.14.1 (PnP)

---

## File Structure

Key files that will be modified across all tasks:

| File | Responsibility |
|---|---|
| `package.json` | Root dependencies, resolutions, engines |
| `tsconfig.base.json` | TypeScript compiler options |
| `tools/renovate/group/angular.json` | Renovate grouping rules |
| `apps/showcase/src/app/app-module.ts` | Main showcase app NgModule (to be converted) |
| `apps/showcase/src/app/app-routing-module.ts` | Routing module (to be converted) |
| `packages/@o3r/*/src/**/*-module.ts` | Library NgModules (to be deprecated) |
| `packages/@o3r/*/src/**/*.ts` | Component/directive files with decorator APIs |

---

## Task 1: Bump Angular Core Packages to v22

**Files:**
- Modify: `package.json` (root dependencies)

- [ ] **Step 1: Update Angular framework packages in package.json**

Change these versions in `package.json` under `dependencies`:

```json
"@angular/animations": "~22.0.0",
"@angular/build": "~22.0.0",
"@angular/cdk": "~22.0.0",
"@angular/cli": "~22.0.0",
"@angular/common": "~22.0.0",
"@angular/compiler": "~22.0.0",
"@angular/compiler-cli": "~22.0.0",
"@angular/core": "~22.0.0",
"@angular/forms": "~22.0.0",
"@angular/localize": "~22.0.0",
"@angular/platform-browser": "~22.0.0",
"@angular/platform-browser-dynamic": "~22.0.0",
"@angular/router": "~22.0.0"
```

- [ ] **Step 2: Update Angular devkit and schematics packages**

```json
"@angular-devkit/build-angular": "~22.0.0",
"@angular-devkit/core": "~22.0.0",
"@angular-devkit/schematics": "~22.0.0",
"@schematics/angular": "~22.0.0"
```

- [ ] **Step 3: Update the `@angular-devkit/architect` resolution**

The resolution currently pins `"@angular-devkit/architect": "0.2102.13"`. Update to the Angular 22 equivalent:

```json
"@angular-devkit/architect": "0.2200.0"
```

Note: Angular devkit architect uses a `0.MMNN.patch` versioning scheme where MM=major, NN=minor.

- [ ] **Step 4: Update `@angular/build` undici resolution**

Change:
```json
"@angular/build@21.2.3/undici": "~7.24.0"
```
To:
```json
"@angular/build@22.0.0/undici": "~7.24.0"
```

- [ ] **Step 5: Update angular-eslint**

```json
"angular-eslint": "~22.0.0"
```

- [ ] **Step 6: Update ng-packagr**

```json
"ng-packagr": "~22.0.0"
```

- [ ] **Step 7: Commit**

```bash
git add package.json
git commit -m "chore(deps): bump Angular packages to v22.0.0"
```

---

## Task 2: Bump TypeScript to v6.0

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.base.json`

- [ ] **Step 1: Update TypeScript version in package.json**

```json
"typescript": "~6.0.3"
```

- [ ] **Step 2: Update the `typescript-json-schema/typescript` resolution**

Check if this resolution needs updating. The current resolution is:
```json
"typescript-json-schema/typescript": ...
```
This forces typescript-json-schema to use our TypeScript version. Update it to match:
```json
"typescript-json-schema/typescript": "~6.0.3"
```

- [ ] **Step 3: Review tsconfig.base.json for TypeScript 6.0 compatibility**

TypeScript 6.0 may deprecate or change behavior of:
- `experimentalDecorators` (TC39 decorators are now stable in TS 6.0)
- `emitDecoratorMetadata` (may be removed or unsupported)
- `useDefineForClassFields` (default changed)

Check if Angular 22 still needs `experimentalDecorators: true` or has moved to TC39 decorators. If Angular 22 uses TC39 decorators natively, remove both `experimentalDecorators` and `emitDecoratorMetadata` from `tsconfig.base.json`.

If Angular 22 still requires legacy decorators, keep them.

Run: `npx tsc --version` to verify TypeScript 6.0 is active after install.

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.base.json
git commit -m "chore(deps): bump TypeScript to v6.0.3"
```

---

## Task 3: Add NgRx Peer Dependency Overrides

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add NgRx peer dependency resolutions**

NgRx 21.1.0 declares `"@angular/core": "^21.0.0"` as a peer dependency. Since no Angular 22-compatible NgRx exists yet, add overrides to the `resolutions` field in `package.json`:

```json
"@ngrx/store/@angular/core": ">=21.0.0",
"@ngrx/effects/@angular/core": ">=21.0.0",
"@ngrx/entity/@angular/core": ">=21.0.0",
"@ngrx/router-store/@angular/core": ">=21.0.0",
"@ngrx/store-devtools/@angular/core": ">=21.0.0"
```

Add these entries to the existing `resolutions` object.

- [ ] **Step 2: Add jest-preset-angular peer override**

`jest-preset-angular@16.1.5` declares `"@angular/core": ">=19.0.0 <22.0.0"`. Override:

```json
"jest-preset-angular/@angular/core": ">=19.0.0",
"jest-preset-angular/@angular/compiler-cli": ">=19.0.0",
"jest-preset-angular/@angular/platform-browser": ">=19.0.0",
"jest-preset-angular/@angular/platform-browser-dynamic": ">=19.0.0"
```

- [ ] **Step 3: Add third-party library peer overrides**

These libraries don't yet support Angular 22:
- `@ng-bootstrap/ng-bootstrap@20.0.0` — peers `@angular/core: ^21.0.0`
- `ngx-markdown@21.3.0` — peers `@angular/core: ^21.0.0`
- `ngx-monaco-editor-v2@21.1.4` — peers `@angular/core: ^21.1.4`

Add overrides:
```json
"@ng-bootstrap/ng-bootstrap/@angular/core": ">=21.0.0",
"@ng-bootstrap/ng-bootstrap/@angular/common": ">=21.0.0",
"@ng-bootstrap/ng-bootstrap/@angular/forms": ">=21.0.0",
"@ng-bootstrap/ng-bootstrap/@angular/localize": ">=21.0.0",
"ngx-markdown/@angular/core": ">=21.0.0",
"ngx-markdown/@angular/common": ">=21.0.0",
"ngx-markdown/@angular/platform-browser": ">=21.0.0",
"ngx-monaco-editor-v2/@angular/core": ">=21.0.0",
"ngx-monaco-editor-v2/@angular/common": ">=21.0.0"
```

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore(deps): add peer dependency overrides for Angular 22 compat"
```

---

## Task 4: Install Dependencies and Fix Resolution Errors

**Files:**
- Modify: `package.json` (if resolution adjustments needed)
- Modify: `yarn.lock` (regenerated)

- [ ] **Step 1: Run yarn install**

```bash
yarn install
```

If there are resolution errors, review the error messages. Common fixes:
- Missing resolutions for transitive peer deps → add more resolution entries
- Version conflicts → adjust resolution ranges

- [ ] **Step 2: Verify installation succeeded**

```bash
yarn why @angular/core
```

Expected: Shows `@angular/core@22.0.0` resolved.

- [ ] **Step 3: Commit lock file**

```bash
git add yarn.lock package.json
git commit -m "chore(deps): regenerate yarn.lock for Angular 22"
```

---

## Task 5: Fix TypeScript 6.0 Compilation Errors

**Files:**
- Modify: Various `.ts` files across the monorepo (as needed)
- Modify: `tsconfig.base.json` (if compiler option changes needed)

- [ ] **Step 1: Run type-check across all packages**

```bash
yarn nx run-many --target=build --skip-nx-cache 2>&1 | head -200
```

If errors are too numerous for a single build, try one package at a time:
```bash
yarn nx build @o3r/core --skip-nx-cache 2>&1 | head -50
```

- [ ] **Step 2: Categorize errors**

Common TypeScript 6.0 breaking changes to look for:
- Stricter type narrowing in control flow
- Changes to `any` inference in certain positions
- Decorator metadata changes (if `emitDecoratorMetadata` removed)
- Module resolution behavior changes

Group errors by category and fix systematically.

- [ ] **Step 3: Fix systematic errors**

Apply fixes across the codebase. For each category:
- If it's a type annotation issue → fix the type
- If it's a decorator-related issue → may need tsconfig adjustment
- If it's a module resolution issue → update imports or tsconfig paths

- [ ] **Step 4: Verify full build passes**

```bash
yarn build
```

Expected: All packages compile successfully.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: resolve TypeScript 6.0 compilation errors"
```

---

## Task 6: Run Angular Signal Input Migration Schematic

**Files:**
- Modify: All `.ts` files with `@Input()` decorators (automated by schematic)

- [ ] **Step 1: Run the signal input migration**

```bash
npx ng generate @angular/core:signal-input-migration --defaults
```

This converts `@Input()` decorators to `input()` signal function calls.

- [ ] **Step 2: Verify build passes**

```bash
yarn build
```

- [ ] **Step 3: Run tests to check for regressions**

```bash
yarn test
```

- [ ] **Step 4: Review changes in library public APIs**

Check that no library package had its public API type signatures broken:

```bash
git diff --stat | grep "packages/@o3r\|packages/@ama"
```

Verify that exported interfaces/types remain backward-compatible. The signal input migration changes `@Input() foo: string` to `foo = input<string>()` which changes the property type from `string` to `InputSignal<string>`. This IS a breaking change for type-level consumers.

For library packages: if the schematic converted library inputs, consider whether to revert those specific changes and handle them manually in the NgModule deprecation phase (Task 9) to maintain backward compatibility.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: migrate @Input decorators to signal inputs (automated)"
```

---

## Task 7: Run Angular Signal Queries Migration Schematic

**Files:**
- Modify: All `.ts` files with `@ViewChild()`, `@ViewChildren()`, `@ContentChild()`, `@ContentChildren()` decorators

- [ ] **Step 1: Run the signal queries migration**

```bash
npx ng generate @angular/core:signal-queries-migration --defaults
```

- [ ] **Step 2: Verify build passes**

```bash
yarn build
```

- [ ] **Step 3: Run tests**

```bash
yarn test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: migrate @ViewChild/@ContentChild to signal queries (automated)"
```

---

## Task 8: Run Angular Output Migration Schematic

**Files:**
- Modify: All `.ts` files with `@Output()` decorators

- [ ] **Step 1: Run the output migration**

```bash
npx ng generate @angular/core:output-migration --defaults
```

- [ ] **Step 2: Verify build passes**

```bash
yarn build
```

- [ ] **Step 3: Run tests**

```bash
yarn test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: migrate @Output decorators to output() function (automated)"
```

---

## Task 9: Convert Showcase App NgModules to Standalone

**Files:**
- Modify: `apps/showcase/src/app/app-module.ts`
- Modify: `apps/showcase/src/app/app-routing-module.ts`
- Modify: `apps/showcase/src/main.ts` (if bootstrapping changes)

- [ ] **Step 1: Convert AppModule to standalone bootstrapApplication**

The showcase app currently uses `@NgModule` with `bootstrap: [App]`. Convert to standalone bootstrapping.

Replace the content of `apps/showcase/src/main.ts` (or equivalent bootstrap file) to use:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig);
```

Create `apps/showcase/src/app/app.config.ts`:

```typescript
import { ApplicationConfig, isDevMode, provideZonelessChangeDetection, SecurityContext } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app-routes';
// ... remaining imports from current app-module.ts providers array
```

Move all `providers` from `AppModule` into the `appConfig.providers` array. Move all `imports` that are module-with-providers (like `StoreModule.forRoot()`) to their standalone provider equivalents (`provideStore()`, `provideEffects()`, etc.).

- [ ] **Step 2: Convert AppRoutingModule to route config**

Extract the routes from `AppRoutingModule` into a standalone `app-routes.ts` file and use `provideRouter(routes)` in the app config.

- [ ] **Step 3: Delete the NgModule files**

Remove:
- `apps/showcase/src/app/app-module.ts`
- `apps/showcase/src/app/app-routing-module.ts`

- [ ] **Step 4: Verify showcase app builds**

```bash
yarn nx build showcase --skip-nx-cache
```

- [ ] **Step 5: Run showcase tests**

```bash
yarn nx test showcase --skip-nx-cache
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(showcase): convert to standalone bootstrapApplication"
```

---

## Task 10: Deprecate Library NgModules

**Files:**
- Modify: All `*-module.ts` files under `packages/@o3r/*/src/`
- Modify: All `*-module.ts` files under `packages/@ama-styling/*/src/`

- [ ] **Step 1: Identify all library NgModule files**

```bash
find packages -name "*-module.ts" -not -path "*/dist/*" -not -path "*/node_modules/*" -not -path "*testing*" -not -path "*mocks*" -not -path "*schematics*" | sort
```

These are the files to deprecate (not remove).

- [ ] **Step 2: Add @deprecated JSDoc to each NgModule class**

For each library NgModule file, add a deprecation notice:

```typescript
/**
 * @deprecated Use standalone imports instead. Import individual components/directives/pipes directly.
 */
@NgModule({
  // ... existing content unchanged
})
export class SomeModule {}
```

- [ ] **Step 3: Ensure standalone exports exist**

For each NgModule, verify that all components/directives/pipes it exports are marked as `standalone: true` in their own decorators. If any are not standalone, add `standalone: true` to their `@Component`/`@Directive`/`@Pipe` decorator.

- [ ] **Step 4: Verify build passes**

```bash
yarn build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(libs): deprecate NgModules in favor of standalone imports"
```

---

## Task 11: Manual Signal Migration Cleanup

**Files:**
- Modify: Any `.ts` files still using `@Input()`, `@Output()`, `@ViewChild()`, `@ContentChild()` decorators that the automated schematics missed

- [ ] **Step 1: Find remaining decorator-based APIs in app code**

```bash
grep -r "@Input()" --include="*.ts" apps/ packages/ | grep -v node_modules | grep -v dist | grep -v ".spec.ts" | grep -v "schematics" | grep -v "__fixtures__"
```

```bash
grep -r "@Output()" --include="*.ts" apps/ packages/ | grep -v node_modules | grep -v dist | grep -v ".spec.ts" | grep -v "schematics" | grep -v "__fixtures__"
```

```bash
grep -r "@ViewChild\|@ContentChild\|@ViewChildren\|@ContentChildren" --include="*.ts" apps/ packages/ | grep -v node_modules | grep -v dist | grep -v ".spec.ts" | grep -v "schematics" | grep -v "__fixtures__"
```

- [ ] **Step 2: Convert remaining decorators to signal APIs**

For each file found:
- `@Input() name: Type` → `name = input<Type>()`
- `@Input({ required: true }) name: Type` → `name = input.required<Type>()`
- `@Output() event = new EventEmitter<Type>()` → `event = output<Type>()`
- `@ViewChild('ref') el: ElementRef` → `el = viewChild<ElementRef>('ref')`
- `@ContentChild(Dir) dir: Dir` → `dir = contentChild(Dir)`

Update any template or consuming code that reads these properties (signal inputs require `.()` to read the value).

- [ ] **Step 3: Verify build passes**

```bash
yarn build
```

- [ ] **Step 4: Run tests**

```bash
yarn test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: manually convert remaining decorator APIs to signals"
```

---

## Task 12: Update Internal Schematics and Generators

**Files:**
- Modify: Template files under `packages/@o3r/core/schematics/`
- Modify: Template files under `packages/@o3r/workspace/schematics/`
- Modify: Any other schematic that scaffolds Angular components

- [ ] **Step 1: Find schematic templates that generate Angular code**

```bash
find packages -path "*/schematics/*" -name "*.ts.template" -o -name "*.ts__tmpl__" | grep -v node_modules | grep -v dist | head -30
```

Also check for hardcoded code generation in `.ts` files:
```bash
grep -r "@Input\|@Output\|NgModule\|standalone.*false" packages/*/schematics/ --include="*.ts" | grep -v node_modules | grep -v dist | grep -v ".spec." | head -20
```

- [ ] **Step 2: Update templates to emit modern patterns**

For each template that generates components/directives:
- Ensure `standalone: true` is default (or omitted if Angular 22 defaults to standalone)
- Use `input()` / `output()` / `viewChild()` instead of decorators
- Remove NgModule generation templates

- [ ] **Step 3: Verify schematics build**

```bash
yarn nx build @o3r/core --skip-nx-cache
yarn nx build @o3r/workspace --skip-nx-cache
```

- [ ] **Step 4: Run schematic tests**

```bash
yarn nx test @o3r/core --skip-nx-cache
yarn nx test @o3r/workspace --skip-nx-cache
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(schematics): update templates to emit Angular 22 patterns"
```

---

## Task 13: Update Renovate Configuration

**Files:**
- Modify: `tools/renovate/group/angular.json`

- [ ] **Step 1: Review and update Renovate angular group**

The file at `tools/renovate/group/angular.json` groups Angular-related packages for Renovate. Verify the package patterns still match all Angular 22 packages. Check if any new packages were added in v22 or if package names changed.

Current patterns should still work:
```json
"/^@angular/",
"/^ng-packagr/",
"/^@schematics/",
"/angular/",
"/^@ngrx/",
"/^zone.js/",
"/^@nrwl/",
"/^@nx/",
"/^nx/"
```

If Angular 22 introduced new packages (check `ng update` output), add them.

- [ ] **Step 2: Update the architect versioning regex**

Current:
```json
{
  "matchPackageNames": ["@angular-devkit/architect"],
  "versioning": "regex:^[~^]?0\\.(?<major>\\d{2})(?<minor>\\d{2})\\.(?<patch>\\d+)$"
}
```

Verify this regex handles `0.2200.x` (Angular 22 architect version). The regex expects 2-digit major/minor: `22` and `00` → `0.2200.x`. This should work.

- [ ] **Step 3: Commit**

```bash
git add tools/renovate/group/angular.json
git commit -m "chore(renovate): update angular group for v22"
```

---

## Task 14: Full Validation Suite

**Files:**
- No new files — validation only

- [ ] **Step 1: Full build**

```bash
yarn build
```

Expected: All packages build successfully.

- [ ] **Step 2: Linting**

```bash
yarn lint
```

Fix any new `angular-eslint` v22 rule violations. Common new rules may include:
- Prefer signal inputs over decorator inputs
- Prefer standalone components

If lint errors are style-only (not bugs), fix them.

- [ ] **Step 3: Unit tests**

```bash
yarn test
```

Expected: All tests pass. If tests fail due to signal API changes (e.g., test was reading `component.input` directly but now needs `component.input()`), fix the test.

- [ ] **Step 4: Integration tests**

```bash
yarn test-int
```

- [ ] **Step 5: E2E tests**

```bash
yarn nx test-e2e showcase --skip-nx-cache
```

- [ ] **Step 6: Fix any remaining failures**

Address test failures categorically:
- Signal-related: update test to call signal (e.g., `fixture.componentInstance.myInput()` instead of `fixture.componentInstance.myInput`)
- NgModule-related: update test module setup to use standalone imports
- TypeScript-related: fix type errors

- [ ] **Step 7: Final commit of all fixes**

```bash
git add -A
git commit -m "fix: resolve test and lint failures after Angular 22 migration"
```

---

## Task 15: Cleanup and Final Verification

**Files:**
- Modify: `package.json` (remove temporary workarounds if possible)

- [ ] **Step 1: Check if NgRx released an Angular 22-compatible version**

```bash
npm view @ngrx/store dist-tags --json
npm view @ngrx/store@latest peerDependencies --json
```

If NgRx now supports Angular 22, bump to the compatible version and remove the peer dependency overrides from `resolutions`.

- [ ] **Step 2: Check jest-preset-angular and other overridden packages**

Similarly check if `jest-preset-angular`, `@ng-bootstrap/ng-bootstrap`, `ngx-markdown`, `ngx-monaco-editor-v2` released Angular 22-compatible versions. Bump and remove overrides where possible.

- [ ] **Step 3: Run final full validation**

```bash
yarn build && yarn lint && yarn test
```

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore(deps): remove temporary peer dependency overrides where resolved"
```

- [ ] **Step 5: Verify CI pipeline configuration**

Check that the CI configuration (GitHub Actions or similar) doesn't hardcode Angular/TypeScript version assumptions. Review `.github/workflows/` for any version-specific settings.

---

## Summary of Commits

| # | Message | Phase |
|---|---|---|
| 1 | `chore(deps): bump Angular packages to v22.0.0` | Phase 1 |
| 2 | `chore(deps): bump TypeScript to v6.0.3` | Phase 1 |
| 3 | `chore(deps): add peer dependency overrides for Angular 22 compat` | Phase 1 |
| 4 | `chore(deps): regenerate yarn.lock for Angular 22` | Phase 1 |
| 5 | `fix: resolve TypeScript 6.0 compilation errors` | Phase 1 |
| 6 | `refactor: migrate @Input decorators to signal inputs (automated)` | Phase 2 |
| 7 | `refactor: migrate @ViewChild/@ContentChild to signal queries (automated)` | Phase 2 |
| 8 | `refactor: migrate @Output decorators to output() function (automated)` | Phase 2 |
| 9 | `refactor(showcase): convert to standalone bootstrapApplication` | Phase 3 |
| 10 | `refactor(libs): deprecate NgModules in favor of standalone imports` | Phase 3 |
| 11 | `refactor: manually convert remaining decorator APIs to signals` | Phase 4 |
| 12 | `refactor(schematics): update templates to emit Angular 22 patterns` | Phase 4 |
| 13 | `chore(renovate): update angular group for v22` | Phase 5 |
| 14 | `fix: resolve test and lint failures after Angular 22 migration` | Phase 5 |
| 15 | `chore(deps): remove temporary peer dependency overrides where resolved` | Phase 5 |
