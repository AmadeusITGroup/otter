import {
  authentication,
  type EventEmitter,
  lm,
  McpServerDefinition,
  McpStdioServerDefinition,
  type OutputChannel,
  workspace,
} from 'vscode';

const isO3rMcpServer = (server: McpServerDefinition): server is McpStdioServerDefinition => server.label === 'o3r';

export const mcpConfig = (didChangeEmitter: EventEmitter<void>, channel: OutputChannel): Parameters<typeof lm.registerMcpServerDefinitionProvider>[1] => {
  const mcpConfiguration = workspace.getConfiguration('otter.mcp');
  return ({
    onDidChangeMcpServerDefinitions: didChangeEmitter.event,
    resolveMcpServerDefinition: async (server) => {
      if (isO3rMcpServer(server)) {
        const session = await authentication.getSession(
          'github',
          ['repo', 'read:user'],
          { createIfNone: true }
        );
        channel.appendLine(`Hello ${session?.account.label}!`);

        server.env.O3R_MCP_GITHUB_TOKEN = session.accessToken || null;
      }
      return server;
    },
    provideMcpServerDefinitions: () => [
      new McpStdioServerDefinition(
        'o3r',
        'npx',
        ['-y', '-p', '@o3r/mcp', 'o3r-mcp-start'],
        {
          O3R_MCP_CACHE_PATH: mcpConfiguration.get<string>('cacheFolderPath') || null
        }
      ),
      new McpStdioServerDefinition(
        'angular',
        'npx',
        ['@angular/cli', 'mcp']
      ),
      new McpStdioServerDefinition(
        'playwright',
        'npx',
        ['-y', '@playwright/mcp']
      )
    ]
  });
};
