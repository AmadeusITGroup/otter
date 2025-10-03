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

export const mcpConfig = (didChangeEmitter: EventEmitter<void>, channel: OutputChannel): Parameters<typeof lm.registerMcpServerDefinitionProvider>[1] => ({
  onDidChangeMcpServerDefinitions: didChangeEmitter.event,
  resolveMcpServerDefinition: async (server) => {
    if (isO3rMcpServer(server)) {
      const session = await authentication.getSession(
        'github',
        ['repo', 'read:user'],
        { createIfNone: true }
      );
      let githubOrg = workspace.getConfiguration('otter.mcp').get<string>('githubOrg');
      if (!githubOrg) {
        githubOrg = await window.showInputBox({
          prompt: 'Please enter the GitHub organization to use for Otter MCP'
        });
        workspace.getConfiguration('otter.mcp').update('githubOrg', githubOrg);
      }
      channel.appendLine(`Hello ${session?.account.label}, using the organization ${githubOrg}`);

      server.env.GITHUB_TOKEN = session.accessToken || null;
      server.env.GITHUB_ORG = githubOrg || null;
    }
    return server;
  },
  provideMcpServerDefinitions: () => [
    new McpStdioServerDefinition(
      'o3r',
      'npx',
      ['-y', '-p', '@o3r/mcp', 'o3r-mcp-start']
    ),
    new McpStdioServerDefinition(
      'angular',
      'npx',
      ['@angular/cli', 'mcp']
    ),
    new McpStdioServerDefinition(
      'o3r-docs',
      'npx',
      [
        '-y',
        '@buger/docs-mcp',
        '--gitUrl', 'https://github.com/AmadeusITGroup/otter',
        '--toolName', 'search_otter_docs',
        '--toolDescription', 'Search in Otter documentation using the probe search engine.'
      ]
    )
  ]
});
