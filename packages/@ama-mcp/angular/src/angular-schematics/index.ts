import {
  execFile,
} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  promisify,
} from 'node:util';
import {
  type Logger,
  MCPLogger,
  type ToolDefinition,
} from '@ama-mcp/core';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  z,
} from 'zod';

/**
 * Options for the tool angular_schematics
 * @experimental
 */
export interface AngularSchematicOptions extends ToolDefinition {
  /**
   * Path where command to retrieve schematics info will be run
   */
  cwd?: string;
}

const schematicsOutputSchema = z.array(z.object({
  name: z.string(),
  description: z.string().optional(),
  options: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    defaultValue: z.boolean().or(z.string()).or(z.number()).optional(),
    choices: z.array(z.string()).optional()
  })),
  args: z.array(z.object({
    name: z.string(),
    description: z.string().optional()
  }))
}));

type SchematicsOutput = z.infer<typeof schematicsOutputSchema>;

async function run(cmd: string, args: string[], cwd: string, logger: Logger): Promise<string> {
  logger.debug?.(`Running command: ${cmd} ${args.join(' ')} in ${cwd}`);
  const { stdout } = await promisify(execFile)(cmd, args, { cwd });
  logger.debug?.(`Command output: \n${stdout}`);
  return stdout;
}

function getBlock(lines: string[], blockName: string) {
  const startIndex = lines.findIndex((l) => l.startsWith(`${blockName}:`));
  if (startIndex === -1) {
    return [];
  }
  const nextLines = lines.slice(startIndex + 1);
  const endIndex = nextLines.findIndex((l) => /^\w+:$/.test(l));
  return endIndex === -1 ? nextLines : nextLines.slice(0, endIndex);
}

function parseSchematicHelp(output: string): Omit<SchematicsOutput[number], 'name'> {
  const [, schematicDescription, ...lines] = output
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0); // ignore empty lines

  const argumentsLines = getBlock(lines, 'Arguments');

  const args = argumentsLines.map((line) => {
    // Line example: `argument Description of the argument`
    const m = line.match(/^([\w-]+)(?:\s+(.*))?$/);
    if (!m) {
      return;
    }
    const [, name, argumentDescription] = m;
    return { name, description: argumentDescription.trim() };
  }).filter((arg) => !!arg);

  const optionsLines = getBlock(lines, 'Options');
  const options = optionsLines.map((line) => {
    // Line example: `-o --option Description of the option [type] [choices: "a", "b", "c"] [default: "a"]`
    const m = line.match(/--([\w-]+)(?:\s+([^[]*))?/);
    if (!m) {
      return;
    }
    const [match, name, optionsDescription] = m;
    const lineRest = line.slice((m.index || 0) + match.length);
    const typeMatch = lineRest.match(/\[(boolean|string|number)\]/);
    const type = typeMatch ? typeMatch[1] : 'unknown';
    const defaultValueMatch = lineRest.match(/\[default:\s*([^\]]+)\]/);
    let defaultValue: any;
    if (defaultValueMatch) {
      defaultValue = /^(".*"|'.*')$/.test(defaultValueMatch[1])
        ? defaultValueMatch[1].slice(1, -1)
        : JSON.parse(defaultValueMatch[1]);
    }
    const choicesMatch = lineRest.match(/\[choices:\s*([^\]]+)\]/);
    let choices: string[] | undefined;
    if (choicesMatch) {
      choices = choicesMatch[1].split(',').map((s) => s.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'));
    }

    return { name, type, description: optionsDescription.trim(), defaultValue, choices };
  }).filter((opt) => !!opt);

  return {
    description: schematicDescription.trim(),
    options,
    args
  };
}

async function discoverSchematics(options: AngularSchematicOptions, logger: Logger) {
  const {
    cwd = process.cwd()
  } = options;
  const useYarn = fs.existsSync(path.join(cwd, 'yarn.lock'));

  if (useYarn) {
    const output = await run('yarn', ['--version'], cwd, logger);
    const majorVersion = Number.parseInt(output.split('.')[0], 10);
    try {
      await run('yarn', majorVersion >= 2 ? ['node', '-e', `"require('@angular/cli')"`] : ['list', '--depth=0'], cwd, logger);
    } catch {
      await run('yarn', [majorVersion >= 2 ? '--immutable' : '--frozen-lockfile'], cwd, logger);
    }
  } else {
    try {
      await run('npm', ['ls', '--depth=0'], cwd, logger);
    } catch {
      await run('npm', ['ci'], cwd, logger);
    }
  }

  const baseCmd = useYarn ? 'yarn' : 'npx';
  const baseArgs = ['ng', 'g'];

  let schematicsOutput = '';
  try {
    schematicsOutput = await run(baseCmd, [...baseArgs, '--help'], cwd, logger);
  } catch (e: any) {
    logger.error?.('Failed to retrieve list of schematics', e);
    return { schematics: [] };
  }

  const schematicNames = Array.from(schematicsOutput.matchAll(/ng g ([\w-]+)/g)).map((match) => match[1]);
  logger.debug?.(`Found ${schematicNames.length} schematics`);

  const schematics = (await Promise.allSettled(schematicNames.map(async (name) => {
    let output = '';
    try {
      output = await run(baseCmd, [...baseArgs, name, '--help'], cwd, logger);
    } catch (e: any) {
      logger.error?.(`Failed to retrieve options for schematic ${name}`, e);
      throw e;
    }
    return { ...parseSchematicHelp(output), name } as SchematicsOutput[number];
  })))
    .filter((r): r is PromiseFulfilledResult<SchematicsOutput[number]> => r.status === 'fulfilled')
    .map((r) => r.value);

  return { schematics };
}

/**
 * Register the tool angular_schematics
 * @param server
 * @param options
 * @experimental
 */
export function registerAngularSchematicsTool(server: McpServer, options: AngularSchematicOptions) {
  const {
    toolName = 'angular_schematics',
    toolDescription = 'List Angular schematics (ng generate) and their basic options.',
    toolTitle = 'Angular schematics'
  } = options;
  const logger = options.logger ?? new MCPLogger(toolName, options.logLevel);
  if (fs.existsSync(path.join(options.cwd || process.cwd(), 'nx.json'))) {
    logger.info?.('Skipping Angular schematics tool registration as this seems to be an Nx workspace');
    return;
  }
  const discovery = discoverSchematics(options, logger);

  server.registerTool(
    toolName,
    {
      title: toolTitle,
      description: toolDescription,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      },
      inputSchema: {
        schematic: z.string().optional().describe('Specific schematic name')
      },
      outputSchema: {
        schematics: schematicsOutputSchema
      }
    },
    async (inputs) => {
      const { schematics } = await discovery;
      const schematic = inputs.schematic?.toLowerCase().replace(/^@?[\w-/]+:/, '');
      const list = schematic ? schematics.filter((s) => s.name.toLowerCase() === schematic) : schematics;
      return {
        content: [{
          type: 'text',
          text: `Found ${list.length} schematic${list.length === 1 ? '' : 's'}${schematic ? ` matching "${schematic}"` : ''}.\n`
            + list.map((s) => `- ${s.name}: ${s.description}`).join('\n')
        }],
        structuredContent: {
          schematics: list
        }
      };
    });
}
