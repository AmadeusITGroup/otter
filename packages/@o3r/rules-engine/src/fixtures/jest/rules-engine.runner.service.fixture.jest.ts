import type {
  Fact,
  Operator,
  RulesEngineRunnerService,
  UnaryOperator,
} from '@o3r/rules-engine';

/** Jest Fixture class for RulesEngineRunnerService */
export class RulesEngineRunnerServiceFixture implements Readonly<Partial<RulesEngineRunnerService>> {
  /** @inheritDoc */
  public upsertFacts: jest.Mock<void, [Fact<unknown> | Fact<unknown>[]]> = jest.fn();

  /** @inheritDoc */
  public upsertOperators: jest.Mock<void, [(Operator<any, any> | UnaryOperator<any>)[]]> = jest.fn();

  /** @inheritDoc */
  public enableRuleSetFor: jest.Mock<void, [string]> = jest.fn();

  /** @inheritDoc */
  public disableRuleSetFor: jest.Mock<void, [string]> = jest.fn();
}
