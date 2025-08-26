import {
  type EventEmitter,
  McpStdioServerDefinition,
} from 'vscode';

export const mcpConfig = (didChangeEmitter: EventEmitter<void>) => ({
  onDidChangeMcpServerDefinitions: didChangeEmitter.event,
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
