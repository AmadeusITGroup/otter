import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { mockTranslationModules } from '@o3r/testing/localization';
import { OtterInspectorService } from './otter-inspector.service';

const mockElement = {
  appendChild: jest.fn(),
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
    const headAppendChild = jest.spyOn(document.head, 'appendChild').mockImplementation(() => mockElement);
    const bodyAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement);
    service.prepareInspector();

    expect(createElement).toHaveBeenCalledTimes(3);
    expect(createElement).toHaveBeenCalledWith('div');
    expect(createElement).toHaveBeenCalledWith('style');
    expect(createElement).toHaveBeenCalledWith('span');
    expect(headAppendChild).toHaveBeenCalled();
    expect(bodyAppendChild).toHaveBeenCalled();
  });

  it('should not re-prepare the DOM', () => {
    const createElement = jest.spyOn(document, 'createElement').mockImplementation(() => mockElement);
    const headAppendChild = jest.spyOn(document.head, 'appendChild').mockImplementation(() => mockElement);
    const bodyAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement);
    service.prepareInspector();

    createElement.mockClear();
    headAppendChild.mockClear();
    bodyAppendChild.mockClear();
    service.prepareInspector();

    expect(createElement).not.toHaveBeenCalled();
    expect(headAppendChild).not.toHaveBeenCalled();
    expect(bodyAppendChild).not.toHaveBeenCalled();
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
