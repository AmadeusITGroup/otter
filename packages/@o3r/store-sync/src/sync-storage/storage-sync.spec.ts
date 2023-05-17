import { INIT } from '@ngrx/store';
import type { ActionReducer } from '@ngrx/store';
import { deepFill } from '@o3r/core';
import { SyncStorageConfig } from './interfaces';
import { dateReviver, rehydrateApplicationState, syncStateUpdate, syncStorage } from './storage-sync';

class TypeB {
  constructor(public afield: string) { }
}

class TypeA {
  public static reviver(key: string, value: any): any {
    if (typeof value === 'object') {
      if (value.afield) {
        return new TypeB(value.afield);
      } else {
        return new TypeA(value.astring, value.anumber, value.aboolean, value.adate, value.aclass);
      }
    }
    return dateReviver(key, value);
  }

  public static replacer(key: string, value: any) {
    if (key === 'anumber' || key === 'aboolean' || key === 'adate') {
      return undefined;
    }
    return value;
  }

  public static serialize(a: TypeA): string {
    return JSON.stringify(a);
  }

  public static deserialize(json: any): TypeA {
    return new TypeA(json.astring, json.anumber, json.aboolean, json.adate, new TypeB(json.aclass.afield));
  }

  constructor(
    public astring: string = undefined,
    public anumber: number = undefined,
    public aboolean: boolean = undefined,
    public adate: Date = undefined,
    public aclass: TypeB = undefined
  ) { }
}

class MockStorage implements Storage {
  public length: number;
  public clear(): void {
    throw new Error('Not Implemented');
  }
  public getItem(key: string): string | null {
    return this[key] ? this[key] : null;
  }
  public key(_index: number): string | null {
    throw new Error('Not Implemented');
  }
  public removeItem(key: string): void {
    this[key] = undefined;
  }
  public setItem(key: string, data: string): void {
    this[key] = data;
  }
}

const mockStorageKeySerializer = (key: string | number) => {
  return key.toString();
};

