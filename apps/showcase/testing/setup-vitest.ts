import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import {
  ReadableStream,
  TransformStream,
  WritableStream,
} from 'node:stream/web';
import {
  setupTestBed,
} from '@analogjs/vitest-angular/setup-testbed';

import './mocks/webcontainer-api.mock';
import './mocks/x-term.mock';

// The jsdom test environment does not expose the WHATWG Streams globals that the
// WebContainer API mock (and the code under test) rely on. Polyfill them from
// Node's `node:stream/web` before the mocks that use them are imported.
globalThis.WritableStream ??= WritableStream as unknown as typeof globalThis.WritableStream;
globalThis.ReadableStream ??= ReadableStream as unknown as typeof globalThis.ReadableStream;
globalThis.TransformStream ??= TransformStream as unknown as typeof globalThis.TransformStream;

// jsdom's `window.performance` does not implement the User Timing API (`mark`/`measure`).
// The rules engine calls them when a performance object is available, so provide no-op
// implementations to keep the environment consistent with a real browser.
if (typeof globalThis.performance !== 'undefined') {
  if (typeof globalThis.performance.mark !== 'function') {
    globalThis.performance.mark = (() => undefined) as typeof globalThis.performance.mark;
  }
  if (typeof globalThis.performance.measure !== 'function') {
    globalThis.performance.measure = (() => undefined) as typeof globalThis.performance.measure;
  }
}

// Mock clipboard for ngx-markdown before it's imported
globalThis.ClipboardJS = class {
  constructor() {}
  public on() {}
  public destroy() {}
};

// Mock Monaco editor instance
const mockEditor = {
  setValue: vi.fn(),
  getValue: vi.fn().mockReturnValue(''),
  dispose: vi.fn(),
  onDidChangeModelContent: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  onDidBlurEditorWidget: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  getModel: vi.fn(),
  layout: vi.fn()
};

// Mock Monaco editor
globalThis.monaco = {
  editor: {
    create: vi.fn().mockReturnValue(mockEditor),
    defineTheme: vi.fn(),
    registerEditorOpener: vi.fn(),
    getModels: vi.fn().mockReturnValue([])
  },
  register: vi.fn(),
  typescript: {
    typescriptDefaults: {
      setCompilerOptions: vi.fn(),
      getCompilerOptions: vi.fn().mockReturnValue({})
    },
    ScriptTarget: {
      Latest: 99
    },
    ModuleKind: {
      ESNext: 99
    },
    ModuleResolutionKind: {
      NodeJs: 2
    },
    JsxEmit: {
      React: 2
    }
  }
};

setupTestBed();
