import type {
  BasePathServer,
} from './core';
import type {
  Logger,
} from './logger';

/** Variable used in server URL */
export interface ServerVariable {
  /** Variable possible values */
  enumValues?: string[];
  /** Description of the variable */
  description?: string;
  /** Default value */
  defaultValue?: string;
}

/** Server as described by the OpenAPI specification */
export interface Server {
  /** URL of the server */
  url: string;
  /** Description of the server */
  description?: string;
  /** Variable which can be used in the URL */
  variables?: Record<string, ServerVariable>;
}

/**
 * Select the server URL to use based on the provided basePathServer configuration
 * @param clientServerConfigurations basePath and server configuration to use for the request
 * @param servers List of servers defined in the specification
 * @param logger Logger to use to report messages
 * @returns The selected server URL
 */
export const selectServerBasePath = (clientServerConfigurations: BasePathServer, servers?: Server[], logger?: Logger): string => {
  const { basePath, server, defaultBasePath } = clientServerConfigurations;
  if (basePath) {
    logger?.debug?.('Using basePath from client configuration');
    return basePath;
  }

  if (!servers || servers.length === 0) {
    logger?.debug?.(`No server configuration provided and no server defined in the API, using default basePath "${defaultBasePath || ''}"`);
    return defaultBasePath || '';
  }

  let matchingServer = servers?.[server?.index || 0];
  if (!matchingServer) {
    logger?.warn?.(`No server matching at index "${server?.index || 0}" has been found in the API, using the first server`);
    matchingServer = servers[0];
  }

  return Object.entries(matchingServer.variables || {})
    .reduce((acc, [variableName, variable]) => {
      let variableValue = server?.variables?.[variableName] ?? variable.defaultValue;
      if (variableValue === undefined) {
        logger?.warn(`No value provided for server variable "${variableName}", using empty string as default`);
        variableValue = '';
      }
      if (variable.enumValues && variable.enumValues.length > 0 && variableValue && !variable.enumValues.includes(variableValue)) {
        logger?.warn(`Value "${variableValue}" provided for server variable "${variableName}" is not in the allowed enum [${variable.enumValues.join(', ')}]`
          + `, using value "${variable.defaultValue || variable.enumValues[0]}" instead`);
        variableValue = variable.defaultValue || variable.enumValues[0];
      }
      return acc.replaceAll(`{${variableName}}`, variableValue);
    }, matchingServer.url);
};
