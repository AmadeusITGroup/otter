import {
  FactDefinitions,
  FactSet
} from '../engine/index';
import {
  RulesEngineRunnerService
} from '../services/runner/rules-engine.runner.service';

/** Abstract fact set service */
export abstract class FactsService<T extends FactDefinitions> {
  /** Set of facts provided */
  public abstract facts: FactSet<T>;

  constructor(private readonly rulesEngine: RulesEngineRunnerService) {}

  /** Register the set of facts */
  public register() {
    this.rulesEngine.upsertFacts(
      Object.entries(this.facts)
        .map(([id, factValue]) => ({ id, value$: factValue }))
    );
  }
}
