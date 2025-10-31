import type {
  RetrievedDependencyModel,
} from './manifest/extract-dependency-models.mjs';
import {
  deserialize,
  serialize,
} from './serialization.mjs';

describe('serialize', () => {
  it('should serialize to JSON when isOutputJson is true', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      isOutputJson: true
    } as any;

    const serializedContent = serialize(mockSpecification, mockRetrievedModel);
    expect(serializedContent).toEqual(JSON.stringify(mockSpecification, null, 2));
  });

  it('should serialize to YAML when isOutputJson is false', () => {
    const mockSpecification = { testField: 'testValue' };
    const mockRetrievedModel: RetrievedDependencyModel = {
      isOutputJson: false
    } as any;

    const serializedContent = serialize(mockSpecification, mockRetrievedModel);
    expect(serializedContent).toContain('testField: testValue');
  });
});

describe('deserialize', () => {
  it('should deserialize from JSON when isInputJson is true', () => {
    const mockContent = JSON.stringify({ testField: 'testValue' });
    const mockRetrievedModel: RetrievedDependencyModel = {
      isInputJson: true
    } as any;

    const deserializedSpecification = deserialize(mockContent, mockRetrievedModel);
    expect(deserializedSpecification).toEqual({ testField: 'testValue' });
  });

  it('should deserialize from YAML when isInputJson is false', () => {
    const mockContent = 'testField: testValue';
    const mockRetrievedModel: RetrievedDependencyModel = {
      isInputJson: false
    } as any;

    const deserializedSpecification = deserialize(mockContent, mockRetrievedModel);
    expect(deserializedSpecification).toEqual({ testField: 'testValue' });
  });
});
