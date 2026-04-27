import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createProject,
} from './create-project.js';

describe('createProject', () => {
  const createServerMock = () => ({
    registerTool: vi.fn()
  });

  it('should register the create_openapi_project tool with the expected metadata', () => {
    const server = createServerMock();

    createProject(server as any);

    expect(server.registerTool).toHaveBeenCalledTimes(1);
    const [toolName, config, handler] = server.registerTool.mock.calls[0];
    expect(toolName).toBe('create_openapi_project');
    expect(config).toEqual(expect.objectContaining({
      title: expect.any(String),
      description: expect.any(String),
      inputSchema: expect.objectContaining({
        projectName: expect.anything()
      })
    }));
    expect(handler).toBeInstanceOf(Function);
  });

  it('should declare a projectName input schema that only accepts strings', () => {
    const server = createServerMock();
    createProject(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    expect(inputSchema.projectName.safeParse('my-project').success).toBe(true);
    expect(inputSchema.projectName.safeParse(42).success).toBe(false);
  });

  it('should return text content with the npm create command for the provided project name', () => {
    const server = createServerMock();
    createProject(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ projectName: 'my-api' });

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: expect.stringContaining('npm create @ama-openapi my-api')
        }
      ]
    });
    expect(result.content[0].text).toContain('"my-api"');
  });

  it('should interpolate any provided project name in the response', () => {
    const server = createServerMock();
    createProject(server as any);

    const handler = server.registerTool.mock.calls[0][2];
    const result = handler({ projectName: 'another-project' });

    expect(result.content[0].text).toContain('another-project');
  });

  it('should transform project names by trimming, lowercasing, and replacing spaces with hyphens', () => {
    const server = createServerMock();
    createProject(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    const result = inputSchema.projectName.parse('  My Project Name  ');
    expect(result).toBe('my-project-name');
  });

  it('should reject empty project names after transformation', () => {
    const server = createServerMock();
    createProject(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    expect(() => inputSchema.projectName.parse('   ')).toThrow('Project name cannot be empty.');
  });

  it('should reject project names with invalid characters', () => {
    const server = createServerMock();
    createProject(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    expect(() => inputSchema.projectName.parse('Invalid_Name')).toThrow('Project name must be a valid npm package name (lowercase letters, numbers, hyphens, and optionally a scope).');
    expect(() => inputSchema.projectName.parse('Invalid.Name')).toThrow('Project name must be a valid npm package name (lowercase letters, numbers, hyphens, and optionally a scope).');
    expect(() => inputSchema.projectName.parse('Invalid Name!')).toThrow('Project name must be a valid npm package name (lowercase letters, numbers, hyphens, and optionally a scope).');
  });

  it('should accept valid npm package names with scopes', () => {
    const server = createServerMock();
    createProject(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    const result = inputSchema.projectName.parse('@scope/my-package');
    expect(result).toBe('@scope/my-package');
  });

  it('should accept valid npm package names without scopes', () => {
    const server = createServerMock();
    createProject(server as any);

    const { inputSchema } = server.registerTool.mock.calls[0][1];
    const result = inputSchema.projectName.parse('my-package-123');
    expect(result).toBe('my-package-123');
  });
});
