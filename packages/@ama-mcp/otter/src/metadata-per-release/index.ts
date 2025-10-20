import {
  createWriteStream,
  existsSync,
} from 'node:fs';
import {
  mkdir,
  readFile,
  rm,
} from 'node:fs/promises';
import {
  tmpdir,
} from 'node:os';
import {
  dirname,
  resolve,
} from 'node:path';
import {
  pipeline,
} from 'node:stream/promises';
import {
  type CacheToolOptions,
  type Logger,
  resourceRegistry,
  type ResourceToolOptions,
  type ToolDefinition,
} from '@ama-mcp/core';
import {
  CacheManager,
  MCPLogger,
} from '@ama-mcp/core';
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  tgz,
} from 'compressing';
import {
  sync as globby,
} from 'globby';
import {
  z,
} from 'zod';

/**
 * Options for the tool metadata per release
 */
export interface MetadataPerReleaseOptions extends ToolDefinition, ResourceToolOptions, CacheToolOptions {
  /**
   * Returns the list of package names
   */
  retrievePackages: () => Promise<string[]>;
  /**
   * Returns the list of tags for a package name
   */
  retrieveTags: (packageName: string) => Promise<string[]>;
  /**
   * Returns the response of a request that returns the tgz artifact of the package
   */
  fetchPackageArtifact: (packageName: string, tagName: string) => Promise<Response>;
}

enum MetadataType {
  LOCALIZATION = 'localization',
  CONFIGURATION = 'configuration',
  COMPONENT = 'component',
  RULES_ENGINE_FACT = 'fact',
  RULES_ENGINE_OPERATOR = 'operator',
  STYLING = 'styling'
}

const METADATA_TYPE_LIST = Object.values(MetadataType);

const METADATA_FILE_NAME: Record<MetadataType, string> = {
  [MetadataType.LOCALIZATION]: 'localisation.metadata.json',
  [MetadataType.CONFIGURATION]: 'component.config.metadata.json',
  [MetadataType.COMPONENT]: 'component.class.metadata.json',
  [MetadataType.RULES_ENGINE_FACT]: 'rules.facts.metadata.json',
  [MetadataType.RULES_ENGINE_OPERATOR]: 'rules.operators.metadata.json',
  [MetadataType.STYLING]: 'styling.metadata.json'
};

type CacheEntry = {
  [metadataType: string]: string;
};

const cacheEntrySeparator = '::';
const getCacheEntryKey = (packageName: string, tagName: string) => `${packageName}${cacheEntrySeparator}${tagName}`;
const getPackageAndTagFromKey = (key: string) => key.split(cacheEntrySeparator);

const getUriFactory = (options: ResourceToolOptions) => (
  packageName: string,
  tagName: string,
  metadataType: string
) => `${options.uriPrefix}://metadata/${packageName.replace(/^@[/]+\//, '')}/${tagName}/${metadataType}`;

const toArray = (value: string | string[]) => Array.isArray(value) ? value : [value];

