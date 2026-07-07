import {
  getVariablesFormatter,
} from './variable-formatter';

describe('getVariablesFormatter', () => {
  test('should format a single variable', () => {
    const format = getVariablesFormatter({
      variables: {
        test: {
          name: 'test/my var'
        }
      }
    } as any);
    expect(format({ id: 'test', type: 'VARIABLE_ALIAS' })).toBe('{test.my-var}');
  });

  test('should format a list of variables', () => {
    const format = getVariablesFormatter({
      variables: {
        test: {
          name: 'test/my var'
        },
        test2: {
          name: 'test/my var 2'
        }
      }
    } as any);
    expect(format([
      { id: 'test', type: 'VARIABLE_ALIAS' },
      { id: 'test2', type: 'VARIABLE_ALIAS' }
    ])).toBe('{test.my-var} {test.my-var-2}');
  });
});
