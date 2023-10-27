import { firstValueFrom, Observable, Subject } from 'rxjs';
import { RulesEngine } from './engine';

describe('Rx Rule Engine', () => {
  let engine: RulesEngine;

  beforeEach(() => engine = new RulesEngine({}));

  test('should compile', () => {
    expect(engine).toBeDefined();
  });

  describe('should initialize the engine', () => {
    test('with default factDefaultDelay', () => {
      expect(engine).toBeDefined();
      expect(engine.factDefaultDelay).toBeUndefined();
    });
    test('with default operators', () => {
      expect(engine).toBeDefined();
      expect(Object.keys(engine.operators).length).toBeGreaterThan(0);
    });

    test('with given operators', () => {
      engine = new RulesEngine({
        operators: [{ name: 'testOperator', evaluator: () => true }]
      });

      expect(engine).toBeDefined();
      expect(engine.operators.testOperator).toBeDefined();
    });

    test('with given factDefaultDelay', async () => {
      engine = new RulesEngine({
        factDefaultDelay: 500
      });
      const factValue$: Observable<any> = engine.retrieveOrCreateFactStream('notExistingFact', new Subject());

      expect(factValue$).toBeDefined();

      const promise = firstValueFrom(factValue$);
      await jest.advanceTimersByTimeAsync(500);

      await expect(promise).resolves.toBe(undefined);
    });
  });
});
