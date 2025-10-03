import {
  applyInitialTheme,
  applyTheme,
  downloadApplicationThemeCss,
  getStyle,
  THEME_URL_SUFFIX,
} from './theme-helpers';

describe('theme helpers', () => {
  beforeAll(() => {
    // Mock fetch for getStyle
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('mocked css content')
      })
    );

    global.Request = jest.fn();

    class CSSStyleSheetMock {
      public cssRules: { cssText: string }[] = [];
      public replaceSync(cssText: string) {
        this.cssRules[0] = { cssText };
      }
    }

    global.CSSStyleSheet = CSSStyleSheetMock as any;
  });

  describe('getStyle', () => {
    it('should fetch and return css content', async () => {
      const cssPath = 'mockPath';
      const cssContent = await getStyle(cssPath);
      expect(cssContent).toBe('mocked css content');
    });

    it('should return empty string on fetch failure', async () => {
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.reject(new Error('fetch failed')));
      const cssPath = 'mockPath';
      const cssContent = await getStyle(cssPath);
      expect(cssContent).toBe('');
    });

    it('should catch and log a warning in case of fetch failure', async () => {
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.reject(new Error('fetch failed')));
      const cssPath = 'mockPath';
      const warnMock = jest.fn();
      const cssContent = await getStyle(cssPath, { logger: { warn: warnMock } as any });
      expect(cssContent).toBe('');
      expect(warnMock).toHaveBeenCalledWith('Failed to download style from: mockPath with error: Error: fetch failed');
    });
  });

  describe('applyTheme', () => {
    const themeValue = 'body { background-color: red; }';
    it('should apply given CSS theme', () => {
      applyTheme(themeValue);
      expect(document.adoptedStyleSheets.length).toBe(1);
      expect(document.adoptedStyleSheets[0].cssRules[0].cssText).toBe(themeValue);
    });

    it('should remove existing stylesheets if themeValue is undefined', () => {
      applyTheme(themeValue);
      applyTheme(undefined);
      expect(document.adoptedStyleSheets.length).toBe(0);
    });

    it('should append to existing stylesheets if cleanPrevious is false', () => {
      const themeValue2 = 'body { background-color: blue; }';
      applyTheme(themeValue);
      applyTheme(themeValue2, false);
      expect(document.adoptedStyleSheets.length).toBe(2);
      expect(document.adoptedStyleSheets[0].cssRules[0].cssText).toBe(themeValue);
      expect(document.adoptedStyleSheets[1].cssRules[0].cssText).toBe(themeValue2);
    });
  });

  describe('applyInitialTheme', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Title', '/?theme=mockTheme');
    });

    it('should apply initial theme based on URL parameter', async () => {
      await applyInitialTheme();
      expect(document.adoptedStyleSheets.length).toBe(1);
      expect(document.adoptedStyleSheets[0].cssRules[0].cssText).toBe('mocked css content');
    });

    it('should compute the css url to call', async () => {
      const getStyleSpy = jest.spyOn(global, 'Request');
      await applyInitialTheme();
      expect(getStyleSpy).toHaveBeenCalledWith('mockTheme-theme.css');
      getStyleSpy.mockReset();
    });

    it('should do nothing if no query param', async () => {
      window.history.pushState({}, 'No query param', '/');
      const getStyleSpy = jest.spyOn(global, 'Request');
      await applyInitialTheme();
      expect(getStyleSpy).not.toHaveBeenCalled();
      getStyleSpy.mockReset();
    });

    it('should do nothing if no theme query param', async () => {
      window.history.pushState({}, 'No theme query param', '/param=mock-theme.css');
      const getStyleSpy = jest.spyOn(global, 'Request');
      await applyInitialTheme();
      expect(getStyleSpy).not.toHaveBeenCalled();
      getStyleSpy.mockReset();
    });

    it('should not change the css url if it s well formatted', async () => {
      window.history.pushState({}, 'Theme Url already formatted', '/?theme=mock-theme.css');
      const getStyleSpy = jest.spyOn(global, 'Request');
      await applyInitialTheme();
      expect(getStyleSpy).toHaveBeenCalledWith('mock-theme.css');
      getStyleSpy.mockReset();
    });

    it('should handle referrer URL for theme application', async () => {
      const getStyleSpy = jest.spyOn(global, 'Request');
      Object.defineProperty(document, 'referrer', {
        value: 'http://example.com',
        writable: true
      });
      await applyInitialTheme();
      expect(getStyleSpy).toHaveBeenCalledTimes(2);
      expect(document.adoptedStyleSheets.length).toBe(2);
    });
  });

  describe('downloadApplicationThemeCss', () => {
    it('should add suffix to CSS file', async () => {
      await downloadApplicationThemeCss('test-css-file');
      expect(global.Request).toHaveBeenCalledWith(`test-css-file${THEME_URL_SUFFIX}`);
    });

    it('should keep suffix when specified', async () => {
      await downloadApplicationThemeCss('test-css-file.css');
      expect(global.Request).toHaveBeenCalledWith(`test-css-file.css`);
    });
  });
});
