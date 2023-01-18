import { BehaviorSubject, Subject } from 'rxjs';
import { RulesEngineService } from '../services/rules-engine.service';
import { FactsService } from './fact.abstract-service';


class FakeFactsService extends FactsService<any> {
  constructor(rulesEngine: RulesEngineService, public facts: any) {
    super(rulesEngine);
  }
}

describe('Rules engine fact', () => {
  let mockEngine: RulesEngineService;
  let factsService: FactsService<any>;
  let subjectFact: Subject<string>;

  beforeEach(() => {
    mockEngine = {
      upsertFacts: jest.fn()
    } as any as RulesEngineService;
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
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));

    expect(mockEngine.upsertFacts).toHaveBeenCalledTimes(1);
  });

  it('should update the value of a fact', async () => {
    factsService.register();
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
    subjectFact.next('test4');
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));

    expect(mockEngine.upsertFacts).toHaveBeenCalledTimes(1);
  });
});
