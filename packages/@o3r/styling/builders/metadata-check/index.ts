import { type BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { checkMetadataBuilder, createBuilderWithMetricsIfInstalled } from '@o3r/extractors';
import { stylingMetadataComparator } from './helpers';
import type { StylingMigrationMetadataCheckBuilderSchema } from './schema';

export default createBuilder<StylingMigrationMetadataCheckBuilderSchema>(createBuilderWithMetricsIfInstalled((options, context): Promise<BuilderOutput> => {
  return checkMetadataBuilder(options, context, stylingMetadataComparator);
}));
