import {
  authentication,
  type EventEmitter,
  lm,
  McpServerDefinition,
  McpStdioServerDefinition,
  type OutputChannel,
  Uri,
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
    provideMcpServerDefinitions: () => {
      const isLocal = process.env.O3R_MCP_LOCAL === 'true';
      const o3r = new McpStdioServerDefinition(
        'o3r',
        isLocal ? 'yarn' : 'npx',
        isLocal ? ['node', './tools/@o3r/mcp/dist/src/cli/index.js'] : ['-y', '-p', '@o3r/mcp', 'o3r-mcp-start'],
        {
          O3R_MCP_CACHE_PATH: mcpConfiguration.get<string>('cacheFolderPath') || null,
          O3R_MCP_CACHE_MAX_AGE: mcpConfiguration.get<number>('cacheMaxAge')?.toString() || null
        }
      );
      if (isLocal && process.env.O3R_DIRECTORY) {
        o3r.cwd = Uri.parse(process.env.O3R_DIRECTORY);
      }
      return [
        o3r,
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
      ];
    }
  });
};
