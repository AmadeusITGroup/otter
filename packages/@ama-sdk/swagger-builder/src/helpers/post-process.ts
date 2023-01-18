import { AwsCompatConverter } from '../core/post-processes/aws-compat';
import { PathsBlacklister } from '../core/post-processes/blacklist-paths';
import { FlagDefinition } from '../core/post-processes/flag-definition';
import { FlattenConflictedAllOf } from '../core/post-processes/flatten-conflicted-allof';
import { PropagateXvendor } from '../core/post-processes/propagate-xvendor';
import { ResolveDiscriminator } from '../core/post-processes/resolve-discriminator';
import { TreeShaker } from '../core/post-processes/tree-shaker';
import { Validator } from '../core/post-processes/validate';
import { PathsWhitelister } from '../core/post-processes/whitelist-paths';
import { BuilderConfiguration } from '../interfaces/builder-configuration';

/**
 * Apply post processing to a full swagger spec if needed
 *
 * @param configuration Build configuration
 * @param swaggerSpec Swagger spec consolidated
 */
export async function applyPostProcess(configuration: BuilderConfiguration, swaggerSpec: any) {
  if (configuration.pathsBlackList) {
    const blacklister = new PathsBlacklister(configuration.pathsBlackList);
    swaggerSpec = await blacklister.execute(swaggerSpec);
  }

  if (configuration.pathsWhiteList) {
    const whitelister = new PathsWhitelister(configuration.pathsWhiteList);
    swaggerSpec = await whitelister.execute(swaggerSpec);
  }

  if (configuration.treeShaking || configuration.pathsBlackList || configuration.pathsWhiteList) {
    const treeShaker = new TreeShaker();
    swaggerSpec = await treeShaker.execute(swaggerSpec, configuration.treeShakingStrategy);
  }

  if (configuration.awsCompat) {
    const awsCompatConverter = new AwsCompatConverter();
    swaggerSpec = await awsCompatConverter.execute(swaggerSpec);
  }

  if (configuration.validation) {
    const validator = new Validator();
    swaggerSpec = await validator.execute(swaggerSpec);
  }

  if (configuration.flattenConflictedDefinition) {
    const flatterConflict = new FlattenConflictedAllOf();
    swaggerSpec = await flatterConflict.execute(swaggerSpec);
  }

  if (configuration.flagDefinition) {
    const flagDefinition = new FlagDefinition();
    swaggerSpec = await flagDefinition.execute(swaggerSpec);
  }

  if (configuration.buildMdkSpec) {
    const propagateFlag = new PropagateXvendor('x-api-ref');
    swaggerSpec = await propagateFlag.execute(swaggerSpec);
    const resolveDiscriminator = new ResolveDiscriminator();
    swaggerSpec = await resolveDiscriminator.execute(swaggerSpec);
  }

  return swaggerSpec;
}
