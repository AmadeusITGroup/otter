import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';

describe('getTextWeightVariableIds', () => {
  test('should retrieve the list of weights', async () => {
    const getFileMock = jest.fn();
    const filesApiMock = jest.fn().mockReturnValue({ getFile: getFileMock });

    jest.mock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));

    const testApi: any = {};
    const opts = { fileKey: 'test-file' };
    const fakeFile: GetFile200Response = {};
    await (await import('./get-text-weight.request')).getTextWeightVariableIds(testApi, opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey });
  });
});
