import { LOCALIZATION_PREFIX } from './localization-configs.interface';
import { extractLocalization, getLocalizations } from './localization.helpers';
import { getLocalizationMetadata, setLocalizationMetadata } from './metadata-manager';

describe('Localization Metadata setup', () => {
  beforeEach(() => {
    if (typeof window === 'undefined') {
      globalThis.window = {} as any;
    }
    // eslint-disable-next-line no-underscore-dangle
    delete window.__OTTER_STORYBOOK_LOCALIZATION_METADATA__;
  });

  it('should register the metadata', () => {
    const mockMetadata = { test: 'fakeValue' } as any;
    setLocalizationMetadata(mockMetadata);

    // eslint-disable-next-line no-underscore-dangle
    expect(window.__OTTER_STORYBOOK_LOCALIZATION_METADATA__).toBe(mockMetadata);
  });

  it('should retrieve the metadata', () => {
    const mockMetadata = { test: 'fakeValue' } as any;
    // eslint-disable-next-line no-underscore-dangle
    window.__OTTER_STORYBOOK_LOCALIZATION_METADATA__ = mockMetadata;

    expect(getLocalizationMetadata()).toBe(mockMetadata);
  });
});

describe('Localization helper', () => {
  describe('extractLocalization', () => {
    it('should extract description from metadata', () => {
      const result = extractLocalization({localKeyTest: 'keyTest'}, [
        {
          key: 'keyTest',
          description: 'ok description',
          dictionary: false,
          referenceData: false
        },
        {
          key: 'keyTest-2',
          description: 'nok description',
          dictionary: false,
          referenceData: false
        }
      ]);

      expect(Object.keys(result.argTypes).length).toBe(1);
      expect(result.argTypes[`${LOCALIZATION_PREFIX}localKeyTest`]).toBeDefined();
      expect(result.argTypes[`${LOCALIZATION_PREFIX}localKeyTest`].description).toBe('ok description');
    });
  });

  describe('getLocalizations', () => {
    it('should extract key/value from metadata', () => {
      const result = getLocalizations([
        {
          key: 'test',
          value: 'test value 1',
          description: 'ok description',
          dictionary: false,
          referenceData: false
        },
        {
          key: 'test-2',
          description: 'other description',
          value: 'test value 2',
          dictionary: false,
          referenceData: false
        }
      ]);

      expect(Object.keys(result).length).toBe(2);
      expect(result.test).toBeDefined();
      expect(result.test).toBe('test value 1');
    });
  });
});
