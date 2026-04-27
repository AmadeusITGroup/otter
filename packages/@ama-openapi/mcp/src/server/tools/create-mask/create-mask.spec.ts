import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createMask,
} from './create-mask.js';

describe('createMask', () => {
  const createServerMock = () => ({
    registerTool: vi.fn()
  });

  it('should register the create_mask tool with the expected metadata', () => {
    const server = createServerMock();

    createMask(server as any);

    expect(server.registerTool).toHaveBeenCalledTimes(1);
    const [toolName, config, handler] = server.registerTool.mock.calls[0];
    expect(toolName).toBe('create_mask');
    expect(config).toEqual(expect.objectContaining({
      title: expect.any(String),
      description: expect.any(String),
      inputSchema: expect.objectContaining({
        modelName: expect.anything(),
        libraryName: expect.anything(),
        fields: expect.anything()
      })
    }));
    expect(handler).toBeInstanceOf(Function);
  });

  it('should validate the input schema', () => {
    const server = createServerMock();
    createMask(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    expect(inputSchema.modelName.safeParse('User').success).toBe(true);
    expect(inputSchema.modelName.safeParse(42).success).toBe(false);
    expect(inputSchema.libraryName.safeParse('users-lib').success).toBe(true);
    expect(inputSchema.libraryName.safeParse(null).success).toBe(false);
    expect(inputSchema.fields.safeParse(['id', 'name']).success).toBe(true);
    expect(inputSchema.fields.safeParse('id').success).toBe(false);
    expect(inputSchema.fields.safeParse([]).success).toBe(true);
  });

  it('should return instructions for creating a mask with specified fields', () => {
    const server = createServerMock();
    createMask(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'User', libraryName: 'users-lib', fields: ['id', 'email'] });

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: expect.any(String)
        }
      ]
    });
    expect(result.content[0].text).toContain('User');
    expect(result.content[0].text).toContain('models.users-lib');
    expect(result.content[0].text).toContain('"id"');
    expect(result.content[0].text).toContain('"email"');
    expect(result.content[0].text).toContain('openapi.manifest.json');
  });

  it('should include all fields in the mask instructions', () => {
    const server = createServerMock();
    createMask(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({
      modelName: 'Product',
      libraryName: 'products-lib',
      fields: ['id', 'name', 'price', 'description']
    });

    expect(result.content[0].text).toContain('"id"');
    expect(result.content[0].text).toContain('"name"');
    expect(result.content[0].text).toContain('"price"');
    expect(result.content[0].text).toContain('"description"');
  });

  it('should provide guidance about the transforms.masks structure', () => {
    const server = createServerMock();
    createMask(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Pet', libraryName: 'pets-lib', fields: ['name'] });

    expect(result.content[0].text).toContain('transforms.masks');
    expect(result.content[0].text).toContain('properties');
    expect(result.content[0].text).toContain('true');
  });

  it('should include an example mask structure in the response', () => {
    const server = createServerMock();
    createMask(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Order', libraryName: 'orders-lib', fields: ['orderId'] });

    const text = result.content[0].text;
    expect(text).toContain('example');
    expect(text).toContain('"transforms"');
    expect(text).toContain('"masks"');
    expect(text).toContain('field1');
    expect(text).toContain('field2');
  });

  it('should handle empty fields array', () => {
    const server = createServerMock();
    createMask(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ modelName: 'Empty', libraryName: 'lib', fields: [] });

    expect(result.content[0].text).toContain('Empty');
    expect(result.content[0].text).toContain('models.lib');
  });
});
