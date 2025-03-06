import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  unitTransform,
} from './unit.transform.mjs';

describe('unitTransform', () => {
  test('should have otter prefix', () => {
    expect(unitTransform.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });

  test('should be applied to value', () => {
    expect(unitTransform.type).toBe('value');
  });

  test('should treat only token with unit attribute', async () => {
    expect(unitTransform.filter).toBeDefined();
    expect(await unitTransform.filter?.({ attributes: { o3rUnit: 'lol' } } as any, {})).toBe(true);
    expect(await unitTransform.filter?.({ attributes: { o3rPrivate: true } } as any, {})).toBe(false);
    expect(await unitTransform.filter?.({} as any, {})).toBe(false);
  });

  test('should apply unit on Dtcg', () => {
    const result: any = unitTransform.transform({
      $value: '2px',
      attributes: {
        o3rUnit: 'lol'
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('2lol');
  });

  test('should apply unit on non-Dtcg', () => {
    const result: any = unitTransform.transform({
      value: '2px',
      $value: '3px',
      attributes: {
        o3rUnit: 'lol'
      }
    } as any, {} as any, { usesDtcg: false });

    expect(result).toBe('2lol');
  });

  test('should apply unit to complex type', () => {
    const result = unitTransform.transform({
      $value: {
        field: {
          value: '1.3 em',
          valueNoSpace: '1.3em',
          valueNumber: 5,
          valueDot: '.5vw'
        }
      },
      attributes: {
        o3rUnit: 'lol'
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toEqual({ field: { value: '1.3 lol', valueNoSpace: '1.3lol', valueNumber: 5, valueDot: '.5lol' } });
  });

  test('should not apply unit on non-numeric type', () => {
    const result: any = unitTransform.transform({
      $value: 'it\'s 1 value',
      attributes: {
        o3rRatio: 5
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('it\'s 1 value');
  });

  test('should remove unit', () => {
    const result: any = unitTransform.transform({
      $value: '2px',
      attributes: {
        o3rUnit: ''
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('2');
  });
});
