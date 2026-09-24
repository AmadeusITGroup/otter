describe('getVariables', () => {
  test('should retrieve the correct variable list', async () => {
    const getLocalVariablesMock = vi.fn().mockResolvedValue({
      meta: 'test'
    });
    const variablesApiMock = vi.fn(class {
      constructor() {
        return { getLocalVariables: getLocalVariablesMock };
      }
    });

    vi.doMock('@ama-styling/figma-sdk', () => ({
      VariablesApi: variablesApiMock
    }));

    const testApi: any = {};
    const opts = { fileKey: 'test-file' };
    const { getVariables } = (await import('./get-variable-request'));
    const result = await getVariables(testApi, opts);
    expect(variablesApiMock).toHaveBeenCalled();
    expect(getLocalVariablesMock).toHaveBeenCalledWith({ file_key: opts.fileKey });
    expect(result).toBe('test');
  });
});
