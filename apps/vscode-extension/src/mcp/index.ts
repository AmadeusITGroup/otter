import {
  authentication,
  type EventEmitter,
  lm,
  McpServerDefinition,
  McpStdioServerDefinition,
  type OutputChannel,
  window,
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
        let githubOrg = mcpConfiguration.get<string>('githubOrg');
        if (!githubOrg) {
          githubOrg = await window.showInputBox({
            prompt: 'Please enter the GitHub organization to use for Otter MCP'
          });
          mcpConfiguration.update('githubOrg', githubOrg);
        }
        channel.appendLine(`Hello ${session?.account.label}, using the organization ${githubOrg}`);

        server.env.O3R_MCP_GITHUB_TOKEN = session.accessToken || null;
        server.env.O3R_MCP_GITHUB_ORG = githubOrg || null;
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
