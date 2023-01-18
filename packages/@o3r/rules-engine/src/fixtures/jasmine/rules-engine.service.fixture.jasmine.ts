import type { RulesEngineService } from '@o3r/rules-engine';

export class RulesEngineServiceFixture implements Readonly<Partial<RulesEngineService>> {

  /** @inheritDoc */
  public upsertFacts: jasmine.Spy = jasmine.createSpy('upsertFacts');

  /** @inheritDoc */
  public upsertOperators: jasmine.Spy = jasmine.createSpy('upsertOperators');

  /** @inheritDoc */
  public resolveUrlWithLang: jasmine.Spy = jasmine.createSpy('resolveUrlWithLang');

  /** @inheritDoc */
  public retrieveTemplate: jasmine.Spy = jasmine.createSpy('retrieveTemplate');

  /** @inheritDoc */
  public enableRuleSetFor: jasmine.Spy = jasmine.createSpy('enableRuleSetFor');

  /** @inheritDoc */
  public disableRuleSetFor: jasmine.Spy = jasmine.createSpy('disableRuleSetFor');
}
