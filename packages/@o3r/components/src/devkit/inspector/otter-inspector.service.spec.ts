import {
  getTestBed,
  TestBed
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import {
  mockTranslationModules
} from '@o3r/testing/localization';
import {
  OtterInspectorService
} from './otter-inspector.service';

const mockElement = {
  append: jest.fn(),
  classList: {
    add: jest.fn()
  }
} as unknown as HTMLElement;

describe('Otter Inspector Service', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: OtterInspectorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [...mockTranslationModules()]
    }).compileComponents();
    service = new OtterInspectorService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should prepare the DOM', () => {
    const createElement = jest.spyOn(document, 'createElement').mockImplementation(() => mockElement);
    const headAppend = jest.spyOn(document.head, 'append').mockImplementation(() => mockElement);
    const bodyAppend = jest.spyOn(document.body, 'append').mockImplementation(() => mockElement);
    service.prepareInspector();

    expect(createElement).toHaveBeenCalledTimes(3);
    expect(createElement).toHaveBeenCalledWith('div');
    expect(createElement).toHaveBeenCalledWith('style');
    expect(createElement).toHaveBeenCalledWith('span');
    expect(headAppend).toHaveBeenCalled();
    expect(bodyAppend).toHaveBeenCalled();
  });

  it('should not re-prepare the DOM', () => {
    const createElement = jest.spyOn(document, 'createElement').mockImplementation(() => mockElement);
    const headAppend = jest.spyOn(document.head, 'append').mockImplementation(() => mockElement);
    const bodyAppend = jest.spyOn(document.body, 'append').mockImplementation(() => mockElement);
    service.prepareInspector();

    createElement.mockClear();
    headAppend.mockClear();
    bodyAppend.mockClear();
    service.prepareInspector();

    expect(createElement).not.toHaveBeenCalled();
    expect(headAppend).not.toHaveBeenCalled();
    expect(bodyAppend).not.toHaveBeenCalled();
  });

  it('should add 3 listeners on window', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener').mockImplementation();
    service.toggleInspector(true);

    expect(addEventListener).toHaveBeenCalledTimes(3);
  });

  it('should remove 3 listeners on window', () => {
    const removeEventListener = jest.spyOn(window, 'removeEventListener').mockImplementation();
    service.toggleInspector(false);

    expect(removeEventListener).toHaveBeenCalledTimes(3);
  });
});
