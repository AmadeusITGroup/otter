import {
  BehaviorSubject,
  Subject,
} from 'rxjs';
import {
  RulesEngineRunnerService,
} from '../services/runner/rules-engine-runner-service';
import {
  FactsService,
} from './fact-abstract-service';

class FakeFactsService extends FactsService<any> {
  constructor(rulesEngine: RulesEngineRunnerService, public facts: any) {
    super(rulesEngine);
  }
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Rules engine fact', () => {
  let mockEngine: RulesEngineRunnerService;
  let factsService: FactsService<any>;
  let subjectFact: Subject<string>;

  beforeEach(() => {
    mockEngine = {
      upsertFacts: vi.fn()
    } as any as RulesEngineRunnerService;
    subjectFact = new BehaviorSubject<string>('test3');
    const facts = {
      basicFact: 'test1',
      promiseFact: Promise.resolve('test2'),
      observableFact: subjectFact
    };
    factsService = new FakeFactsService(mockEngine, facts);
  });

  it ('should indicate that the facts are registered', () => {
    expect(factsService.isRegistered).toBe(false);
    factsService.register();
    expect(factsService.isRegistered).toBe(true);
  });

  it('should register the facts', async () => {
    factsService.register();
    await vi.runAllTimersAsync();

    expect(mockEngine.upsertFacts).toHaveBeenCalledTimes(1);
    expect(factsService.isRegistered).toBe(true);
  });

  it('should update the value of a fact', async () => {
    factsService.register();
    await vi.runAllTimersAsync();
    subjectFact.next('test4');
    await vi.runAllTimersAsync();

    expect(mockEngine.upsertFacts).toHaveBeenCalledTimes(1);
    expect(factsService.isRegistered).toBe(true);
  });
});
