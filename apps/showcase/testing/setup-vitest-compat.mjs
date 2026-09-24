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
import {
  vi,
} from 'vitest';

Object.defineProperty(globalThis, 'jest', {
  configurable: true,
  value: vi
});
