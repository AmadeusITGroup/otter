import {
  existsSync,
  promises as fs,
} from 'node:fs';
import {
  dirname,
  resolve,
} from 'node:path';
import {
  env,
} from 'node:process';
import {
  fileURLToPath,
} from 'node:url';
import {
  Ajv,
} from 'ajv';
import {
  load,
} from 'js-yaml';
import type {
  Logger,
} from '../logger.mjs';

/**
 * Registry URL configuration interface
 */
interface RegistryUrl {
  /** URL of the registry */
  url: string;
}

/**
 * Registry authToken authentication interface
 */
export interface RegistryAuthToken {
  /** Authentication token for the registry */
  authToken: string;
}

/**
 * Registry basic authentication interface
 */
export interface RegistryAuthBasic {
  /** User used for login */
  user?: string;

  /** User password */
  password: string;
}

/**
 * Registry configuration interface
 */
export type Registry = RegistryUrl & (RegistryAuthToken | RegistryAuthBasic);

/**
 * Registry identification interface
 */
export interface ManifestAuth {
  /** Array of registry configurations */
  registries: Registry[];
}

/** Manifest file for registry authentication */
export const MANIFEST_AUTH_FILENAME = 'manifest-auth';

/**
 * Prefix of the Environment Variable to define registry
 * @example
 * ```bash
 * AMA_OPENAPI_REGISTRY_0_URL=https://my-registry.com
 * AMA_OPENAPI_REGISTRY_0_AUTH_TOKEN=my-token
 *
 * AMA_OPENAPI_REGISTRY_1_URL=https://my-registry-2.com
 * AMA_OPENAPI_REGISTRY_1_USER=myUserName
 * AMA_OPENAPI_REGISTRY_1_PASSWORD=myPassword
 * ```
 */
export const ENV_VAR_REGISTRY_PREFIX = 'AMA_OPENAPI_REGISTRY_';

/** Commands to define registry in Environment Variable */
export const ENV_VAR_REGISTRY_COMMANDS = {
  URL: 'url',
  USER: 'user',
  PASSWORD: 'password',
  AUTH_TOKEN: 'authToken'
} as const satisfies { [x: string]: keyof (RegistryUrl & RegistryAuthToken & RegistryAuthBasic) };

/**
 * Validate the manifest authentication file
 * @param manifest
 * @param logger
 */
const validateManifestAuth = async (manifest: ManifestAuth, logger: Logger) => {
  const ajv = new Ajv();
  const schemaPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'schemas', 'manifest.schema.json');
  const schema = JSON.parse(await fs.readFile(schemaPath, { encoding: 'utf8' }));
  const validate = ajv.compile(schema);
  const isValid = validate(manifest);

  if (!isValid) {
    logger.error(`${MANIFEST_AUTH_FILENAME} is invalid. Errors:`);
    logger.error(validate.errors);
    throw new Error(`Invalid manifest`);
  }
};

/**
 * Read registry configuration from environment variables
 */
const readFromEnv = (): Registry[] => {
  const registryConfig = Object.groupBy(
    Object.entries(env)
      .filter(([key]) => key.startsWith(ENV_VAR_REGISTRY_PREFIX)),
    ([key]) => key.substring(ENV_VAR_REGISTRY_PREFIX.length).split('_')[0]
  );

  return Object.values(registryConfig)
    .map((configs) =>
      configs && Object.fromEntries(
        configs.map((config) => {
          const [envVarKey, value] = config || [];
          return [
            Object.entries(ENV_VAR_REGISTRY_COMMANDS).find(([key]) => envVarKey?.endsWith(key))?.[1],
            value
          ];
        })
        .filter(([key]) => !!key)
      )
    ).filter((registry): registry is Registry => !!registry);
};

/**
 * Check if the object is {@link RegistryAuthToken}
 * @param obj
 */
export const isAuthToken = (obj: any): obj is RegistryAuthToken => obj && typeof obj === 'object' && obj.authToken;
/**
 * Check if the object is {@link RegistryAuthBasic}
 * @param obj
 */
export const isAuthBasic = (obj: any): obj is RegistryAuthBasic => obj && typeof obj === 'object' && obj.password;


/**
 * Retrieve Manifest authentication file
 * @param currentDirectory
 * @param logger
 */
export const retrieveManifestAuth = async (currentDirectory: string, logger: Logger = console): Promise<ManifestAuth> => {
  const jsonFilePath = resolve(currentDirectory, `${MANIFEST_AUTH_FILENAME}.json`);
  const yamlFilePath = resolve(currentDirectory, `${MANIFEST_AUTH_FILENAME}.yaml`);
  let manifestAuth: ManifestAuth | undefined;

  if (existsSync(jsonFilePath)) {
    logger.info(`Use the ${MANIFEST_AUTH_FILENAME} file ${jsonFilePath}`);
    manifestAuth = JSON.parse(await fs.readFile(jsonFilePath, { encoding: 'utf8' }));
  } else if (existsSync(yamlFilePath)) {
    logger.info(`Use the ${MANIFEST_AUTH_FILENAME} file ${yamlFilePath}`);
    manifestAuth = load(await fs.readFile(yamlFilePath, { encoding: 'utf8' }), {}) as ManifestAuth;
  }

  if (manifestAuth) {
    await validateManifestAuth(manifestAuth, logger);
    return {
      ...manifestAuth,
      registries: [
        ...manifestAuth.registries,
        ...readFromEnv()
      ].filter(({url}, idx, arr) => !arr.slice(idx + 1).some(({url: nextUrl}) => nextUrl === url))
    };
  }

  const parent = dirname(currentDirectory);
  if (currentDirectory === parent) {
    return {
      registries: readFromEnv()
    };
  }

  return retrieveManifestAuth(parent, logger);
};
