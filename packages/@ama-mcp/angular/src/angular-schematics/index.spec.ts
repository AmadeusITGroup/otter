const existsSync = jest.fn().mockReturnValue(false); // Always pretend no yarn.lock so command path is npx and not inside a Nx workspace
jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  existsSync
}));

// Simple scenario queue for successive spawn calls
type Scenario = { stdout?: string; stderr?: string };
let scenarios: Scenario[] = [];

jest.mock('node:child_process', () => {
  const mockExecFile = (_cmd: string, _args: string[], _opts: any, cb: (error: Error | null, output: { stdout: string; stderr: string }) => void) => {
    const { stdout = '', stderr = '' } = scenarios.shift() || {};
    cb(stderr ? new Error(stderr) : null, { stdout, stderr });
  };
  return {
    ...jest.requireActual('node:child_process'),
    execFile: mockExecFile
  };
});
/* eslint-disable import/first -- important to be after the mock */
import {
  setUpClientAndServerForTesting,
} from '@ama-mcp/core';
import {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerAngularSchematicsTool,
} from './index';

const basicScenarios: Scenario[] = [
  // npm ls --depth=0
  { stdout: 'successful output' },
  // ng g --help
  { stdout: 'ng g component\nng g service\nng g error\n' },
  // ng g component --help
  { stdout: 'Component\nCreates a component\nArguments:\nname Name of component\nOptions:\n--flat Flat structure [boolean] [default: true]\n--standalone Is standalone [boolean] [default: true]\n' },
  // ng g service --help
  { stdout: 'Service\nCreates a service\nOptions:\n--providedIn Provide scope [string] [choices: "root", "platform"] [default: "root"]\n' },
  // ng g error --help
  { stderr: 'Some error' }
];

const setupClientAndServer = async () => {
  const mcpServer = new McpServer({
    name: 'test-angular-schematics-server',
    version: '1.0.0',
    capabilities: { tools: {} }
  });
  registerAngularSchematicsTool(mcpServer, {});
  return setUpClientAndServerForTesting(mcpServer);
};

describe('angular_schematics tool', () => {
  beforeEach(() => {
    scenarios = [];
  });
  it('registers the tool', async () => {
    scenarios.push(...basicScenarios);
    const { client } = await setupClientAndServer();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toContain('angular_schematics');
  });

  it('lists schematics', async () => {
    scenarios.push(...basicScenarios);
    const { client } = await setupClientAndServer();
    const res = await client.callTool({ name: 'angular_schematics', arguments: {} });
    expect(res.structuredContent).toEqual(expect.objectContaining({
      schematics: expect.arrayContaining([
        expect.objectContaining({ name: 'component' }),
        expect.objectContaining({ name: 'service' })
      ])
    }));
    expect(res.structuredContent).toEqual(expect.objectContaining({
      schematics: expect.not.arrayContaining([
        expect.objectContaining({ name: 'error' })
      ])
    }));
  });

  it('filters by schematic name', async () => {
    scenarios.push(...basicScenarios);
    const { client } = await setupClientAndServer();
    let res = await client.callTool({ name: 'angular_schematics', arguments: { schematic: 'Component' } });
    expect(res.structuredContent).toEqual({
      schematics: [
        expect.objectContaining({
          name: 'component',
          description: 'Creates a component',
          args: [{ name: 'name', description: 'Name of component' }],
          options: [
            { name: 'flat', type: 'boolean', description: 'Flat structure', defaultValue: true, choices: undefined },
            { name: 'standalone', type: 'boolean', description: 'Is standalone', defaultValue: true, choices: undefined }
          ]
        })
      ]
    });
    res = await client.callTool({ name: 'angular_schematics', arguments: { schematic: '@o3r/core:service' } });
    expect(res.structuredContent).toEqual({
      schematics: [
        expect.objectContaining({
          name: 'service',
          description: 'Creates a service',
          args: [],
          options: [
            { name: 'providedIn', type: 'string', description: 'Provide scope', choices: ['root', 'platform'], defaultValue: 'root' }
          ]
        })
      ]
    });
  });

  it('returns empty list when discovery fails', async () => {
    scenarios.push({ stderr: 'Some error' });
    const { client } = await setupClientAndServer();
    const res = await client.callTool({ name: 'angular_schematics', arguments: {} });
    expect(res.structuredContent).toEqual({ schematics: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
