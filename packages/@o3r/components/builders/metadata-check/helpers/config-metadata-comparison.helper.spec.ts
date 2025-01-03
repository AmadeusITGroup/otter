import {
  configMetadataComparator,
} from './config-metadata-comparison.helper';
import {
  ComponentConfigOutput,
} from '@o3r/components';

describe('configMetadataComparator', () => {
  describe('getArray', () => {
    it('should return one element per configuration property', () => {
      const result = configMetadataComparator.getArray([
        { properties: [
          { description: 'description', label: 'prop1', name: 'prop1', type: 'string' },
          { description: 'description', label: 'prop2', name: 'prop2', type: 'string' }
        ], library: 'lib', name: 'ConfigWithProp', path: '', type: 'COMPONENT' }
      ]);
      expect(result.length).toBe(2);
      result.forEach((item) => {
        expect(item.properties.length).toBe(1);
      });
    });

    it('should return only configurations with properties', () => {
      const result = configMetadataComparator.getArray([
        { properties: [], library: 'lib', name: 'ConfigWithoutProp', path: '', type: 'COMPONENT' },
        { properties: [
          { description: 'description', label: 'prop', name: 'prop', type: 'string' }
        ], library: 'lib', name: 'ConfigWithProp', path: '', type: 'COMPONENT' }
      ]);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('ConfigWithProp');
    });
  });

  describe('getIdentifier', () => {
    it('should return an identifier with the property name', () => {
      const result = configMetadataComparator.getIdentifier({
        properties: [
          { description: 'description', label: 'prop', name: 'prop', type: 'string' }
        ], library: 'lib', name: 'ConfigWithProp', path: '', type: 'COMPONENT'
      });
      expect(result).toBe('lib#ConfigWithProp prop');
    });

    it('should return an identifier without property name if none available', () => {
      const result = configMetadataComparator.getIdentifier({
        properties: [], library: 'lib', name: 'ConfigWithoutProp', path: '', type: 'COMPONENT'
      });
      expect(result).toBe('lib#ConfigWithoutProp');
    });
  });

  describe('isMigrationDataMatch', () => {
    it('should return true', () => {
      const metadata = {
        properties: [
          { description: 'description', label: 'prop', name: 'prop', type: 'string' }
        ], library: 'lib', name: 'ConfigWithProp', path: '', type: 'COMPONENT'
      } satisfies ComponentConfigOutput;
      expect(configMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', configName: 'ConfigWithProp', propertyName: 'prop' }
      )).toBeTruthy();
      expect(configMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', configName: 'ConfigWithProp' }
      )).toBeTruthy();
      expect(configMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib' }
      )).toBeTruthy();
    });

    it('should return false', () => {
      const metadata = {
        properties: [
          { description: 'description', label: 'prop', name: 'prop', type: 'string' }
        ], library: 'lib', name: 'ConfigWithProp', path: '', type: 'COMPONENT'
      } satisfies ComponentConfigOutput;
      expect(configMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'anotherLib', configName: 'ConfigWithProp', propertyName: 'prop' }
      )).toBeFalsy();
      expect(configMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', configName: 'AnotherConfig', propertyName: 'prop' }
      )).toBeFalsy();
      expect(configMetadataComparator.isMigrationDataMatch(
        metadata,
        { libraryName: 'lib', configName: 'ConfigWithProp', propertyName: 'anotherProp' }
      )).toBeFalsy();
    });
  });
});
