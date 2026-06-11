# Angular 22 Migration Design

## Overview

Migrate the o3r monorepo from Angular 21.2.x to Angular 22.0.0, including TypeScript 6.0 upgrade and full modernization (signal APIs, standalone components, NgModule deprecation in libraries).

## Current State

| Dependency | Current | Target |
|---|---|---|
| @angular/core | ~21.2.4 | ~22.0.0 |
| @angular/cli | ~21.2.0 | ~22.0.0 |
| @angular/cdk | ~21.2.0 | ~22.0.0 |
| @angular-devkit/* | ~21.2.0 | ~22.0.0 |
| @schematics/angular | ~21.2.0 | ~22.0.0 |
| angular-eslint | ~21.4.0 | ~22.0.0 |
| TypeScript | ~5.9.2 | ~6.0.3 |
| NgRx | ~21.1.0 | ~21.1.0 (override peers) |
| Nx | ~22.7.0 | ~22.7.0 (no change) |
| RxJS | ^7.8.1 | ^7.8.1 (no change) |
| Node.js | ^22.17.0 \|\| ^24.0.0 | ^22.17.0 \|\| ^24.0.0 (no change expected) |

## Monorepo Scale

- 85 packages referencing @angular/core
- 6 applications (showcase, chrome-devtools, github-cascading-app, vscode-extension, intellij-extension, palette-generator)
- 73 files still using NgModule
- 272 files already using signal-based APIs (input(), output(), viewChild(), contentChild())
- 71 files using ChangeDetectionStrategy
- 0 files using deprecated HttpClientModule (already migrated)
- No zone.js polyfill imports (already zoneless-ready)

## Constraints

- NgRx 21.1.0 declares `peerDependencies: { "@angular/core": "^21.0.0" }`. No NgRx release supports Angular 22 yet. We will override peer dependencies via Yarn resolutions.
- Angular 22 requires TypeScript >=6.0 <6.1.
- Published library packages (@o3r/*, @ama-sdk/*, @ama-mfe/*, @ama-mcp/*) must not introduce breaking changes for consumers — NgModules will be deprecated, not removed.

## Approach

Sequential `ng update` + manual modernization. Run official schematics first to get a compiling baseline, then layer modernization on top.

## Phase 1: Version Bumps & Compilation

Goal: Get the monorepo compiling on Angular 22 + TypeScript 6.0.

### Steps

1. Run `ng update @angular/core@22 @angular/cli@22 --allow-dirty --force`
2. Bump TypeScript from `~5.9.2` to `~6.0.3`
3. Bump `@angular/cdk` from `~21.2.0` to `~22.0.0`
4. Bump `@angular-devkit/*` packages to 22.x
5. Bump `angular-eslint` from `~21.4.0` to `~22.0.0`
6. Bump `@schematics/angular` to `~22.0.0`
7. Keep NgRx at `~21.1.0` — add Yarn resolutions to override peer dependency checks:
   ```json
   "resolutions": {
     "@ngrx/store/@angular/core": ">=21.0.0",
     "@ngrx/effects/@angular/core": ">=21.0.0",
     "@ngrx/entity/@angular/core": ">=21.0.0",
     "@ngrx/router-store/@angular/core": ">=21.0.0",
     "@ngrx/store-devtools/@angular/core": ">=21.0.0"
   }
   ```
8. Run `yarn install` and fix resolution issues
9. Fix any TypeScript 6.0 compilation errors (type narrowing changes, module resolution)
10. Verify `yarn build` passes for all packages

## Phase 2: Official Migration Schematics

Goal: Apply all Angular 22 automated codemods.

### Steps

1. Run signal input migration: `ng generate @angular/core:signal-input-migration`
2. Run signal queries migration: `ng generate @angular/core:signal-queries-migration`
3. Run output migration: `ng generate @angular/core:output-migration`
4. Run any additional standalone/modernization schematics shipped with Angular 22
5. Verify builds pass after each migration schematic
6. Review generated changes for correctness (especially in library public APIs)

## Phase 3: NgModule Modernization

Goal: Deprecate NgModules in libraries, remove from apps/internal code.

### Apps and internal packages

- Convert remaining NgModules to standalone components/directives/pipes
- Remove module files entirely
- Update imports in consuming files

### Published libraries (@o3r/*, @ama-sdk/*, @ama-mfe/*, @ama-mcp/*)

- Mark existing NgModules with `/** @deprecated Use standalone imports instead */`
- Ensure all components/directives/pipes exported by modules are also independently importable as standalone
- Update library README/documentation to recommend standalone imports
- Do NOT remove the modules — consumers may still depend on them

## Phase 4: Remaining Modernization

Goal: Adopt Angular 22 patterns for any code not covered by schematics.

### Steps

1. Convert remaining decorator-based `@Input()`, `@Output()`, `@ViewChild()`, `@ContentChild()` to signal equivalents (manual pass for cases schematics missed)
2. Review `ChangeDetectionStrategy.OnPush` usage — keep in place (still best practice), but ensure signal-based inputs integrate correctly with OnPush detection
3. Update test files to use new testing utilities if Angular 22 introduces changes
4. Update any internal schematics/generators that scaffold Angular code to emit modern patterns

## Phase 5: Validation & Cleanup

### Steps

1. Full build: `yarn build` (all packages)
2. Linting: `yarn lint` — fix any new angular-eslint 22 rules
3. Unit tests: `yarn test`
4. E2E tests: showcase app Playwright suite
5. Remove temporary workarounds (if NgRx releases a compatible version during migration)
6. Update Renovate configuration (`tools/renovate/group/angular.json`) for the new version ranges
7. Update `engines` in package.json if TypeScript 6.0 requires newer Node

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| NgRx incompatibility at runtime | NgRx 21.1 is unlikely to break at runtime — peer deps are a version gate, not a functional incompatibility. Monitor for runtime errors in tests. |
| TypeScript 6.0 breaking changes | Run full type-check across all 85 packages early. Address systematic issues (e.g., stricter type narrowing) in a single pass. |
| Signal migration breaks library public API | Review all schematic-generated changes in library packages. Ensure exported type signatures remain backward-compatible. |
| Third-party package incompatibility (angular-split, etc.) | angular-split is at v20, may not support Angular 22. Check peer deps and override or find alternatives. |

## Success Criteria

- All packages compile with Angular 22 + TypeScript 6.0
- All existing tests pass
- E2E tests pass
- No runtime regressions in showcase app
- Library NgModules are deprecated with standalone alternatives
- Signal-based APIs used throughout (no remaining decorator-based inputs/outputs in app code)
- CI pipeline passes
