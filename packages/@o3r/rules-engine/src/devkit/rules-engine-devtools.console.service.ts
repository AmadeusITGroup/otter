/* eslint-disable no-console */
import {
  Inject,
  Injectable,
  Optional
} from '@angular/core';
import type {
  DevtoolsServiceInterface,
  WindowWithDevtools
} from '@o3r/core';
import {
  RulesEngineDevtoolsServiceOptions
} from './rules-engine-devkit.interface';
import {
  OtterRulesEngineDevtools
} from './rules-engine-devtools.service';
import {
  OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS
} from './rules-engine-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class RulesEngineDevtoolsConsoleService implements DevtoolsServiceInterface {
  /** Name of the Window property to access to the devtools */
  public static readonly windowModuleName = 'rulesEngine';

  private readonly options: RulesEngineDevtoolsServiceOptions;

  constructor(
    private readonly rulesEngineDevtools: OtterRulesEngineDevtools,
    @Optional() @Inject(OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS) options?: RulesEngineDevtoolsServiceOptions
  ) {
    this.options = {
      ...OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS,
      ...options
    };

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  /** @inheritDoc */
  public activate() {
    const windowWithDevtools: WindowWithDevtools = window;

    windowWithDevtools._OTTER_DEVTOOLS_ ||= {};

    windowWithDevtools._OTTER_DEVTOOLS_[RulesEngineDevtoolsConsoleService.windowModuleName] = this;

    console.info(`Otter rules engine Devtools is now accessible via the _OTTER_DEVTOOLS_.${RulesEngineDevtoolsConsoleService.windowModuleName} variable`);
  }

  /** Return the list of debug events emitted by rules engine */
  public async getCurrentRulesEngineEventsStack() {
    console.log(await this.rulesEngineDevtools.getCurrentRulesEngineEventsStack());
  }

  /** Returns the list of active rulesets (name and id) at the moment when the function is called */
  public async getActiveRulesets() {
    console.log(await this.rulesEngineDevtools.getActiveRulesets());
  }

  /** Returns the list of available rulesets (name and id) at the moment when the function is called */
  public async getAvailableRulesets() {
    console.log(await this.rulesEngineDevtools.getAvailableRulesets());
  }

  /** Returns the list of output actions emitted by the rules engine at the moment when the function is called */
  public async getAllOutputActions() {
    console.log(await this.rulesEngineDevtools.getAllOutputActions());
  }

  /**
   * Get the list of executions for the given ruleset
   * @param rulesetId
   */
  public async getRulesetExecutions(rulesetId: string) {
    console.log(await this.rulesEngineDevtools.getRulesetExecutions(rulesetId));
  }

  /**
   * Check if the ruleset is activ in the moment when the function is called
   * @param rulesetId
   * @returns True if the ruleset is active; False if the ruleset is inactive or it does not exist
   */
  public async isRulesetActive(rulesetId: string) {
    console.log(await this.rulesEngineDevtools.isRulesetActive(rulesetId));
  }

  /**
   * Get the list of rules executed for the specified ruleset
   * @param rulesetId
   */
  public async getRulesEvaluationsForRuleset(rulesetId: string) {
    console.log(await this.rulesEngineDevtools.getRulesEvaluationsForRuleset(rulesetId));
  }

  /**
   * Get the list of input facts (name, current value) for the specified ruleset, at the moment when the function is called
   * @param rulesetId
   */
  public async getInputFactsForRuleset(rulesetId: string) {
    console.log(await this.rulesEngineDevtools.getInputFactsForRuleset(rulesetId));
  }

  /**
   * Get the list of triggers for the specified ruleset
   * @param rulesetId
   */
  public async getTriggersForRuleset(rulesetId: string) {
    console.log(await this.rulesEngineDevtools.getTriggersForRuleset(rulesetId));
  }

  /**
   * Get the list of outputed actions emitted by the given ruleset, at the moment when the function is called
   * @param rulesetId
   */
  public async getOutputActionsForRuleset(rulesetId: string) {
    console.log(await this.rulesEngineDevtools.getOutputActionsForRuleset(rulesetId));
  }

  /** Get the list of fact names and corresponding values */
  public async getAllFactsSnapshot() {
    console.log(await this.rulesEngineDevtools.getAllFactsSnapshot());
  }

  /**
   * Retrieve the ruleset information (rules, linkedComponents, validity range etc.) for a ruleset id
   * @param rulesetId
   */
  public async getRulesetInformation(rulesetId: string) {
    console.log(await this.rulesEngineDevtools.getRulesetInformation(rulesetId));
  }
}
