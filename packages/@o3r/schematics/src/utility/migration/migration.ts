import type {
  LoggerApi,
} from '@angular-devkit/core/src/logger';
import {
  chain,
  type Rule,
} from '@angular-devkit/schematics';
import {
  intersects,
  Range,
  validRange,
} from 'semver';

/** Create the migration  */
interface MigrateRuleRunnerOptions {
  /** The original version from which to execute the rules */
  from: string;

  /**
   * The last version for which to execute the rule.
   * If not specified, all the versions from the "from" parameter will be considered.
   */
  to?: string;
}

/** Mapping of rules to apply to its specific range */
export interface MigrationRulesMap {
  /** Rules to apply to a specific semver range */
  [range: string]: Rule | Rule[];
}

/**
 * Option for migration rule runner factory
 */
interface MigrationRuleRunnerOptions {
  /** Logger */
  logger?: LoggerApi;
}

/**
 * Generate the Migration Rule Schematic runner to execute rules according to the range
 * @param rulesMapping Mapping of rules to execute based on its semver range
 * @param options Additional options
 */
export function getMigrationRuleRunner(rulesMapping: MigrationRulesMap, options?: MigrationRuleRunnerOptions) {
  const rangeMapping = Object.entries(rulesMapping)
    .reduce((acc, [range, rule]) => {
      const checkedRange = validRange(range);
      if (checkedRange) {
        acc.push([checkedRange, Array.isArray(rule) ? rule : [rule]]);
      } else {
        options?.logger?.warn(`The range "${range}" is invalid and will be ignored in the Migration rule`);
      }
      return acc;
    }, [] as [string, Rule[]][]);

  /**
   * Migration rule runner
   * @param config Provide information regarding the range to match
   */
  return (config: MigrateRuleRunnerOptions): Rule => {
    const fromToRange = new Range(config.to ? `>${config.from} <=${config.to}` : `>${config.from}`);
    return chain(
      rangeMapping
        .filter(([range]) => intersects(range, fromToRange))
        .map(([_, rules]) => chain(rules))
    );
  };
}
