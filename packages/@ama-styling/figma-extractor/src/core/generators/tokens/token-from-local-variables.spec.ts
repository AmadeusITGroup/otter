describe('getTokensFromLocalVariables', () => {
  test('should generate the manifest file content for color and text', () => {
    const getRgbaColorHex = jest.fn().mockReturnValue('#test');
    const convertNameToReference = jest.fn().mockImplementation((value: string) => `${value}.ref`);
    const getPathFromName = jest.fn().mockImplementation((value: string) => [value, 'path']);
    jest.mock('../../helpers/color-hex.helpers', () => ({
      getRgbaColorHex
    }));

    jest.mock('../../helpers/name-to-reference', () => ({
      convertNameToReference,
      getPathFromName
    }));

    const variableCollections = {
      c1: {
        modes: ['m1', 'm2'],
        name: 'collection1',
        variableIds: ['var1', 'var/unitless', 'unit', 'str', 'ref', 'wrongref']
      },
      c2: {
        modes: ['m1'],
        name: 'collection2',
        variableIds: ['var1', 'var/unitless', 'unit', 'str', 'ref', 'wrongref']
      }
    };

    const variables = {
      var1: {
        name: 'var1',
        remote: false,
        valuesByMode: {
          m1: {
            r: 0.1,
            g: 0.1,
            b: 0.1,
            a: 0.1
          },
          m2: 'test'
        }
      },
      'var/unitless': {
        name: 'unitless/var',
        remote: false,
        valuesByMode: {
          m1: 4,
          m2: 'test'
        }
      },
      unit: {
        name: 'unit',
        remote: false,
        valuesByMode: {
          m1: 4,
          m2: 'test'
        }
      },
      str: {
        name: 'str',
        remote: false,
        valuesByMode: {
          m1: 'a string',
          m2: 'test'
        }
      },
      ref: {
        name: 'ref',
        remote: false,
        valuesByMode: {
          m1: {
            type: 'VARIABLE_ALIAS',
            id: 'var1'
          },
          m2: 'test'
        }
      },
      wrongref: {
        name: 'ref',
        remote: false,
        valuesByMode: {
          m1: {
            type: 'VARIABLE_ALIAS',
            id: 'other'
          },
          m2: 'test'
        }
      }
    };

    const opts = { fileKey: 'test-file', modeId: 'm1', collectionId: 'c1' };
    const { getTokensFromLocalVariables } = require('./token-from-local-variables');
    const result = getTokensFromLocalVariables({ variables, variableCollections } as any, ['var/unitless'], opts);

    expect(result).toEqual({
      ref: { $value: '{var1.ref}' },
      str: { $type: 'string', $value: 'a string' },
      unit: { $type: 'dimension', $value: '4px' },
      unitless: { var: { $type: 'dimension', $value: 4 } },
      var1: { $type: 'color', $value: '#test' }
    });
  });
});
