import { BehaviorSubject, Subject } from 'rxjs';
import { RulesEngineRunnerService } from '../services/runner/rules-engine.runner.service';
import { FactsService } from './fact.abstract-service';


class FakeFactsService extends FactsService<any> {
  constructor(rulesEngine: RulesEngineRunnerService, public facts: any) {
    super(rulesEngine);
  }
}

describe('Rules engine fact', () => {
  let mockEngine: RulesEngineRunnerService;
  let factsService: FactsService<any>;
  let subjectFact: Subject<string>;

  beforeEach(() => {
    mockEngine = {
      upsertFacts: jest.fn()
    } as any as RulesEngineRunnerService;
    subjectFact = new BehaviorSubject<string>('test3');
    const facts = {
      basicFact: 'test1',
      promiseFact: Promise.resolve('test2'),
      observableFact: subjectFact
    };
    factsService = new FakeFactsService(mockEngine, facts);
  });

  it('should register the facts', async () => {
    factsService.register();
    await jest.runAllTimersAsync();

    expect(mockEngine.upsertFacts).toHaveBeenCalledTimes(1);
  });

  it('should update the value of a fact', async () => {
    factsService.register();
    await jest.runAllTimersAsync();
    subjectFact.next('test4');
    await jest.runAllTimersAsync();

    expect(mockEngine.upsertFacts).toHaveBeenCalledTimes(1);
  });
});
