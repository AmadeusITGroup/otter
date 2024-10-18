import {
  CONFIGURATION_PREFIX
} from './configuration-configs.interface';
import {
  extractConfiguration,
  retrieveConfigFromProps
} from './configuration.helpers';
import {
  getConfigurationMetadata,
  setConfigurationMetadata
} from './metadata-manager';

describe('Configuration Metadata setup', () => {
  beforeEach(() => {
    if (typeof window === 'undefined') {
      globalThis.window = {} as any;
    }
    // eslint-disable-next-line no-underscore-dangle
    delete window.__OTTER_STORYBOOK_CONFIGURATION_METADATA__;
  });

  it('should register the metadata', () => {
    const mockMetadata = { test: 'fakeValue' } as any;
    setConfigurationMetadata(mockMetadata);

    // eslint-disable-next-line no-underscore-dangle
    expect(window.__OTTER_STORYBOOK_CONFIGURATION_METADATA__).toBe(mockMetadata);
  });

  it('should retrieve the metadata', () => {
    const mockMetadata = { test: 'fakeValue' } as any;

    // eslint-disable-next-line no-underscore-dangle
    window.__OTTER_STORYBOOK_CONFIGURATION_METADATA__ = mockMetadata;

    expect(getConfigurationMetadata()).toBe(mockMetadata);
  });
});

describe('Configuration helper', () => {
  describe('extractConfiguration', () => {
    it('should extract description from metadata', () => {
      const result = extractConfiguration('@otter/test', 'testComponent', [
        {
          library: '@otter/test',
          name: 'testComponent',
          properties: [
            {
              type: 'string',
              description: 'test prop',
              name: 'testProp',
              label: 'test prop',
              value: 'test'
            }
          ],
          path: '',
          type: 'BLOCK'
        },
        {
          library: '@otter/test',
          name: 'testComponent2',
          properties: [
            {
              type: 'boolean',
              description: 'test prop',
              name: 'testProp',
              label: 'test prop'
            }
          ],
          path: '',
          type: 'BLOCK'
        }
      ]);

      expect(Object.keys(result.argTypes).length).toBe(1);
      expect(result.argTypes[`${CONFIGURATION_PREFIX}testProp`]).toBeDefined();
      expect(result.argTypes[`${CONFIGURATION_PREFIX}testProp`].defaultValue).toBe('test');
    });
  });

  /* eslint-disable @typescript-eslint/naming-convention */
  describe('retrieveConfigFromProps', () => {
    it('should extract only config properties', () => {
      const props = {
        'cssvar-simple-header-pres-background-color': 'rgba(0, 66, 160, 1)',
        'cssvar-simple-header-pres-language-color': 'rgba(255, 255, 255, 1)',
        'cssvar-simple-header-pres-color': 'rgba(255, 255, 255, 1)',
        'config-showMotto': false,
        'config-showLanguageSelector': true,
        'localization-motto': 'o3r-simple-header-pres.motto',
        'localization-airline': 'o3r-simple-header-pres.airline',
        'localization-logoAltText': 'o3r-simple-header-pres.logoAltText',
        'localization-themedark': 'o3r-simple-header-pres.dynamicTheme.dark',
        'localization-themeblue': 'o3r-simple-header-pres.dynamicTheme.blue',
        'localization-themeyellow': 'o3r-simple-header-pres.dynamicTheme.yellow',
        'localization-languageEn': 'o3r-simple-header-pres.language.en',
        'localization-languageFr': 'o3r-simple-header-pres.language.fr',
        'localization-languageAr': 'o3r-simple-header-pres.language.ar'
      };
      const result = retrieveConfigFromProps(props);
      const configFieldName1 = 'showMotto';

      expect(Object.keys(result).length).toBe(2);
      expect(result[configFieldName1]).toBe(false);
    });

    it('should return empty object if no config property found', () => {
      const props = {
        'cssvar-simple-header-pres-background-color': 'rgba(0, 66, 160, 1)',
        'cssvar-simple-header-pres-language-color': 'rgba(255, 255, 255, 1)',
        'cssvar-simple-header-pres-color': 'rgba(255, 255, 255, 1)',
        'localization-motto': 'o3r-simple-header-pres.motto',
        'localization-airline': 'o3r-simple-header-pres.airline',
        'localization-logoAltText': 'o3r-simple-header-pres.logoAltText',
        'localization-themedark': 'o3r-simple-header-pres.dynamicTheme.dark',
        'localization-themeblue': 'o3r-simple-header-pres.dynamicTheme.blue',
        'localization-themeyellow': 'o3r-simple-header-pres.dynamicTheme.yellow',
        'localization-languageEn': 'o3r-simple-header-pres.language.en',
        'localization-languageFr': 'o3r-simple-header-pres.language.fr',
        'localization-languageAr': 'o3r-simple-header-pres.language.ar'
      };
      const result = retrieveConfigFromProps(props);
      const configFieldName1 = 'showMotto';

      expect(Object.keys(result).length).toBe(0);
      expect(result[configFieldName1]).not.toBeDefined();
    });
  });
});
