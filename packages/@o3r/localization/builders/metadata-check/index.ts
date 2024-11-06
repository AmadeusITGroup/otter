import {
  type BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import {
  checkMetadataBuilder,
  createBuilderWithMetricsIfInstalled
} from '@o3r/extractors';
import {
  localizationMetadataComparator
} from './helpers';
import type {
  LocalizationMigrationMetadataCheckBuilderSchema
} from './schema';

export default createBuilder<LocalizationMigrationMetadataCheckBuilderSchema>(createBuilderWithMetricsIfInstalled((options, context): Promise<BuilderOutput> => {
  return checkMetadataBuilder({ ...options, packageJsonEntry: 'localizationFilePath' }, context, localizationMetadataComparator);
}));
