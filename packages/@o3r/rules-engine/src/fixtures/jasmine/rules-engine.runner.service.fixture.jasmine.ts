import type {
  RulesEngineRunnerService
} from '@o3r/rules-engine';

/** Jasmine Fixture class for RulesEngineRunnerService */
export class RulesEngineRunnerServiceFixture implements Readonly<Partial<RulesEngineRunnerService>> {
  /** @inheritDoc */
  public upsertFacts: jasmine.Spy = jasmine.createSpy('upsertFacts');

  /** @inheritDoc */
  public upsertOperators: jasmine.Spy = jasmine.createSpy('upsertOperators');

  /** @inheritDoc */
  public enableRuleSetFor: jasmine.Spy = jasmine.createSpy('enableRuleSetFor');

  /** @inheritDoc */
  public disableRuleSetFor: jasmine.Spy = jasmine.createSpy('disableRuleSetFor');
}
