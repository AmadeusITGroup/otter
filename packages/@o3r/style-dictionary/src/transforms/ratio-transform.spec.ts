import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  ratioTransform,
} from './ratio-transform.mjs';

describe('ratioTransform', () => {
  test('should have otter prefix', () => {
    expect(ratioTransform.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });

  test('should be applied to value', () => {
    expect(ratioTransform.type).toBe('value');
  });

  test('should treat only token with ratio attribute', async () => {
    expect(ratioTransform.filter).toBeDefined();
    expect(await ratioTransform.filter?.({ attributes: { o3rRatio: 2 } } as any, {})).toBe(true);
    expect(await ratioTransform.filter?.({ attributes: { o3rPrivate: true } } as any, {})).toBe(false);
    expect(await ratioTransform.filter?.({} as any, {})).toBe(false);
  });

  test('should apply ratio on Dtcg', () => {
    const result: any = ratioTransform.transform({
      $value: '2px',
      attributes: {
        o3rRatio: 5
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('10px');
  });

  test('should apply ratio on non-Dtcg', () => {
    const result: any = ratioTransform.transform({
      value: '2px',
      $value: '3px',
      attributes: {
        o3rRatio: 5
      }
    } as any, {} as any, { usesDtcg: false });

    expect(result).toBe('10px');
  });

  test('should apply ratio to complex type', () => {
    const result = ratioTransform.transform({
      $value: {
        field: {
          value: '1.3 em',
          valueNoSpace: '1.3em',
          valueNumber: 5,
          valueDot: '.5vw'
        }
      },
      attributes: {
        o3rRatio: 5
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toEqual({ field: { value: '6.5 em', valueNoSpace: '6.5em', valueNumber: 25, valueDot: '2.5vw' } });
  });

  test('should not apply ratio on non-numeric type', () => {
    const result: any = ratioTransform.transform({
      $value: 'it\'s 1 value',
      attributes: {
        o3rRatio: 5
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('it\'s 1 value');
  });

  test('should apply negative ratio', () => {
    const result: any = ratioTransform.transform({
      $value: '2px',
      attributes: {
        o3rRatio: -1
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('-2px');
  });

  test('should apply float ratio', () => {
    const result: any = ratioTransform.transform({
      $value: '2px',
      attributes: {
        o3rRatio: 0.5
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('1px');
  });

  test('should apply rounded float ratio', () => {
    const result: any = ratioTransform.transform({
      $value: '2px',
      attributes: {
        o3rRatio: 1 / 3
      }
    } as any, {} as any, { usesDtcg: true });

    expect(result).toBe('0.667px');
  });
});