describe('ngrxLocalStorage', () => {
  const t1 = new TypeA('Testing', 3.14159, true, new Date('1968-11-16T12:30:00Z'), new TypeB('Nested Class'));

  const t1Json = JSON.stringify(t1);

  const t1Filtered = new TypeA('Testing', undefined, undefined, undefined, new TypeB('Nested Class'));

  const t1Simple = { astring: 'Testing', adate: '1968-11-16T12:30:00.000Z', anumber: 3.14159, aboolean: true };

  const initialState = { state: t1 };

  const initialStateJson = JSON.stringify(initialState);

  const undefinedState: { state: any } = { state: undefined };

  beforeEach(() => {
    localStorage.clear();
  });

  it('simple', () => {
    // This tests a very simple state object syncing to mock Storage
    // Since we're not specifying anything for rehydration, the roundtrip
    // loses type information...

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;

    syncStateUpdate(initialState, ['state'], s, skr, false);

    const raw = s.getItem('state');
    expect(raw).toEqual(t1Json);

    const finalState: any = rehydrateApplicationState(['state'], s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(initialStateJson);

    expect(t1 instanceof TypeA).toBeTruthy();
    expect(finalState.simple instanceof TypeA).toBeFalsy();
  });

  it('simple string', () => {
    const primitiveStr = 'string is not an object';
    const initialStatePrimitiveStr = { state: primitiveStr };

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;

    syncStateUpdate(initialStatePrimitiveStr, ['state'], s, skr, false);

    const raw = s.getItem('state');
    expect(raw).toEqual(primitiveStr);

    const finalState: any = rehydrateApplicationState(['state'], s, skr, true);
    expect(finalState.state).toEqual(primitiveStr);
  });

  [true, false].forEach((bool) => {
    it(`simple ${bool ? 'true' : 'false'} boolean`, () => {
      const primitiveBool = bool;
      const initialStatePrimitiveBool = { state: primitiveBool };

      const s = new MockStorage();
      const skr = mockStorageKeySerializer;

      syncStateUpdate(initialStatePrimitiveBool, ['state'], s, skr, false);

      const raw = s.getItem('state');
      expect(JSON.parse(raw)).toEqual(primitiveBool);

      const finalState: any = rehydrateApplicationState(['state'], s, skr, true);
      expect(finalState.state).toEqual(primitiveBool);
    });
  });

  it('filtered', () => {
    // Use the filter by field option to round-trip an object while
    // filtering out the anumber and adate filed
    // Since we're not specifiying anything for rehydration, the roundtrip
    // loses type information...

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initialStateT1 = { state: t1 };
    const keys = [{ state: ['astring', 'aclass'] }];

    syncStateUpdate(initialStateT1, keys, s, skr, false);

    const raw = s.getItem('state');
    expect(raw).toEqual(JSON.stringify(t1Filtered));

    const finalState: any = rehydrateApplicationState(keys, s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(JSON.stringify({ state: t1Filtered }));

    expect(t1 instanceof TypeA).toBeTruthy();
    expect(finalState.state instanceof TypeA).toBeFalsy();
  });

  it('filtered - multiple keys at root - should properly revive partial state', () => {
    const s = new MockStorage();
    const skr = mockStorageKeySerializer;

    // state at any given moment, subject to sync selectively
    const nestedState = {
      app: { app1: true, app2: [1, 2], app3: { anyValue: 'thing' } },
      feature1: { slice11: true, slice12: [1, 2], slice13: { anyValue: 'thing' } },
      feature2: { slice21: true, slice22: [1, 2], slice23: { anyValue: 'thing' } }
    };

    // test selective write to storage
    syncStateUpdate(
      nestedState,
      [{ feature1: ['slice11', 'slice12'] }, { feature2: ['slice21', 'slice22'] }],
      s,
      skr,
      false
    );

    const raw1 = s.getItem('feature1');
    expect(raw1).toEqual(JSON.stringify({ 'slice11': true, 'slice12': [1, 2] }));

    const raw2 = s.getItem('feature2');
    expect(raw2).toEqual(JSON.stringify({ 'slice21': true, 'slice22': [1, 2] }));
  });

  it('reviver', () => {
    // Use the reviver option to restore including classes

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initialStateT1 = { state: t1 };
    const keys = [{ state: TypeA.reviver }];

    syncStateUpdate(initialStateT1, keys, s, skr, false);

    const finalState: any = rehydrateApplicationState(keys, s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(JSON.stringify(initialStateT1));
    expect(finalState.state instanceof TypeA).toBeTruthy();
    expect(finalState.state.aclass instanceof TypeB).toBeTruthy();
  });

  it('reviver-object', () => {
    // Use the reviver in the object options to restore including classes

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initialStateT1 = { state: t1 };
    const keys = [{ state: { reviver: TypeA.reviver } }];

    syncStateUpdate(initialStateT1, keys, s, skr, false);

    const finalState: any = rehydrateApplicationState(keys, s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(JSON.stringify(initialStateT1));
    expect(finalState.state instanceof TypeA).toBeTruthy();
    expect(finalState.state.aclass instanceof TypeB).toBeTruthy();
  });

  it('filter-object', () => {
    // Use the filter by field option to round-trip an object while
    // filtering out the anumber and adate filed

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initialStateT1 = { filtered: t1 };
    const keys = [{ filtered: { filter: ['astring', 'aclass'] } }];

    syncStateUpdate(initialStateT1, keys, s, skr, false);

    const raw = s.getItem('filtered');
    expect(raw).toEqual(JSON.stringify(t1Filtered));

    const finalState: any = rehydrateApplicationState(keys, s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(JSON.stringify({ filtered: t1Filtered }));

    // Since we're not specifiying anything for rehydration, the roundtrip
    //  loses type information...
    expect(t1 instanceof TypeA).toBeTruthy();
    expect(finalState.filtered instanceof TypeA).toBeFalsy();
  });

  it('replacer-function', () => {
    // Use the replacer function to filter

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initialStateT1 = { replacer: t1 };
    const keys = [{ replacer: { reviver: TypeA.replacer } }];

    syncStateUpdate(initialStateT1, keys, s, skr, false);

    const finalState: any = rehydrateApplicationState(keys, s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(JSON.stringify({ replacer: t1Filtered }));

    expect(t1 instanceof TypeA).toBeTruthy();
    expect(finalState.replacer instanceof TypeA).toBeFalsy();
  });

  it('replacer-array', () => {
    // Use the replacer option to do some custom filtering of the class
    // Note that this completely loses the idea that the revived object ever contained the
    //  fields not specified by the replacer, so we have to do some custom comparing

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initialStateT1 = { replacer: t1 };
    const keys = [{ replacer: { replacer: ['astring', 'adate', 'anumber'], space: 2 } }];

    syncStateUpdate(initialStateT1, keys, s, skr, false);

    // We want to validate the space parameter, but don't want to trip up on OS specific newlines, so filter the newlines out and
    //  compare against the literal string.
    const raw = s.getItem('replacer');
    expect(raw.replace(/\r?\n|\r/g, '')).toEqual(
      '{  "astring": "Testing",  "adate": "1968-11-16T12:30:00.000Z",  "anumber": 3.14159}'
    );

    const finalState: any = rehydrateApplicationState(keys, s, skr, true);

    expect(JSON.stringify(finalState)).toEqual(
      '{"replacer":{"astring":"Testing","adate":"1968-11-16T12:30:00.000Z","anumber":3.14159}}'
    );

    expect(t1 instanceof TypeA).toBeTruthy();
    expect(finalState.replacer instanceof TypeA).toBeFalsy();
  });

  it('serializer', () => {
    // Use the serialize/deserialize options to save and restore including classes

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initialStateT1 = { state: t1 };
    const keys = [{ state: { serialize: TypeA.serialize, deserialize: TypeA.deserialize } }];

    syncStateUpdate(initialStateT1, keys, s, skr, false);

    const finalState: any = rehydrateApplicationState(keys, s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(initialStateJson);
    expect(finalState.state instanceof TypeA).toBeTruthy();
    expect(finalState.state.aclass instanceof TypeB).toBeTruthy();
  });

  it('removeOnUndefined', () => {
    // This tests that the state slice is removed when the state it's undefined
    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    syncStateUpdate(initialState, ['state'], s, skr, true);

    // do update
    let raw = s.getItem('state');
    expect(raw).toEqual(t1Json);

    // ensure that it's erased
    syncStateUpdate(undefinedState, ['state'], s, skr, true);
    raw = s.getItem('state');
    expect(raw).toBeFalsy();
  });

  it('keepOnUndefined', () => {
    // This tests that the state slice is keeped when the state it's undefined
    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    syncStateUpdate(initialState, ['state'], s, skr, false);

    // do update
    let raw = s.getItem('state');
    expect(raw).toEqual(t1Json);

    // test update doesn't erase when it's undefined
    syncStateUpdate(undefinedState, ['state'], s, skr, false);
    raw = s.getItem('state');
    expect(raw).toEqual(t1Json);
  });

  it('not restoreDates', () => {
    // Tests that dates are not revived when the flag is set to false

    const s = new MockStorage();
    const skr = mockStorageKeySerializer;
    const initalState = { state: t1Simple };

    syncStateUpdate(initalState, ['state'], s, skr, false);

    const finalState: any = rehydrateApplicationState(['state'], s, skr, false);
    expect(finalState).toEqual(initalState);
  });

  it('storageKeySerializer', () => {
    // This tests that storage key serializer are working.
    const s = new MockStorage();
    const skr = (key: string | number) => `this_key${key}`;
    syncStateUpdate(initialState, ['state'], s, skr, false);

    const raw = s.getItem('1232342');
    expect(raw).toBeNull();

    const finalState: any = rehydrateApplicationState(['state'], s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(initialStateJson);

    expect(t1 instanceof TypeA).toBeTruthy();
    expect(finalState.simple instanceof TypeA).toBeFalsy();
  });

  it('syncCondition', () => {
    // Test that syncCondition can selectively trigger a sync state update
    const s = new MockStorage();
    const skr = mockStorageKeySerializer;

    // Selector always returns false - meaning it should never sync
    const shouldNotSyncSelector = (_state: any) => {
      return false;
    };

    syncStateUpdate(initialState, ['state'], s, skr, false, shouldNotSyncSelector);

    let raw = s.getItem('state');
    expect(raw).toEqual(null);

    let finalState: any = rehydrateApplicationState(['state'], s, skr, true);
    expect(JSON.stringify(finalState)).toEqual('{}');

    // Selector should error - so still no sync
    const errorSelector = (state: any) => {
      return state.doesNotExist;
    };

    syncStateUpdate(initialState, ['state'], s, skr, false, errorSelector);

    raw = s.getItem('state');
    expect(raw).toEqual(null);

    // Selector always returns true - so it should sync
    const shouldSyncSelector = (_state: any) => {
      return true;
    };

    syncStateUpdate(initialState, ['state'], s, skr, false, shouldSyncSelector);

    raw = s.getItem('state');
    expect(raw).toEqual(t1Json);

    finalState = rehydrateApplicationState(['state'], s, skr, true);
    expect(JSON.stringify(finalState)).toEqual(initialStateJson);
  });

  it('merge initial state and rehydrated state', () => {
    // localStorage starts out in a "bad" state. This could happen if our application state schema
    // changes. End users may have the old schema and a software update has the new schema.
    localStorage.setItem('state', JSON.stringify({ oldstring: 'foo' }));

    // Set up reducers
    const reducer: ActionReducer<any, any> = (state = initialState, _action) => state;
    const metaReducer = syncStorage({ keys: ['state'], rehydrate: true });
    const action = { type: INIT };

    // Resultant state should merge the oldstring state and our initual state
    const finalState = metaReducer(reducer)(initialState, action);
    expect(finalState.state.astring).toEqual(initialState.state.astring);
  });

  it('should merge selectively saved state and rehydrated state', () => {
    const initState = {
      app: { app1: false, app2: [] as any[], app3: {} },
      feature1: { slice11: false, slice12: [] as any[], slice13: {} },
      feature2: { slice21: false, slice22: [] as any[], slice23: {} }
    };

    // A legit case where state is saved in chunks rather than as a single object
    localStorage.setItem('feature1', JSON.stringify({ slice11: true, slice12: [1, 2] }));
    localStorage.setItem('feature2', JSON.stringify({ slice21: true, slice22: [1, 2] }));

    // Set up reducers
    const reducer: ActionReducer<any, any> = (state = initState, _action) => state;
    const metaReducer = syncStorage({
      keys: [{ feature1: ['slice11', 'slice12'] }, { feature2: ['slice21', 'slice22'] }],
      rehydrate: true
    });

    const action = { type: INIT };

    // Resultant state should merge the rehydrated partial state and our initial state
    const finalState = metaReducer(reducer)(initState, action);
    expect(finalState).toEqual({
      app: { app1: false, app2: [], app3: {} },
      feature1: { slice11: true, slice12: [1, 2], slice13: {} },
      feature2: { slice21: true, slice22: [1, 2], slice23: {} }
    });
  });

  it('should enable a complex merge of rehydrated storage and state (with mergeReducer)', () => {
    const initState = {
      app: { app1: false, app2: [] as any[], app3: {} },
      feature1: { slice11: false, slice12: [] as any[], slice13: {} },
      feature2: { slice21: false, slice22: [] as any[], slice23: {} }
    };

    // A legit case where state is saved in chunks rather than as a single object
    localStorage.setItem('feature1', JSON.stringify({ slice11: true, slice12: [1, 2] }));
    localStorage.setItem('feature2', JSON.stringify({ slice21: true, slice22: [1, 2] }));

    // Set up reducers
    const reducer: ActionReducer<any, any> = (state = initState, _action) => state;
    const mergeReducer: SyncStorageConfig['mergeReducer'] = (state, rehydratedState, _action) => {
      // Perform a merge where we only want a single property from feature1
      // but a deepmerge with feature2

      return {
        ...state,
        feature1: {
          slice11: rehydratedState.feature1.slice11
        },
        feature2: deepFill(state.feature2, rehydratedState.feature2)
      };
    };
    const metaReducer = syncStorage({
      keys: [{ feature1: ['slice11', 'slice12'] }, { feature2: ['slice21', 'slice22'] }],
      rehydrate: true,
      mergeReducer
    });

    const action = { type: INIT };

    // Resultant state should merge the rehydrated partial state and our initial state
    const finalState = metaReducer(reducer)(initState, action);
    expect(finalState).toEqual({
      app: { app1: false, app2: [], app3: {} },
      feature1: { slice11: true },
      feature2: { slice21: true, slice22: [1, 2], slice23: {} }
    });
  });

  /* eslint-disable @typescript-eslint/naming-convention, camelcase */
  it('should save targeted infinite depth to localStorage', () => {
    // Configure to only save feature1.slice11.slice11_1 and feature2.slice12,
    // ignore all other properties
    const metaReducer = syncStorage({
      keys: [{ feature1: [{ slice11: ['slice11_1'], slice14: ['slice14_2'] }] }, { feature2: ['slice21'] }]
    });

    // Execute action
    metaReducer((state: any, _action: any) => state)(
      // Initial state with lots of unrelated properties
      {
        feature1: {
          slice11: { slice11_1: 'good_value', slice11_2: 'bad_value' },
          slice12: [],
          slice13: false,
          slice14: { slice14_1: true, slice14_2: 'other_good_value' }
        },
        feature2: {
          slice21: 'third_good_value'
        }
      },
      { type: 'SomeAction' }
    );

    // Local storage should match expect values
    expect(JSON.parse(localStorage.feature1)).toEqual({
      slice11: { slice11_1: 'good_value' },
      slice14: { slice14_2: 'other_good_value' }
    });
    expect(JSON.parse(localStorage.feature2)).toEqual({ slice21: 'third_good_value' });
  });

  it('should allow a mix of partial and full state in keys', () => {
    // given
    const metaReducer = syncStorage({
      keys: [
        // partial state - object
        { feature1: [{ slice11: ['slice11_1'], slice14: ['slice14_2'] }] },

        // full state - string
        'feature2'
      ]
    });

    // when
    metaReducer((state: any, _action: any) => state)(
      {
        feature1: {
          slice11: { slice11_1: 'good_value', slice11_2: 'bad_value' },
          slice12: [],
          slice13: false,
          slice14: { slice14_1: true, slice14_2: 'other_good_value' }
        },
        feature2: {
          slice21: 'third_good_value',
          slice22: 'fourth_good_value'
        }
      },
      { type: 'SomeAction' }
    );

    // then
    expect(JSON.parse(localStorage.feature1)).toEqual({
      slice11: { slice11_1: 'good_value' },
      slice14: { slice14_2: 'other_good_value' }
    });
    expect(JSON.parse(localStorage.feature2)).toEqual({
      slice21: 'third_good_value',
      slice22: 'fourth_good_value'
    });
  });
  /* eslint-enable @typescript-eslint/naming-convention, camelcase */
});
