import {
  deepFill,
  immutablePrimitive,
  isObject,
} from './deep-fill';

describe('Deep fill function', () => {
  interface InternalType {
    a: number; b: number;
  }
  interface ObjectType {
    notPresent: string; internal: Partial<InternalType>;
  }

  it('should keep the base when source has undefined property', () => {
    const base = Object.freeze({ a: 1, b: '2', c: true });
    const source = Object.freeze({ a: undefined });

    expect(deepFill(base, source)).toEqual(base);
  });

  it('should support "null" value in source', () => {
    const base = { selection: { field: 'test-field' }, a: 'string' };
    const source = { selection: null } as any;

    expect(deepFill(base, source)).toEqual({ selection: null, a: 'string' });
  });

  it('should support "null" value in base', () => {
    const base = { selection: null, a: 'string' } as any;
    const source = { selection: { field: 'test-field' } };

    expect(deepFill(base, source)).toEqual({ selection: { field: 'test-field' }, a: 'string' });
  });

  it('should keep properties from base not present in the source', () => {
    const base = Object.freeze({ a: 1, b: '2', c: true });
    const source = Object.freeze({ c: false, a: 3 });

    expect(deepFill(base, source)).toEqual({ a: 3, b: '2', c: false });
  });

  it('should move properties existing in source but not in base', () => {
    interface GenericType {
      [x: string]: number | undefined;
    }
    interface SpecificType extends GenericType {
      a: number; b?: number;
    }

    const base: SpecificType = { a: 1 };
    const source: Partial<SpecificType> = { b: 3 };

    expect(deepFill(base, source)).toEqual({ a: 1, b: 3 });
  });

  it('should move undefined properties existing in source but not in base', () => {
    interface GenericType {
      [x: string]: number | undefined;
    }
    interface SpecificType extends GenericType {
      a: number; b?: number; c?: number;
    }

    const base: SpecificType = { a: 1 };
    const source: Partial<SpecificType> = { b: 3, c: undefined };

    expect(deepFill(base, source)).toEqual({ a: 1, b: 3, c: undefined });
  });

  it('should replace the booleans', () => {
    const base = Object.freeze({ c: false });
    const source = Object.freeze({ c: true });

    expect(deepFill(base, source)).toEqual({ c: true });
  });

  it('should keep the object value and a new reference', () => {
    const now = new Date();
    const base = Object.freeze({ a: 1, b: [1, 2, 3], c: now });
    const filled = deepFill(base, base);

    expect(filled === base).toBe(false);
    expect(deepFill(base, base)).toEqual({ a: 1, b: [1, 2, 3], c: now });
  });

  it('should replace primitives from base by source', () => {
    const base = Object.freeze({ a: 1, b: '2', c: true });
    const source = Object.freeze({ c: false });

    expect(deepFill(base, source)).toEqual({ a: 1, b: '2', c: false });
  });

  it('should replace arrays from base by source', () => {
    interface Config {
      a: number; b: number[]; c: boolean; d: string;
    }
    const base: Partial<Config> = Object.freeze({ a: 1, b: [4, 5, 6], c: true });
    const source: Partial<Config> = Object.freeze({ b: [1, 2, 3], c: false });

    expect(deepFill(base, source)).toEqual({ a: 1, b: [1, 2, 3], c: false });
  });

  it('should go inside internal objects', () => {
    const source = Object.freeze({
      internal: {
        a: 1
      }
    });
    const base = Object.freeze({
      notPresent: 'coucou',
      internal: {
        a: 2
      }
    });

    expect(deepFill(base, source)).toEqual({
      notPresent: 'coucou',
      internal: {
        a: 1
      }
    });
  });

  it('should not replace the object with a partial one', () => {
    const base: ObjectType = Object.freeze({
      notPresent: 'coucou',
      internal: {
        a: 2,
        b: 7
      }
    });

    const source: Partial<ObjectType> = Object.freeze({
      internal: {
        a: 1
      }
    });

    expect(deepFill(base, source)).toEqual({
      notPresent: 'coucou',
      internal: {
        a: 1,
        b: 7
      }
    });
  });

  it('should replace with the new date', () => {
    interface InternalTypeProp {
      a: number; b: Date;
    }
    interface ObjectTypeProp {
      present: string; internal: Partial<InternalTypeProp>;
    }

    const today = new Date();
    const base: ObjectTypeProp = Object.freeze({
      present: 'coucou',
      internal: {
        a: 2,
        b: new Date(today)
      }
    });

    const newDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const source: Partial<ObjectTypeProp> = Object.freeze({
      internal: {
        b: newDate
      }
    });

    expect(deepFill(base, source)).toEqual({
      present: 'coucou',
      internal: {
        a: 2,
        b: newDate
      }
    });
  });

  it('should replace with the new date time', () => {
    interface InternalTypeProp {
      a: number; b: Date;
    }
    interface ObjectTypeProp {
      present: string; internal: Partial<InternalTypeProp>;
    }

    const today = new Date();
    const base: ObjectTypeProp = Object.freeze({
      present: 'coucou',
      internal: {
        a: 2,
        b: new Date(today)
      }
    });

    const newDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), 10, 30, 0);

    const source: Partial<ObjectTypeProp> = Object.freeze({
      internal: {
        b: newDate
      }
    });

    expect(deepFill(base, source)).toEqual({
      present: 'coucou',
      internal: {
        a: 2,
        b: newDate
      }
    });
  });

  describe('IsObject function', () => {
    it('should return true for an object which is not utils date or Date or array', () => {
      const obj = { a: 1, b: [1, 2, 3], c: 'my string config' };

      expect(isObject(obj)).toBeTruthy();
    });

    it('should return false for an array', () => {
      const obj = [0, 1, 2];

      expect(isObject(obj)).toBeFalsy();
    });
  });

  describe('ImmutablePrimitive function', () => {
    it('should return a new reference of the object', () => {
      const obj = { a: 1, b: [1, 2, 3], c: 'myString' };
      const isEqualRef = immutablePrimitive(obj) === obj;

      expect(isEqualRef).toBeFalsy();
      expect(immutablePrimitive(obj)).toEqual(obj);
    });

    it('should return a new reference of the array', () => {
      const obj = [0, 1, 2];
      const isEqualReference = obj === immutablePrimitive(obj);

      expect(isEqualReference).toBeFalsy();
      expect(immutablePrimitive(obj)).toEqual(obj);
    });
  });
});
