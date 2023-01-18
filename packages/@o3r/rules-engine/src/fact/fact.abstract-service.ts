import { FactDefinitions, FactSet } from '../engine/index';
import { RulesEngineService } from '../services/rules-engine.service';

/** Abstract fact set service */
export abstract class FactsService<T extends FactDefinitions> {

  /** Set of facts provided */
  public abstract facts: FactSet<T>;

  constructor(private rulesEngine: RulesEngineService) {
  }

  /** Register the set of facts */
  public register() {
    this.rulesEngine.upsertFacts(
      Object.entries(this.facts)
        .map(([id, factValue]) => ({ id, value$: factValue }))
    );
  }
}
