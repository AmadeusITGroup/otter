import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';

describe('getTokensVariables', () => {
  test('should retrieve the correct file', async () => {
    const getTextWeightVariableIds = vi.fn();
    const getTokensFromLocalVariables = vi.fn().mockReturnValue(['']);
    vi.doMock('@ama-styling/figma-sdk', () => ({}));
    vi.doMock('../requests/get-text-weight-request', () => ({
      getTextWeightVariableIds
    }));
    vi.doMock('./tokens/token-from-local-variables', () => ({
      getTokensFromLocalVariables
    }));

    const testApi: any = {};
    const variableCollections = {
      c1: {
        modes: ['modeC1-1', 'modeC1-2'],
        name: 'collection1'
      },
      c2: {
        modes: ['modeC2-1'],
        name: 'collection2'
      }
    };
    const opts = { fileKey: 'test-file' };
    const fakeFile = {
      styles: {
        style0: {
          styleType: 'FILL'
        } as any,
        style1: {
          styleType: 'TEXT'
        } as any,
        style2: {
          styleType: 'TEXT'
        } as any
      }
    } as any as GetFile200Response;
    const { getTokensVariables } = (await import('./generate-tokens'));
    const variables = await getTokensVariables(testApi, Promise.resolve(fakeFile), { variableCollections } as any, opts);

    expect(getTokensFromLocalVariables).toHaveBeenCalledTimes(3);
    expect(getTextWeightVariableIds).toHaveBeenCalled();
    expect(variables).toStrictEqual([
      {
        collection: 'collection1',
        mode: 'modeC1-1',
        tokens: ['']
      },
      {
        collection: 'collection1',
        mode: 'modeC1-2',
        tokens: ['']
      },
      {
        collection: 'collection2',
        mode: 'modeC2-1',
        tokens: ['']
      }
    ]);
  });
});
