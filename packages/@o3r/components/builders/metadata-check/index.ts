import {
  type BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import {
  checkMetadataBuilder,
  createBuilderWithMetricsIfInstalled
} from '@o3r/extractors';
import {
  configMetadataComparator
} from './helpers/config-metadata-comparison.helper';
import type {
  ConfigMigrationMetadataCheckBuilderSchema
} from './schema';

export default createBuilder<ConfigMigrationMetadataCheckBuilderSchema>(createBuilderWithMetricsIfInstalled((options, context): Promise<BuilderOutput> => {
  return checkMetadataBuilder({ ...options, packageJsonEntry: 'configurationFilePath' }, context, configMetadataComparator);
}));
