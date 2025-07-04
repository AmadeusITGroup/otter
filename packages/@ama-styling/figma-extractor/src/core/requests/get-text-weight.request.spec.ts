import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';

describe('getTextWeightVariableIds', () => {
  test('should retrieve the list of weights', async () => {
    const getFileMock = jest.fn().mockResolvedValue({
      nodes: {
        styleNode1: {
          document: {
            type: 'TEXT',
            boundVariables: {
              fontWeight: [
                { type: 'VARIABLE_ALIAS', id: 'target.var' },
                5
              ]
            }
          }
        }
      }
    });
    const filesApiMock = jest.fn().mockReturnValue({ getFileNodes: getFileMock });

    jest.mock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));

    const testApi: any = {};
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
    const { getTextWeightVariableIds } = require('./get-text-weight.request');
    await getTextWeightVariableIds(testApi, Promise.resolve(fakeFile), opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey, ids: 'style1,style2' });
  });
});
