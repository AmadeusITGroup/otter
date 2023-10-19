import { extractStyling, getThemeVariables, getTypeAndValue, setCssVariable } from './styling.helpers';
import { getStyleMetadata, setStyleMetadata } from './metadata-manager';
import { STYLING_PREFIX } from './style-configs.interface';

describe('Styling Metadata setup', () => {
  beforeEach(() => {
    if (typeof window === 'undefined') {
      globalThis.window = {} as any;
    }

    // eslint-disable-next-line no-underscore-dangle
    delete window.__OTTER_STORYBOOK_STYLE_METADATA__;
  });

  it('should register the metadata', () => {
    const mockMetadata = { variables: { test: 'fakeValue' } } as any;
    setStyleMetadata(mockMetadata);

    // eslint-disable-next-line no-underscore-dangle
    expect(window.__OTTER_STORYBOOK_STYLE_METADATA__).toBe(mockMetadata);
  });

  it('should retrieve the metadata', () => {
    const mockMetadata = { variables: { test: 'fakeValue' } } as any;
    // eslint-disable-next-line no-underscore-dangle
    window.__OTTER_STORYBOOK_STYLE_METADATA__ = mockMetadata;

    expect(getStyleMetadata()).toBe(mockMetadata);
  });
});

describe('Styling Helpers', () => {

  beforeEach(() => {
    if (typeof document === 'undefined') {
      globalThis.document = {
        head: {
          appendChild: () => { }
        } as any,
        createElement: () => { },
        getElementById: () => { }
      } as any;
    }
  });

  describe('setCssVariable', () => {
    let createElement: jest.SpyInstance;
    let getElementById: jest.SpyInstance;
    let appendChild: jest.SpyInstance;

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a new style element', () => {
      createElement = jest.spyOn(document, 'createElement').mockReturnValue({} as any);
      getElementById = jest.spyOn(document, 'getElementById').mockReturnValue(null);
      appendChild = jest.spyOn(document.head, 'appendChild').mockReturnValue({} as any);
      setCssVariable('--test-var', 'myValue', 'styleElementId');

      expect(createElement).toHaveBeenCalledTimes(1);
      expect(appendChild).toHaveBeenCalledWith({
        id: 'styleElementId',
        innerHTML: `
:root {
  --test-var: myValue;
}`
      });
    });

    it('should edit an existing variable', () => {
      const element: any = { innerHTML: ':root {  --test-var: oldValue; }' };
      createElement = jest.spyOn(document, 'createElement').mockReturnValue({} as any);
      getElementById = jest.spyOn(document, 'getElementById').mockReturnValue(element);
      appendChild = jest.spyOn(document.head, 'appendChild').mockReturnValue({} as any);
      setCssVariable('--test-var', 'myValue', 'styleElementId');

      expect(createElement).not.toHaveBeenCalled();
      expect(getElementById).toHaveBeenCalledTimes(1);
      expect(element.innerHTML).toMatch('--test-var: myValue;');
    });
  });

  describe('getTypeAndValue', () => {
    it('should return a color editor for color', () => {
      const result = getTypeAndValue({defaultValue: '#000', name: 'test-var'}, { variables: {} });

      expect(result.type).toBe('color');
      expect(result.value).toBe('#000');
    });

    it('should return a text editor for color', () => {
      const result = getTypeAndValue({ defaultValue: '1px solid #000', name: 'test-var' }, { variables: {} });

      expect(result.type).toBe('text');
      expect(result.value).toBe('1px solid #000');
    });
  });

  /* eslint-disable @typescript-eslint/naming-convention */
  describe('extractStyling', () => {
    it('should extract component variable', () => {
      const result = extractStyling('test-component-', { variables: {
        'test-component-example-1': {
          defaultValue: '#000',
          name: 'test-component-example-1'
        },
        'test-component-example-2': {
          defaultValue: '1px solid #000',
          name: 'test-component-example-2'
        }
      }});

      expect(Object.keys(result.argTypes).length).toBe(2);
      expect(Object.keys(result.rawValues).length).toBe(2);

      Object.entries(result.argTypes).forEach(([argName, argType]) =>

        expect(argType.defaultValue).toBe(result.rawValues[argName])
      );
    });

    it('should not extract incorrect variable', () => {
      const result = extractStyling('test-component-', { variables: {
        'test-component-example-1': {
          defaultValue: '#000',
          name: 'test-component-example-1'
        },
        'test-component-example-2': {
          defaultValue: '1px solid #000',
          name: 'test-component-example-2'
        },
        'other-component-example': {
          defaultValue: '1px solid #000',
          name: 'test-component-example-2'
        }
      }});

      expect(Object.keys(result.argTypes).length).toBe(2);
      expect(Object.keys(result.rawValues).length).toBe(2);
    });

    it('should return the final value of the referenced variable', () => {
      const result = extractStyling('test-component-', { variables: {
        'test-component-example-1': {
          defaultValue: '#000',
          name: 'test-component-example-1'
        },
        'test-component-example-2': {
          defaultValue: 'var(--primary-600, #000)',
          name: 'test-component-example-2',
          references: [
            {
              name: 'primary-600',
              defaultValue: '#000'
            }
          ]
        },
        'primary-600': {
          name: 'primary-600',
          defaultValue: '#0056B1'
        }
      }});

      const name = `${STYLING_PREFIX}test-component-example-2`;

      expect(Object.keys(result.argTypes).length).toBe(2);
      expect(Object.keys(result.rawValues).length).toBe(2);

      expect(result.argTypes[name].defaultValue).toBe('#0056B1');
      expect(result.rawValues[name]).toBe('var(--primary-600, #000)');
    });
  });

  describe('getThemeVariables', () => {
    it('should extract theme variable only', () => {
      const result = getThemeVariables({ variables: {
        'test-component-example-1': {
          defaultValue: '#000',
          name: 'test-component-example-1'
        },
        'test-component-example-2': {
          defaultValue: 'var(--primary-600, #000)',
          name: 'test-component-example-2',
          references: [
            {
              name: 'primary-600',
              defaultValue: '#000'
            }
          ]
        },
        'primary-600': {
          name: 'primary-600',
          defaultValue: '#0056B1',
          tags: ['theme']
        }
      }});
      /* eslint-enable @typescript-eslint/naming-convention */

      expect(Object.keys(result).length).toBe(1);
      expect(result['primary-600']).toBe('#0056B1');
    });
  });
});
