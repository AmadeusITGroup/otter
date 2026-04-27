import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  renameModel,
} from './rename-model.js';

describe('renameModel', () => {
  const createServerMock = () => ({
    registerTool: vi.fn()
  });

  it('should register the rename_model tool with the expected metadata', () => {
    const server = createServerMock();

    renameModel(server as any);

    expect(server.registerTool).toHaveBeenCalledTimes(1);
    const [toolName, config, handler] = server.registerTool.mock.calls[0];
    expect(toolName).toBe('rename_model');
    expect(config).toEqual(expect.objectContaining({
      title: expect.any(String),
      description: expect.any(String),
      inputSchema: expect.objectContaining({
        currentName: expect.anything(),
        newName: expect.anything(),
        libraryName: expect.anything()
      })
    }));
    expect(handler).toBeInstanceOf(Function);
  });

  it('should validate the input schema', () => {
    const server = createServerMock();
    renameModel(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    expect(inputSchema.currentName.safeParse('OldModel').success).toBe(true);
    expect(inputSchema.currentName.safeParse(42).success).toBe(false);
    expect(inputSchema.newName.safeParse('NewModel').success).toBe(true);
    expect(inputSchema.newName.safeParse(null).success).toBe(false);
    expect(inputSchema.libraryName.safeParse('my-library').success).toBe(true);
    expect(inputSchema.libraryName.safeParse(undefined).success).toBe(true);
  });

  it('should return instructions for renaming the model without libraryName', () => {
    const server = createServerMock();
    renameModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ currentName: 'OldModel', newName: 'NewModel' });

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: expect.any(String)
        }
      ]
    });
    expect(result.content[0].text).toContain('OldModel');
    expect(result.content[0].text).toContain('NewModel');
    expect(result.content[0].text).toContain('models');
    expect(result.content[0].text).toContain('openapi.manifest.json');
    expect(result.content[0].text).toContain('transforms.rename');
  });

  it('should return instructions for renaming the model with libraryName', () => {
    const server = createServerMock();
    renameModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ currentName: 'Pet', newName: 'Animal', libraryName: 'pets-lib' });

    expect(result.content[0].text).toContain('Pet');
    expect(result.content[0].text).toContain('Animal');
    expect(result.content[0].text).toContain('models.pets-lib');
  });

  it('should include guidance about the transforms.rename field', () => {
    const server = createServerMock();
    renameModel(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ currentName: 'User', newName: 'Account' });

    expect(result.content[0].text).toContain('transforms.rename');
    expect(result.content[0].text).toContain('Account');
  });
});
