import {
  readFileSync,
} from 'node:fs';
import Module, {
  createRequire,
} from 'node:module';
import typescript from 'typescript';
import {
  vi,
} from 'vitest';

// Angular's schematic runner loads TypeScript factories through CommonJS.
const require = createRequire(import.meta.url);
require.extensions['.ts'] ||= (module, filename) => {
  const output = typescript.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      esModuleInterop: true,
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022
    },
    fileName: filename
  }).outputText.replace(
    /require\(["']ora["']\)/g,
    '(() => () => ({ fail() {}, start() { return this; }, stop() {}, succeed() {} }))()'
  );
  module._compile(output, filename);
};

// Angular DevKit's CJS task executor imports the ESM-only ora package. Tests do
// not render spinners, so intercept that one CJS request.
const originalLoad = Reflect.get(Module, '_load');
Reflect.set(Module, '_load', function loadWithTestCompatibility(request, ...args) {
  if (request === 'ora') {
    return () => ({ fail() {}, start() { return this; }, stop() {}, succeed() {} });
  }
  return Reflect.apply(originalLoad, this, [request, ...args]);
});

// Preserve Jest-oriented user Fixtures and shared helpers while repository
// tests execute under Vitest.
Object.defineProperty(globalThis, 'jest', {
  configurable: true,
  value: vi
});

// jsdom does not retain the non-standard textWrap property used by existing tests.
const stylePrototype = globalThis.CSSStyleDeclaration?.prototype;
if (stylePrototype) {
  const textWrapValue = Symbol('textWrap');
  Object.defineProperty(stylePrototype, 'textWrap', {
    configurable: true,
    get() { return this[textWrapValue] ?? ''; },
    set(value) { this[textWrapValue] = value; }
  });
}
