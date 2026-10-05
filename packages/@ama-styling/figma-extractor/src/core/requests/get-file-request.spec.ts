describe('getFile', () => {
  test('should retrieve the correct file', async () => {
    const getFileMock = vi.fn();
    const filesApiMock = vi.fn(class {
      constructor() {
        return { getFile: getFileMock };
      }
    });

    vi.doMock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));

    const testApi: any = {};
    const opts = { fileKey: 'test-file' };
    const { getFile } = (await import('./get-file-request'));
    await getFile(testApi, opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey });
  });
});
