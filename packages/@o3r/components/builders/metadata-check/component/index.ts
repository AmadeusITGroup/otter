import {
  type BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  checkMetadataBuilder,
  createBuilderWithMetricsIfInstalled,
} from '@o3r/extractors';
import {
  componentMetadataComparator,
} from './helpers/component-metadata-comparison.helper';
import type {
  ComponentMigrationMetadataCheckBuilderSchema,
} from './schema';

export default createBuilder<ComponentMigrationMetadataCheckBuilderSchema>(createBuilderWithMetricsIfInstalled((options, context): Promise<BuilderOutput> => {
  return checkMetadataBuilder({ ...options, packageJsonEntry: 'componentFilePath' }, context, componentMetadataComparator);
}));
