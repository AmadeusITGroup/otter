import { callRule, Tree } from '@angular-devkit/schematics';
import { getMigrationRuleRunner } from './migration';
import { firstValueFrom } from 'rxjs';

describe('getMigrationRuleRunner', () => {

  it('should execute rule when in the range', async () => {
    const spy = jest.fn();
    const runnner = getMigrationRuleRunner({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '10.0.*': spy
    });

    const rules = runnner({ from: '9.0.0', to: '10.1.0' });

    await firstValueFrom(callRule(rules, Tree.empty(), {} as any));

    expect(spy).toHaveBeenCalled();
  });

  it('should not execute rule when not in the range', async () => {
    const spy = jest.fn();
    const spy2 = jest.fn();
    const runnner = getMigrationRuleRunner({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '8.*': spy2,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '10.0.*': spy
    });

    const rules = runnner({ from: '8.0.0', to: '9.1.0' });
    await firstValueFrom(callRule(rules, Tree.empty(), {} as any));

    expect(spy).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should execute rule when in the range without limit', async () => {
    const spy = jest.fn();
    const runnner = getMigrationRuleRunner({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '10.0.*': spy
    });

    const rules = runnner({ from: '9.0.0' });
    await firstValueFrom(callRule(rules, Tree.empty(), {} as any));

    expect(spy).toHaveBeenCalled();
  });
});
