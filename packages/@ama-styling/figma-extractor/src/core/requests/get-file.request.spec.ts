describe('getFile', () => {
  test('should retrieve the correct file', async () => {
    const getFileMock = jest.fn();
    const filesApiMock = jest.fn().mockReturnValue({ getFile: getFileMock });

    jest.mock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));

    const testApi: any = {};
    const opts = { fileKey: 'test-file' };
    await (await import('./get-file.request')).getFile(testApi, opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey });
  });
});
