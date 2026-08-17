import * as fs from 'node:fs';
import * as path from 'node:path';
import * as builder from './index';

const filesPerLanguage = {
  en_US: [path.join(__dirname, '../../testing/mocks', 'test-resources', 'en_US.json')],
  fr_FR: [path.join(__dirname, '../../testing/mocks', 'test-resources', 'fr_FR.json')],
  en_GB: [path.join(__dirname, '../../testing/mocks', 'test-resources', 'en_GB.json')]
};

const languageFilesContent = Object.entries(filesPerLanguage).reduce((acc, [language, files]) => {
  acc[language] = JSON.parse(fs.readFileSync(files[0]).toString());
  return acc;
}, {} as Record<string, Record<string, string>>);

describe('Localization builder', () => {
  beforeEach(() => {});

  describe('getTranslationsForLanguage', () => {
    it('No override should not merge files', () => {
      const result = builder.getTranslationsForLanguage('en_GB', filesPerLanguage, {}, {});

      expect(result).toEqual(languageFilesContent.en_GB);
    });

    it('Override should only merge specified files', () => {
      const resultEnGb = builder.getTranslationsForLanguage('en_GB', filesPerLanguage, { en_GB: 'en_US' }, {});

      expect(resultEnGb).toEqual({ ...languageFilesContent.en_US, ...languageFilesContent.en_GB });

      const resultFrFr = builder.getTranslationsForLanguage('fr_FR', filesPerLanguage, { en_GB: 'en_US' }, {});

      expect(resultFrFr).toEqual(languageFilesContent.fr_FR);
    });

    it('Circular override should throw', () => {
      expect(() => builder.getTranslationsForLanguage('en_GB', filesPerLanguage, { en_GB: 'en_US', en_US: 'en_GB' }, {})).toThrow();
    });
  });
});
