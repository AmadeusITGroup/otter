import {
  type BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  checkMetadataBuilder,
  createBuilderWithMetricsIfInstalled,
} from '@o3r/extractors';
import {
  ruleFactMetadataComparator,
} from './helpers';
import type {
  RuleFactMigrationMetadataCheckBuilderSchema,
} from './schema';

export default createBuilder<RuleFactMigrationMetadataCheckBuilderSchema>(createBuilderWithMetricsIfInstalled((options, context): Promise<BuilderOutput> => {
  return checkMetadataBuilder({ ...options, packageJsonEntry: 'rulesEngineFactsFilePath' }, context, ruleFactMetadataComparator);
}));
