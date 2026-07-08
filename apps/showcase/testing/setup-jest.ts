import './mocks/webcontainer-api.mock';
import './mocks/x-term.mock';
import {
  setupZonelessTestEnv,
} from 'jest-preset-angular/setup-env/zoneless';

// Mock clipboard for ngx-markdown before it's imported
globalThis.ClipboardJS = class {
  constructor() {}
  public on() {}
  public destroy() {}
};

// Mock Monaco editor instance
const mockEditor = {
  setValue: jest.fn(),
  getValue: jest.fn().mockReturnValue(''),
  dispose: jest.fn(),
  onDidChangeModelContent: jest.fn(),
  onDidBlurEditorWidget: jest.fn(),
  getModel: jest.fn(),
  layout: jest.fn()
};

// Mock Monaco editor
globalThis.monaco = {
  editor: {
    create: jest.fn().mockReturnValue(mockEditor),
    defineTheme: jest.fn(),
    registerEditorOpener: jest.fn(),
    getModels: jest.fn().mockReturnValue([])
  },
  register: jest.fn(),
  typescript: {
    typescriptDefaults: {
      setCompilerOptions: jest.fn(),
      getCompilerOptions: jest.fn().mockReturnValue({})
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

setupZonelessTestEnv();
