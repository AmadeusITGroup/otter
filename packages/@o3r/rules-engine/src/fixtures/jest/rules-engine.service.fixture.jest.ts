import type { PlaceholderTemplateReply } from '@o3r/components';
import type { Fact, Operator, RulesEngineService, UnaryOperator } from '@o3r/rules-engine';

export class RulesEngineServiceFixture implements Readonly<Partial<RulesEngineService>> {

  /** @inheritDoc */
  public upsertFacts: jest.Mock<void, [Fact<unknown> | Fact<unknown>[]]> = jest.fn();

  /** @inheritDoc */
  public upsertOperators: jest.Mock<void, [(Operator<any, any> | UnaryOperator<any>)[]]> = jest.fn();

  /** @inheritDoc */
  public resolveUrlWithLang: jest.Mock<string, [string, string]> = jest.fn();

  /** @inheritDoc */
  public retrieveTemplate: jest.Mock<Promise<PlaceholderTemplateReply>, [string]> = jest.fn();

  /** @inheritDoc */
  public enableRuleSetFor: jest.Mock<void, [string]> = jest.fn();

  /** @inheritDoc */
  public disableRuleSetFor: jest.Mock<void, [string]> = jest.fn();
}
