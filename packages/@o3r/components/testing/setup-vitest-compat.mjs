/**
 * Vitest compatibility shim — jsdom `textWrap` polyfill.
 *
 * WHY: jsdom does not implement the non-standard CSS `textWrap` property that
 * `src/devkit/highlight/helpers.spec.ts` reads and asserts
 * (`expect(chip.style.textWrap).toBe('no-wrap')`). Define a configurable
 * accessor so that assertion behaves as it did under the previous runner. This
 * is the only shim this package needs.
 */
const stylePrototype = globalThis.CSSStyleDeclaration?.prototype;
if (stylePrototype) {
  const textWrapValue = Symbol('textWrap');
  Object.defineProperty(stylePrototype, 'textWrap', {
    configurable: true,
    get() { return this[textWrapValue] ?? ''; },
    set(value) { this[textWrapValue] = value; }
  });
}
