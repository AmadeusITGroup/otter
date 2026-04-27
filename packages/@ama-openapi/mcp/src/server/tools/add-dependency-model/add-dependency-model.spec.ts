import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  addDependencyModel,
} from './add-dependency-model.js';

describe('addDependencyModel', () => {
  const createServerMock = () => ({
    registerTool: vi.fn()
  });

  it('should register the add_dependency_model tool with the expected metadata', () => {
    const server = createServerMock();

    addDependencyModel(server as any);

    expect(server.registerTool).toHaveBeenCalledTimes(1);
    const [toolName, config, handler] = server.registerTool.mock.calls[0];
    expect(toolName).toBe('add_dependency_model');
    expect(config).toEqual(expect.objectContaining({
      title: expect.any(String),
      description: expect.any(String),
      inputSchema: expect.objectContaining({
        modelName: expect.anything(),
        libraryName: expect.anything(),
        version: expect.anything()
      })
    }));
    expect(handler).toBeInstanceOf(Function);
  });

  it('should validate the input schema', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    expect(inputSchema.modelName.safeParse('MyModel').success).toBe(true);
    expect(inputSchema.modelName.safeParse(42).success).toBe(false);
    expect(inputSchema.libraryName.safeParse('@scope/lib').success).toBe(true);
    expect(inputSchema.libraryName.safeParse(undefined).success).toBe(true);
    expect(inputSchema.version.safeParse('1.0.0').success).toBe(true);
    expect(inputSchema.version.safeParse(undefined).success).toBe(true);
    expect(inputSchema.version.safeParse(123).success).toBe(false);
  });

  it('should return install instructions including the version when provided', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet', libraryName: '@scope/pets', version: '2.3.4' });

    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toEqual({
      type: 'text',
      text: expect.stringContaining('@scope/pets@~2.3.4')
    });
    expect(result.content[0].text).toContain('npm install @scope/pets@~2.3.4');
    expect(result.content[0].text).toContain('yarn add @scope/pets@~2.3.4');
  });

  it('should omit the version suffix when version is not provided', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet', libraryName: '@scope/pets' });

    expect(result.content[0].text).toContain('npm install @scope/pets');
    expect(result.content[0].text).not.toContain('@~');
    expect(result.content[0].text).not.toContain('@scope/pets@');
  });

  it('should describe how to register the model in the openapi manifest', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet', libraryName: '@scope/pets', version: '2.3.4' });

    const guidance = result.content[1];
    expect(guidance.type).toBe('text');
    expect(guidance.text).toContain('"Pet"');
    expect(guidance.text).toContain('node_modules/@scope/pets');
    expect(guidance.text).toContain('openapi.manifest.json');
    expect(guidance.text).toContain('models.@scope/pets');
  });

  it('should provide discovery instructions when libraryName is not provided', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet' });

    expect(result.content).toHaveLength(2);
    const firstContent = result.content[0];
    expect(firstContent.type).toBe('text');
    expect(firstContent.text).toContain('To find the library containing the model "Pet"');
    expect(firstContent.text).toContain('inspect installed NPM packages');
    expect(firstContent.text).toContain('keywords');
    expect(firstContent.text).toContain('"openapi"');
    expect(firstContent.text).toContain('<discovered library name>');
  });

  it('should use placeholder library name in manifest instructions when not provided', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet' });

    const guidance = result.content[1];
    expect(guidance.type).toBe('text');
    expect(guidance.text).toContain('node_modules/<discovered library name>');
    expect(guidance.text).toContain('models.<discovered library name>');
  });

  it('should not mention version verification when version is not provided', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet', libraryName: '@scope/pets' });

    expect(result.content[0].text).not.toContain('verify that version');
    expect(result.content[0].text).not.toContain('included in the current version range');
  });

  it('should mention version verification when version is provided', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet', libraryName: '@scope/pets', version: '2.3.4' });

    expect(result.content[0].text).toContain('verify that version 2.3.4');
    expect(result.content[0].text).toContain('included in the current version range');
  });

  it('should include search instructions in both content sections', () => {
    const server = createServerMock();
    addDependencyModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet', libraryName: '@scope/pets' });

    const searchInstructions = 'The model file can be identified by its filename';
    expect(result.content[1].text).toContain(searchInstructions);
    expect(result.content[1].text).toContain('components/schemas/');
  });
});
