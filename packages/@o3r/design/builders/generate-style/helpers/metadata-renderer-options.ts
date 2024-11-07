import {
  resolve,
} from 'node:path';
import type {
  BuilderContext,
} from '@angular-devkit/architect';
import {
  type DesignTokenRendererOptions,
  getMetadataStyleContentUpdater,
  getMetadataTokenDefinitionRenderer,
  type TokenKeyRenderer,
} from '../../../src/public_api';
import type {
  GenerateStyleSchematicsSchema,
} from '../schema';

export const getMetadataRenderDesignTokenOptions = (
  tokenVariableNameRenderer: TokenKeyRenderer | undefined,
  options: GenerateStyleSchematicsSchema,
  context: BuilderContext
): DesignTokenRendererOptions => {
  /** Builder logger */
  const logger = context.logger;

  return {
    determineFileToUpdate: () => resolve(context.workspaceRoot, options.metadataOutput || 'style.metadata.json'),
    styleContentUpdater: getMetadataStyleContentUpdater(),
    tokenDefinitionRenderer: getMetadataTokenDefinitionRenderer({
      tokenVariableNameRenderer,
      ignorePrivateVariable: options.metadataIgnorePrivate
    }),
    logger
  };
};
