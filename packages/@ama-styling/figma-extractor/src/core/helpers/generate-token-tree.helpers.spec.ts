import {
  generateTokenTree,
} from './generate-token-tree.helpers';

describe('generateTokenTree', () => {
  test('should generate the token tree', () => {
    const result = generateTokenTree({
      test1: { value: 'test-value', description: 'desc' },
      test2: { value: { obj: 'obj-test' } },
      'node/test3': { value: 'test-value', description: 'desc' }
    } as any, 'test');

    expect((result.node as any).test3).toEqual({ $type: 'test', $value: 'test-value', $description: 'desc' });
    expect(result.test2).toEqual({ $type: 'test', $value: { obj: 'obj-test' } });
    expect(result.test1).toEqual({ $type: 'test', $value: 'test-value', $description: 'desc' });
    expect(result.test3).not.toBeDefined();
  });
});