const extractPackageArtifactFactory = (
  fetchPackageArtifact: MetadataPerReleaseOptions['fetchPackageArtifact'],
  logger: Logger
) => {
  const archiveDir = tmpdir();
  const extractDir = tmpdir();
  return async (
    packageName: string,
    tagName: string
  ) => {
    const response = await fetchPackageArtifact(packageName, tagName);
    const tgzFilePath = resolve(archiveDir, `${packageName}-${tagName}.tgz`);
    if (!existsSync(dirname(tgzFilePath))) {
      await mkdir(dirname(tgzFilePath), { recursive: true });
    }
    const extractPath = resolve(extractDir, `${packageName}-${tagName}`);
    if (!existsSync(dirname(extractPath))) {
      await mkdir(dirname(extractPath), { recursive: true });
    }
    if (!response.ok) {
      logger.error?.(`Failed to download package artifact for ${packageName}@${tagName}: ${response.status} ${response.statusText}`);
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    if (!response.body) {
      logger.error?.(`No body stream in response when downloading package artifact for ${packageName}@${tagName}`);
      throw new Error('Response has no body stream');
    }
    // Stream to file to avoid buffering the entire archive in memory
    await pipeline(response.body, createWriteStream(tgzFilePath));
    await tgz.uncompress(tgzFilePath, extractPath);
    void rm(tgzFilePath);

    return extractPath;
  };
};

const retrieveAllMetadata = async (
  onMetadataRetrieved: (packageName: string, tagName: string, metadataType: string, content: string) => Promise<void>,
  options: MetadataPerReleaseOptions,
  cacheManager: CacheManager<CacheEntry>,
  logger: Logger
) => {
  const { retrievePackages, fetchPackageArtifact, retrieveTags } = options;
  const packageNames = await retrievePackages();
  const extractPackageArtifact = extractPackageArtifactFactory(fetchPackageArtifact, logger);
  return Promise.allSettled(packageNames.map(async (packageName) => {
    const tags = await retrieveTags(packageName);
    return Promise.allSettled(tags.map(async (tagName) => {
      if (!cacheManager.isExpired(getCacheEntryKey(packageName, tagName))) {
        return;
      }
      const extractPath = await extractPackageArtifact(packageName, tagName);

      return Promise.allSettled(METADATA_TYPE_LIST.map(async (metadataType) => {
        const [metadataFile] = globby(`**/${METADATA_FILE_NAME[metadataType]}`, { cwd: extractPath, absolute: true });
        if (!metadataFile) {
          return;
        }
        // Store minified content to avoid unnecessary differences due to formatting
        const content = JSON.stringify(JSON.parse(await readFile(metadataFile, { encoding: 'utf8' })));
        return onMetadataRetrieved(packageName, tagName, metadataType, content);
      }));
    }));
  }));
};

/**
 * Registers the metadata per release resource template and tool on the MCP server.
 * @param server
 * @param options
 */
export async function registerMetadataPerRelease(
  server: McpServer,
  options: MetadataPerReleaseOptions
) {
  const logger = options.logger ?? new MCPLogger('metadata_per_release', options.logLevel);
  const cacheManager = new CacheManager<CacheEntry>(options);
  await cacheManager.initialize();
  const getUri = getUriFactory(options);
  cacheManager.forEach((key, entry) => {
    const [packageName, tagName] = getPackageAndTagFromKey(key);
    Object.entries(entry || {}).forEach(([metadataType, content]) => {
      const resourceUri = getUri(packageName, tagName, metadataType);
      resourceRegistry.set(resourceUri, content);
    });
  });

  void retrieveAllMetadata(
    (packageName, tagName, metadataType, content) => {
      const cacheEntryKey = getCacheEntryKey(packageName, tagName);
      const cachedEntry = cacheManager.get(cacheEntryKey);
      const entry: CacheEntry = {
        ...cachedEntry,
        [metadataType]: content
      };
      resourceRegistry.set(getUri(packageName, tagName, metadataType), content);
      return cacheManager.set(cacheEntryKey, entry);
    },
    options,
    cacheManager,
    logger
  );

  server.registerResource(
    'metadata per release',
    new ResourceTemplate(
      getUri('{packageName}', '{tagName}', '{metadataType}'),
      {
        list: undefined,
        complete: {
          packageName: (userInput) => {
            return cacheManager.getEntries()
              .filter(([key, entry]) =>
                Object.keys(entry).length > 0
                && key.split(cacheEntrySeparator)[0]?.toLowerCase().includes(userInput.toLowerCase())
              ).map(([key]) => key.split(cacheEntrySeparator)[0]);
          },
          tagName: (userInput, params) => {
            const packageName = params?.arguments?.packageName;
            return packageName
              ? cacheManager.getEntries()
                .filter(([key, entry]) =>
                  Object.keys(entry).length > 0
                  && key.startsWith(packageName)
                  && key.split(cacheEntrySeparator)[1]?.toLowerCase().includes(userInput.toLowerCase())
                ).map(([key]) => key.split(cacheEntrySeparator)[1])
              : [];
          },
          metadataType: (userInput, params) => {
            const { packageName, tagName } = params?.arguments || {};
            return Object.keys(cacheManager.get(getCacheEntryKey(packageName, tagName)) || {})
              .filter((type) =>
                type.toLowerCase().includes(userInput.toLowerCase())
              );
          }
        }
      }
    ),
    {
      description: 'Metadata associated to a specific release of an application',
      mimeType: 'application/json'
    },
    (uri, params) => {
      const packageNames = toArray(params.packageName);
      const tagNames = toArray(params.tagName);
      const metadataTypes = toArray(params.metadataType);
      const allPossibleCombinations = packageNames.flatMap((packageName) => tagNames.flatMap((tagName) => metadataTypes.map((metadataType) => [packageName, tagName, metadataType])));

      return {
        contents: allPossibleCombinations.map(([packageName, tagName, metadataType]) => {
          const content = resourceRegistry.get(getUri(packageName, tagName, metadataType));
          logger.debug?.(`Providing metadata for package=${packageName}, tag=${tagName}, type=${metadataType}: ${content}`);
          return (
            {
              uri: uri.href,
              // Format for readability
              text: JSON.stringify(JSON.parse(content!), null, 2),
              mimeType: 'application/json'
            }
          );
        })
      };
    }
  );

  server.registerTool(
    'metadata_per_release_tool',
    {
      title: 'Metadata per release tool',
      description: 'Tool to fetch metadata associated to a specific release of an application',
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      },
      inputSchema: {
        packageName: z.string().describe('The name of the package. Format: app-name for @scope/app-name'),
        tagName: z.string().describe('The tag name of the release'),
        metadataType: z.enum(METADATA_TYPE_LIST as [MetadataType, ...MetadataType[]])
          .describe('The type of metadata to fetch')
      },
      outputSchema: {
        metadata: z.any().describe('The metadata associated to the specified release')
      }
    },
    ({ packageName, tagName, metadataType }) => {
      const uri = getUri(packageName, tagName, metadataType);
      const metadataContent = resourceRegistry.get(uri);
      if (!metadataContent) {
        throw new Error(`Metadata not found for packageName=${packageName}, tagName=${tagName}, metadataType=${metadataType}`);
      }
      return {
        content: [{
          type: 'text',
          // Format for readability
          text: JSON.stringify(JSON.parse(resourceRegistry.get(uri)!), null, 2)
        }, {
          type: 'resource_link',
          name: `Metadata for ${packageName} ${tagName} ${metadataType}`,
          uri
        }],
        structuredContent: {
          metadata: JSON.parse(metadataContent)
        }
      };
    }
  );
}
