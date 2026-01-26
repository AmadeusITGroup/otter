import type {
  LogLevel,
} from '@ama-openapi/core';
import {
  type Plugin,
} from '@redocly/openapi-core';
import {
  config,
} from 'dotenv';
import {
  ENVIRONMENT_VARIABLE_PREFIX,
} from './constants.mjs';
import {
  DECORATOR_ID_REDIRECT_REF,
  redirectRefsDecorator,
} from './plugins/decorators/common/replace-refs/replace-refs.decorator.mjs';
import {
  DECORATOR_ID_REMOVE_UNUSED_COMPONENTS,
  removeUnusedComponentsDecorator,
} from './plugins/decorators/oas3/remove-unused-components/remove-unused-components.decorator.mjs';
import {
  retrieveDependency,
  type RetrieveDependencyOptions,
} from './plugins/meta/retrieve-dependency.meta.mjs';

const DEFAULT_OPTIONS: LogLevel = 'error';

/** Options for ama-openapi plugin */
export interface AmaOpenapiPluginOptions extends Partial<RetrieveDependencyOptions> {
}

/**
 * Ama OpenAPI {@link https://redocly.com/docs/cli/custom-plugins | Redocly Plugin}
 * @param options
 */
export const amaOpenapiPlugin = async (options?: AmaOpenapiPluginOptions): Promise<Plugin> => {
  config({ override: true, quiet: true });

  const {
    [`${ENVIRONMENT_VARIABLE_PREFIX}_VERBOSE`]: verbose,
    [`${ENVIRONMENT_VARIABLE_PREFIX}_QUIET`]: quiet,
    [`${ENVIRONMENT_VARIABLE_PREFIX}_CONTINUE_ON_ERROR`]: continueOnError
  } = process.env;

  await retrieveDependency({
    logLevel: verbose === 'true' ? 'debug' : (options?.logLevel ?? DEFAULT_OPTIONS),
    quiet: quiet ? quiet === 'true' : options?.quiet ?? false,
    continueOnError: continueOnError ? continueOnError === 'true' : options?.continueOnError ?? false
  });

  return {
    id: 'ama-openapi',
    decorators: {
      oas2: {
        [DECORATOR_ID_REDIRECT_REF]: redirectRefsDecorator
      },
      oas3: {
        [DECORATOR_ID_REDIRECT_REF]: redirectRefsDecorator,
        [DECORATOR_ID_REMOVE_UNUSED_COMPONENTS]: removeUnusedComponentsDecorator
      },
      async2: {
        [DECORATOR_ID_REDIRECT_REF]: redirectRefsDecorator
      },
      async3: {
        [DECORATOR_ID_REDIRECT_REF]: redirectRefsDecorator
      }
    }
  };
};
