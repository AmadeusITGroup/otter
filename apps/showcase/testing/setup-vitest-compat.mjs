/**
 * Vitest compatibility shim — Jest global alias.
 *
 * WHY: this app's Vitest specs import a published Jest-flavored SDK Fixture
 * (`@o3r-training/showcase-sdk` `*.jest.fixture.ts`, e.g. `PetApiFixture`) that
 * calls `jest.fn()` at construction. Those Fixtures are shipped for downstream
 * Jest consumers and stay on the Jest API by design, so when they run under
 * Vitest the bare `jest` global must resolve. Alias it to Vitest's compatible
 * `vi`. This is the only shim this package needs.
 */
/* eslint-disable import/named -- `vi` is re-exported from an internal chunk that eslint-plugin-import cannot follow */
import {
  vi,
} from 'vitest';
/* eslint-enable import/named */

Object.defineProperty(globalThis, 'jest', {
  configurable: true,
  value: vi
});
