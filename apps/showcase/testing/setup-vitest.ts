import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import {
  setupTestBed,
} from '@analogjs/vitest-angular/setup-testbed';
import './mocks/webcontainer-api.mock';
import './mocks/x-term.mock';

// Mock clipboard for ngx-markdown before it's imported
globalThis.ClipboardJS = class {
  constructor() {}
  on() {}
  destroy() {}
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
