import {
  styleTypeMapping,
} from '../generators/styles/interfaces';
import {
  getCollectionFileName,
  getStyleFileName,
} from './file-names';

describe('getStyleFileName', () => {
  test('should add correct suffix', () => {
    expect(getStyleFileName('FILL')).toBe(`${styleTypeMapping.FILL}.styles.tokens.json`);
  });
});

describe('getCollectionFileName', () => {
  test('should generate collection filename', () => {
    expect(getCollectionFileName('test-collection', { name: 'my-mode' })).toBe('test-collection.my-mode.tokens.json');
  });
});
