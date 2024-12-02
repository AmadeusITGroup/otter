import {
  asyncStoreItemAdapter,
} from './async.adapter';
import {
  AsyncStoreItem,
  EntityStatus,
} from './async.interfaces';

describe('AsyncStoreItemAdapter tests', () => {
  describe('addRequest', () => {
    it('should register new request and set status to pending', () => {
      const item: AsyncStoreItem = { requestIds: [] };
      const newItem = asyncStoreItemAdapter.addRequest(item, 'request');

      expect(newItem.requestIds).toContain('request');
      expect(newItem.requestIds.length).toBe(1);
      expect(newItem.isPending).toBeTruthy();
      expect(newItem.isFailure).toBeFalsy();
    });

    it('should set failure to false if no other request were pending', () => {
      const item: AsyncStoreItem = { requestIds: [], isFailure: true };
      const newItem = asyncStoreItemAdapter.addRequest(item, 'request');

      expect(newItem.isFailure).toBeFalsy();
    });
  });

  describe('resolveRequest', () => {
    it('should remove the requestId from the list and set isPending to false if no other requests are pending', () => {
      const item: AsyncStoreItem = { requestIds: ['test'], isPending: true };
      const newItem = asyncStoreItemAdapter.resolveRequest(item, 'test');

      expect(newItem.requestIds).not.toContain('test');
      expect(newItem.requestIds.length).toBe(0);
      expect(newItem.isPending).toBeFalsy();
      expect(newItem.isFailure).toBeFalsy();
    });

    it('should not touch the isFailure flag if it was failed.', () => {
      const item: AsyncStoreItem = { requestIds: ['test'], isPending: true, isFailure: true };
      const newItem = asyncStoreItemAdapter.resolveRequest(item, 'test');

      expect(newItem.isFailure).toBeTruthy();
    });

    it('should remove the requestId from the list and leave isPending to true if other requests are pending', () => {
      const item: AsyncStoreItem = { requestIds: ['test', 'test2'], isPending: true };
      const newItem = asyncStoreItemAdapter.resolveRequest(item, 'test');

      expect(newItem.requestIds).not.toContain('test');
      expect(newItem.requestIds.length).toBe(1);
      expect(newItem.isPending).toBeTruthy();
      expect(newItem.isFailure).toBeFalsy();
    });

    it('should not do anything if no requestId is provided', () => {
      const item: AsyncStoreItem = { requestIds: ['test', 'test2'], isPending: true };
      const newItem = asyncStoreItemAdapter.resolveRequest(item);

      expect(newItem).toEqual(item);
    });
  });

  describe('failRequest', () => {
    it('should remove the requestId form the list, set isFailure to true and set isPending to false if no other requests are pending', () => {
      const item: AsyncStoreItem = { requestIds: ['test'], isPending: true };
      const newItem = asyncStoreItemAdapter.failRequest(item, 'test');

      expect(newItem.requestIds).not.toContain('test');
      expect(newItem.requestIds.length).toBe(0);
      expect(newItem.isPending).toBeFalsy();
      expect(newItem.isFailure).toBeTruthy();
    });

    it('should remove the requestId form the list, set isFailure to true and leave isPending to true if other requests are pending', () => {
      const item: AsyncStoreItem = { requestIds: ['test', 'test2'], isPending: true };
      const newItem = asyncStoreItemAdapter.failRequest(item, 'test');

      expect(newItem.requestIds).not.toContain('test');
      expect(newItem.requestIds.length).toBe(1);
      expect(newItem.isPending).toBeTruthy();
      expect(newItem.isFailure).toBeTruthy();
    });

    it('should set isFailure to true even without a requestId, but not change isPending', () => {
      const item: AsyncStoreItem = { requestIds: ['test'], isPending: true };
      const newItem = asyncStoreItemAdapter.failRequest(item);

      expect(newItem.requestIds).toContain('test');
      expect(newItem.requestIds.length).toBe(1);
      expect(newItem.isPending).toBeTruthy();
      expect(newItem.isFailure).toBeTruthy();
    });
  });

  describe('initialize', () => {
    it('should append requestIds property to the entity', () => {
      const entity = { a: 1, b: 2 };
      const newItem = asyncStoreItemAdapter.initialize(entity);

      expect(newItem.requestIds).toBeDefined();
      expect(newItem.a).toBe(1);
      expect(newItem.b).toBe(2);
    });
  });

  describe('extractAsyncStoreItem', () => {
    it('should extract requestIds, isFailure and isPending properties from the entity', () => {
      const entity: { a: number; b: number } & AsyncStoreItem = { a: 1, b: 2, requestIds: ['2', '4', '5'], isFailure: true };
      const storeItem = asyncStoreItemAdapter.extractAsyncStoreItem(entity);

      expect(storeItem.requestIds).toEqual(['2', '4', '5']);
      expect(storeItem.isFailure).toBe(true);
      expect(storeItem.isPending).toBeUndefined();
      expect('a' in storeItem).toBeFalsy();
      expect('b' in storeItem).toBeFalsy();
    });
  });

  describe('merge', () => {
    it('should be not pending, not failed without requestIds if all items are empty', () => {
      const result = asyncStoreItemAdapter.merge({ requestIds: [], isFailure: false }, { requestIds: [], isPending: false }, { requestIds: [] });

      expect(result).toEqual(expect.objectContaining({
        requestIds: [],
        isFailure: undefined,
        isPending: undefined
      }));
    });

    it('should contain all passed items requestIds', () => {
      const result = asyncStoreItemAdapter.merge({ requestIds: ['one'] }, { requestIds: ['two'] });

      expect(result.requestIds).toEqual(['one', 'two']);
    });

    it('should be pending if one item is pending', () => {
      const result = asyncStoreItemAdapter.merge({ requestIds: [] }, { requestIds: [], isPending: true }, { requestIds: [] });

      expect(result.isPending).toBeTruthy();
    });

    it('should be failed if one item is failed', () => {
      const result = asyncStoreItemAdapter.merge({ requestIds: [] }, { requestIds: [], isFailure: true }, { requestIds: [] });

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('entityStatusAddRequest', () => {
    const status: EntityStatus<{ prop1: string; prop2: number }> = {
      prop1: asyncStoreItemAdapter.initialize({}),
      prop2: asyncStoreItemAdapter.initialize({})
    };

    it('should add the request and set status to pending', () => {
      const newStatus = asyncStoreItemAdapter.entityStatusAddRequest(status, 'prop1', 'test');

      expect(newStatus.prop2).toEqual(asyncStoreItemAdapter.initialize({}));
      expect(newStatus.prop1).toEqual({ requestIds: ['test'], isPending: true, isFailure: false });
    });

    it('should preserve previous requests', () => {
      const newStatus = asyncStoreItemAdapter.entityStatusAddRequest(
        asyncStoreItemAdapter.entityStatusAddRequest(status, 'prop1', 'test'),
        'prop1', 'test2'
      );

      expect(newStatus.prop2).toEqual(asyncStoreItemAdapter.initialize({}));
      expect(newStatus.prop1).toEqual({ requestIds: ['test', 'test2'], isPending: true, isFailure: false });
    });
  });

  describe('entityStatusResolveRequest', () => {
    const status: EntityStatus<{ prop1: string; prop2: number }> = {
      prop1: { requestIds: ['test'], isPending: true },
      prop2: { requestIds: ['test'], isPending: true }
    };

    it('should remove the request on the right sub-resource status', () => {
      const newStatus = asyncStoreItemAdapter.entityStatusResolveRequest(status, 'prop1', 'test');

      expect(newStatus.prop2).toEqual({ requestIds: ['test'], isPending: true });
      expect(newStatus.prop1).toEqual({ requestIds: [], isPending: false });
    });
  });

  describe('entityStatusFailRequest', () => {
    const status: EntityStatus<{ prop1: string; prop2: number }> = {
      prop1: { requestIds: ['test'], isPending: true },
      prop2: { requestIds: ['test'], isPending: true }
    };

    it('should remove the request on the right sub-resource status', () => {
      const newStatus = asyncStoreItemAdapter.entityStatusFailRequest(status, 'prop1', 'test');

      expect(newStatus.prop2).toEqual({ requestIds: ['test'], isPending: true });
      expect(newStatus.prop1).toEqual({ requestIds: [], isPending: false, isFailure: true });
    });
  });

  describe('resetFailureStatus', () => {
    it('should update isFailure to false keeping other properties from the entity', () => {
      const entity: { a: number; b: number } & AsyncStoreItem = { a: 1, b: 2, requestIds: ['2', '4', '5'], isFailure: true };
      const newItem = asyncStoreItemAdapter.resetFailureStatus(entity);

      expect(newItem.requestIds).toEqual(['2', '4', '5']);
      expect(newItem.isFailure).toBe(false);
      expect(newItem.isPending).toBeUndefined();
    });
  });

  describe('setLoadingStatus', () => {
    it('should update isPending  to true keeping other properties from the entity', () => {
      const entity: { a: number; b: number } & AsyncStoreItem = { a: 1, b: 2, requestIds: [], isPending: false };
      const newItem = asyncStoreItemAdapter.setLoadingStatus(entity);

      expect(newItem.requestIds).toEqual([]);
      expect(newItem.a).toEqual(1);
      expect(newItem.isFailure).toBeFalsy();
      expect(newItem.isPending).toBeTruthy();
    });
  });

  describe('clearAsyncStoreItem', () => {
    it('should remove status information keeping other properties from the entity', () => {
      const entity: { a: number; b: number } & AsyncStoreItem = { a: 1, b: 2, requestIds: ['2', '4', '5'], isFailure: true, isPending: false };
      const newItem = asyncStoreItemAdapter.clearAsyncStoreItem(entity);

      expect(newItem.requestIds).toEqual([]);
      expect(newItem.isFailure).toBeUndefined();
      expect(newItem.isPending).toBeUndefined();
    });
  });
});
