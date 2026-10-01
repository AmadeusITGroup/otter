# Test runner policy

## Repository-owned tests

Repository-owned unit tests run with Vitest. Each migrated Nx project must have
all three matching signals:

1. a project-level `vitest.config.*` file extending the root Vitest config;
2. a `vitest` target in `project.json`;
3. a `test` target using `nx:noop` with `dependsOn: ["vitest"]`.

Run `yarn lint:test-runner-config` to detect partial migrations or target/config
drift. The check also accepts the existing direct `@nx/vitest:test` target form;
new migrations use the separate `vitest` target plus `test` alias above. During
the incremental migration, Jest-only projects remain valid until their package
is migrated.

## Retained Jest boundaries

Jest remains supported and must not be converted for:

- integration tests (`*.it.spec.ts`) and their `test-int` targets;
- schematic and builder test harnesses (`schematics/**/*.spec.ts`,
  `builders/**/*.spec.ts`) through retained `test-schematics` Jest targets;
- schematic and generator templates that emit Jest configuration;
- user-facing Fixtures, including `@o3r/testing/src/core/**` and library
  `**/src/fixtures/**`;
- the published `@o3r/test-helpers` `getJest*` configuration API.

A migrated project's Vitest config must exclude `**/*.it.spec.ts` whenever the
package also contains integration tests.
