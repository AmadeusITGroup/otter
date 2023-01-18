import {reviveDictionarizedArray} from './Reviver';

describe('Revivers :', () => {
  it('reviveDictionarizedArray', () => {
    const dictionary: {[key: string]: any} = {
      id1: {p1: 'v1'},
      id2: {p2: 'v2'}
    };

    expect(reviveDictionarizedArray(undefined as any, {}, ((data) => data))).toBeUndefined();
    expect(reviveDictionarizedArray([], {}, ((data) => data))).toEqual({});
    expect(reviveDictionarizedArray(['id1', 'id2'], {}, ((data) => data))).toEqual(
      {
        id1: undefined,
        id2: undefined
      }
    );

    expect(reviveDictionarizedArray([], dictionary, ((data) => data))).toEqual({});
    const result = reviveDictionarizedArray(['id1', 'id2'], dictionary, ((data) => data));

    expect(result.id1).toEqual({p1: 'v1'});
    expect(result.id2).toEqual({p2: 'v2'});
  });
});
