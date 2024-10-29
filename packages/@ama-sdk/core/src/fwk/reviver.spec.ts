import {
  reviveArray,
  reviveDictionarizedArray,
  reviveMap
} from './reviver';

describe('Revivers :', () => {
  it('reviveDictionarizedArray', () => {
    const dictionary: { [key: string]: any } = {
      id1: { p1: 'v1' },
      id2: { p2: 'v2' }
    };

    expect(reviveDictionarizedArray(undefined as any, {}, (data) => data)).toBeUndefined();
    expect(reviveDictionarizedArray([], {}, (data) => data)).toEqual({});
    expect(reviveDictionarizedArray(['id1', 'id2'], {}, (data) => data)).toEqual(
      {
        id1: undefined,
        id2: undefined
      }
    );

    expect(reviveDictionarizedArray([], dictionary, (data) => data)).toEqual({});
    const result = reviveDictionarizedArray(['id1', 'id2'], dictionary, (data) => data);

    expect(result.id1).toEqual({ p1: 'v1' });
    expect(result.id2).toEqual({ p2: 'v2' });
  });

  it('should reviveArray propagate the options', () => {
    const reviver = jest.fn();
    const options: any = { logger: jest.fn() };
    reviveArray([1], null, reviver, options);

    expect(reviver).toHaveBeenCalledWith(1, null, options);
  });

  it('should reviveDictionarizedArray propagate the options', () => {
    const reviver = jest.fn();
    const options: any = { logger: jest.fn() };
    const dictionary = { key: 'test' };
    reviveDictionarizedArray(['key'], dictionary, reviver, options);

    expect(reviver).toHaveBeenCalledWith('test', dictionary, options);
  });

  it('should reviveMap propagate the options', () => {
    const reviver = jest.fn();
    const options: any = { logger: jest.fn() };
    const dictionary = { key: 'test' };
    reviveMap(['key'], dictionary, reviver, options);

    expect(reviver).toHaveBeenCalledWith('key', dictionary, options);
  });
});
