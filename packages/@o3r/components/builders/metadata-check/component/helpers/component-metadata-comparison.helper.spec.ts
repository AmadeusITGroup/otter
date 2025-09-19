import {
  componentMetadataComparator,
} from './component-metadata-comparison.helper';
import {
  ComponentClassOutput,
} from '@o3r/components';

describe('componentMetadataComparator', () => {
  describe('getArray', () => {
    it('should return one element per component placeholder', () => {
      const result = componentMetadataComparator.getArray([
        {
          placeholders: [
            { description: 'description', id: 'placeholder1' },
            { description: 'description', id: 'placeholder2' }
          ],
          library: 'lib',
          name: 'ComponentWithProp',
          path: '',
          selector: '',
          linkableToRuleset: false,
          type: 'COMPONENT'
        }
      ]);
      expect(result.length).toBe(2);
      result.forEach((item) => {
        expect(item.placeholders.length).toBe(1);
      });
    });

    it('should return only components with placeholders', () => {
      const result = componentMetadataComparator.getArray([
        {
          placeholders: [],
          library: 'lib',
          name: 'ComponentWithoutPlaceholder',
          path: '',
          selector: '',
          linkableToRuleset: false,
          type: 'COMPONENT'
        },
        {
          placeholders: undefined,
          library: 'lib',
          name: 'ComponentWithoutPlaceholder',
          path: '',
          selector: '',
          linkableToRuleset: false,
          type: 'COMPONENT'
        },
        {
          placeholders: [
            { description: 'description', id: 'placeholder1' }
          ],
          library: 'lib',
          name: 'ComponentWithPlaceholder',
          path: '',
          selector: '',
          linkableToRuleset: false,
          type: 'COMPONENT'
        }
      ]);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('ComponentWithPlaceholder');
    });
  });

  describe('getIdentifier', () => {
    it('should return an identifier with the property name', () => {
      const result = componentMetadataComparator.getIdentifier({
        placeholders: [
          { description: 'description', id: 'placeholder1' }
        ],
        library: 'lib',
        name: 'ComponentWithPlaceholder',
        path: '',
        selector: '',
        linkableToRuleset: false,
        type: 'COMPONENT'
      });
      expect(result).toBe('lib#ComponentWithPlaceholder placeholder1');
    });

    it('should return an identifier without property name if none available', () => {
      const result = componentMetadataComparator.getIdentifier({
        placeholders: [],
        library: 'lib',
        name: 'ComponentWithoutPlaceholder',
        path: '',
        selector: '',
        linkableToRuleset: false,
        type: 'COMPONENT'
      });
      expect(result).toBe('lib#ComponentWithoutPlaceholder');
    });
  });

  describe('isMigrationDataMatch', () => {
    it('should return true', () => {
      const metadata = {
        placeholders: [
          { description: 'description', id: 'placeholder1' }
        ],
        library: 'lib',
        name: 'ComponentWithPlaceholder',
        path: '',
        selector: '',
        linkableToRuleset: false,
        type: 'COMPONENT'
      } satisfies ComponentClassOutput;
      expect(componentMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', componentName: 'ComponentWithPlaceholder', placeholderId: 'placeholder1' }
      )).toBeTruthy();
      expect(componentMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', componentName: 'ComponentWithPlaceholder' }
      )).toBeTruthy();
      expect(componentMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib' }
      )).toBeTruthy();
    });

    it('should return false', () => {
      const metadata = {
        placeholders: [
          { description: 'description', id: 'placeholder1' }
        ],
        library: 'lib',
        name: 'ComponentWithPlaceholder',
        path: '',
        selector: '',
        linkableToRuleset: false,
        type: 'COMPONENT'
      } satisfies ComponentClassOutput;
      expect(componentMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'anotherLib', componentName: 'ComponentWithProp', placeholderId: 'placeholder1' }
      )).toBeFalsy();
      expect(componentMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', componentName: 'AnotherComponent', placeholderId: 'placeholder1' }
      )).toBeFalsy();
      expect(componentMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', componentName: 'ComponentWithProp', placeholderId: 'anotherPlaceholder' }
      )).toBeFalsy();
    });
  });
});
