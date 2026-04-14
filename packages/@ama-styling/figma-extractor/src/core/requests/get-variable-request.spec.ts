describe('getVariables', () => {
  test('should retrieve the correct variable list', async () => {
    const getLocalVariablesMock = jest.fn().mockResolvedValue({
      meta: 'test'
    });
    const variablesApiMock = jest.fn().mockReturnValue({ getLocalVariables: getLocalVariablesMock });

    jest.mock('@ama-styling/figma-sdk', () => ({
      VariablesApi: variablesApiMock
    }));

    const testApi: any = {};
    const opts = { fileKey: 'test-file' };
    const { getVariables } = require('./get-variable-request');
    const result = await getVariables(testApi, opts);
    expect(variablesApiMock).toHaveBeenCalled();
    expect(getLocalVariablesMock).toHaveBeenCalledWith({ file_key: opts.fileKey });
    expect(result).toBe('test');
  });
});
