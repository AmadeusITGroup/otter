import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createEntityAsyncRequestAdapter } from './async-entity.adapter';
import { AsyncStoreItem } from './async.interfaces';

describe('createEntityAsyncRequestAdapter tests', () => {
  interface Model extends AsyncStoreItem {
    id: string;
    a: number;
    b: number;
  }

  interface ModelWithOtherId extends AsyncStoreItem {
    customId: string;
    a: number;
    b: number;
  }

  interface TestState extends EntityState<Model>, AsyncStoreItem {}

  interface TestStateWithCustomId extends EntityState<ModelWithOtherId>, AsyncStoreItem {}

  const model1: Model = {id: 'myModel1', a: 1, b: 2, requestIds: ['test']};
  const model2: Model = {id: 'myModel2', a: 1, b: 2, requestIds: ['test', 'test2']};
  const model3: Model = {id: 'myModel3', a: 1, b: 2, requestIds: ['test', 'test2']};
  const model4: Model = {id: 'myModel4', a: 1, b: 2, requestIds: []};

  const modelWithOtherId1: ModelWithOtherId = {customId: 'myModel1', a: 1, b: 2, requestIds: []};
  const modelWithOtherId2: ModelWithOtherId = {customId: 'myModel2', a: 1, b: 2, requestIds: []};
  const modelWithOtherId3: ModelWithOtherId = {customId: 'myModel3', a: 1, b: 2, requestIds: []};

  const testAdapter = createEntityAsyncRequestAdapter(createEntityAdapter<Model>({
    selectId: (model) => model.id
  }));

  const testAdapterWithCustomId = createEntityAsyncRequestAdapter(createEntityAdapter<ModelWithOtherId>({
    selectId: (model) => model.customId
  }));

  const emptyState: TestState = testAdapter.getInitialState<AsyncStoreItem>({requestIds: []});

  const emptyStateWithOtherId: TestStateWithCustomId = testAdapterWithCustomId.getInitialState<AsyncStoreItem>({requestIds: []});

  const state: TestState = {
    ids: ['myModel1', 'myModel2', 'myModel3'],
    entities: {myModel1: model1, myModel2: model2, myModel3: model3},
    requestIds: ['test']
  };

  describe('failRequestMany', () => {
    it('should fail requests for given ids, touching the pending when requestId passed', () => {
      const newState = testAdapter.failRequestMany(state, ['myModel1', 'myModel3'], 'test');

      expect(newState.entities.myModel1!.isFailure).toBeTruthy();
      expect(newState.entities.myModel1!.isPending).toBeFalsy(); // because 'test' request id has been removed
      expect(newState.entities.myModel2!.isFailure).not.toBeDefined();
      expect(newState.entities.myModel3!.isFailure).toBeTruthy();
      expect(newState.entities.myModel3!.isPending).toBeTruthy();
      expect(newState.isFailure).not.toBeDefined();
    });

    it('should fail requests for given ids, keeping the pending when no requestId passed', () => {
      const newState = testAdapter.failRequestMany(state, ['myModel1', 'myModel3']);

      expect(newState.entities.myModel1!.isFailure).toBeTruthy();
      expect(newState.entities.myModel1!.isPending).toBeTruthy(); // we still have one request id
      expect(newState.entities.myModel2!.isFailure).not.toBeDefined();
      expect(newState.entities.myModel3!.isFailure).toBeTruthy();
      expect(newState.entities.myModel3!.isPending).toBeTruthy();
    });

    it('should touch the global failure state if ids are not matching, keeping is pending if no requestId is passed', () => {
      const newState = testAdapter.failRequestMany(state, ['myModel4', 'myModel5']);

      expect(newState.isFailure).toBeTruthy();
      expect(newState.isPending).toBeTruthy();
    });

    it('should touch the global failure state if ids are not matching, moving is pending to false if no requests left', () => {
      const newState = testAdapter.failRequestMany(state, ['myModel4', 'myModel5'], 'test');

      expect(newState.isFailure).toBeTruthy();
      expect(newState.isPending).toBeFalsy();
    });
  });

  describe('addRequestOne', () => {
    it('Should add the request to the global state if no id is given', () => {
      const newState = testAdapter.addRequestOne(emptyState, null, 'someRequestId');

      expect(newState.ids.length).toBe(0);
      expect(newState.isPending).toBeTruthy();
      expect(newState.isFailure).toBeFalsy();
      expect(newState.requestIds).toEqual(['someRequestId']);
    });

    it('Should add the request to the global state if entity doesn\'t exist', () => {
      const newState = testAdapter.addRequestOne(emptyState, 'newId', 'someRequestId');

      expect(newState.ids.length).toBe(0);
      expect(newState.isPending).toBeTruthy();
      expect(newState.isFailure).toBeFalsy();
      expect(newState.requestIds).toEqual(['someRequestId']);
    });

    it('Should only add the request to the entity if it already exists', () => {
      const stateWithOneEntity = testAdapter.addOne(model4, emptyState);
      const newState = testAdapter.addRequestOne(stateWithOneEntity, model4.id, 'requestId');

      expect(newState.ids.length).toBe(1);
      expect(newState.isPending).toBeFalsy();
      expect(newState.isFailure).toBeFalsy();
      const newEntity = newState.entities[model4.id]!;

      expect(newEntity.isPending).toBeTruthy();
      expect(newEntity.isFailure).toBeFalsy();
      expect(newEntity.requestIds).toEqual(['requestId']);
    });
  });

  describe('addRequestMany', () => {
    it('should add requests for given ids with the given requestId', () => {
      const newState = testAdapter.addRequestMany(state, ['myModel1', 'myModel3'], 'testCustom');

      expect(newState.entities.myModel1!.isFailure).not.toBeDefined();
      expect(newState.entities.myModel1!.isPending).toBeTruthy();
      expect(newState.entities.myModel1!.requestIds).toEqual(['test', 'testCustom']);
      expect(newState.entities.myModel2!.isPending).not.toBeDefined();
      expect(newState.entities.myModel3!.isPending).toBeTruthy();
      expect(newState.isPending).not.toBeDefined();
    });

    it('should do nothing if the ids passed don;t have corresponding entities', () => {
      const newState = testAdapter.addRequestMany(state, ['myModel4', 'myModel5'], 'testCustom');

      expect(newState.entities.myModel1!.isPending).not.toBeDefined();
      expect(newState.entities.myModel2!.isPending).not.toBeDefined();
      expect(newState.entities.myModel3!.isPending).not.toBeDefined();
      expect(newState.isPending).not.toBeDefined();
    });
  });

  describe('resolveRequestOne', () => {
    it('should add the entity and update the global status if it did not exist', () => {
      const newState = testAdapter.resolveRequestOne({...emptyState, requestIds: ['request'], isPending: true}, model4, 'request');

      expect(newState.isPending).toBeFalsy();
      expect(newState.isFailure).toBeFalsy();
      expect(newState.requestIds.length).toBe(0);
      const entity = newState.entities[model4.id]!;

      expect(entity).toBeDefined();
      expect(entity.isPending).toBeFalsy();
      expect(entity.isFailure).toBeFalsy();
      expect(entity.requestIds.length).toBe(0);
    });

    it('should update the entity and update the entity status if it already exists', () => {
      const baseState = testAdapter.addOne({...model4, requestIds: ['request'], isPending: true}, emptyState);
      const newState = testAdapter.resolveRequestOne(baseState, {id: model4.id, a: 500, b: 999}, 'request');

      expect(newState.isPending).toBeFalsy();
      expect(newState.isFailure).toBeFalsy();
      expect(newState.requestIds.length).toBe(0);
      const entity = newState.entities[model4.id]!;

      expect(entity).toBeDefined();
      expect(entity.isPending).toBeFalsy();
      expect(entity.isFailure).toBeFalsy();
      expect(entity.requestIds.length).toBe(0);
      expect(entity.a).toBe(500);
      expect(entity.b).toBe(999);
    });

    it('should support entities with custom IDs', () => {
      const baseState = testAdapterWithCustomId.addOne({...modelWithOtherId1, requestIds: ['request'], isPending: true}, emptyStateWithOtherId);
      const newState = testAdapterWithCustomId.resolveRequestOne(baseState, {customId: modelWithOtherId1.customId, a: 500, b: 999}, 'request', 'customId');

      expect(newState.isPending).toBeFalsy();
      expect(newState.isFailure).toBeFalsy();
      expect(newState.requestIds.length).toBe(0);
      const entity = newState.entities[modelWithOtherId1.customId]!;

      expect(entity).toBeDefined();
      expect(entity.isPending).toBeFalsy();
      expect(entity.isFailure).toBeFalsy();
      expect(entity.requestIds.length).toBe(0);
      expect(entity.a).toBe(500);
      expect(entity.b).toBe(999);
    });
  });

  describe('resolveRequestMany', () => {
    it('should update the entities and handle the pending accordingly', () => {
      const payloadEntities = [{id: 'myModel1', a: 100}, {id: 'myModel3', b: 200}];
      const newState = testAdapter.resolveRequestMany(state, payloadEntities, 'test');

      expect(newState.entities.myModel1!.isPending).toBeFalsy(); // because 'test' request id has been removed
      expect(newState.entities.myModel1!.a).toBe(100);
      expect(newState.entities.myModel1!.isFailure).not.toBeDefined();
      expect(newState.entities.myModel2!.isPending).not.toBeDefined();
      expect(newState.entities.myModel3!.isPending).toBeTruthy(); // one request id left in the list
      expect(newState.entities.myModel3!.b).toBe(200);
      expect(newState.isPending).not.toBeDefined();
    });

    it('should update the entities which exist, computing the current status when no requestId passed', () => {
      const payloadEntities = [{id: 'myModel1', a: 100}, {id: 'myModel3', b: 200}];
      const newState = testAdapter.resolveRequestMany(state, payloadEntities);

      expect(newState.entities.myModel1!.isPending).toBe(true);
      expect(newState.entities.myModel1!.a).toBe(100);
      expect(newState.entities.myModel2!.isFailure).not.toBeDefined();
      expect(newState.entities.myModel2!.isPending).not.toBeDefined();
      expect(newState.entities.myModel3!.isFailure).toBe(undefined);
      expect(newState.entities.myModel3!.isPending).toBe(true);
      expect(newState.entities.myModel3!.b).toBe(200);
    });

    it('should do nothing if the ids of corresponding entities passed don;t have correspondings in the store', () => {
      const payloadEntities = [{id: 'myModel4', a: 100}, {id: 'myModel5', b: 200}];
      const newState = testAdapter.resolveRequestMany(state, payloadEntities, 'testCustom');

      expect(newState.entities.myModel1!.isPending).not.toBeDefined();
      expect(newState.entities.myModel2!.isPending).not.toBeDefined();
      expect(newState.entities.myModel3!.isPending).not.toBeDefined();
      expect(newState.isPending).not.toBeDefined();
    });

    it('should support entities with custom IDs', () => {
      const baseState = testAdapterWithCustomId.addMany([
        {...modelWithOtherId1, requestIds: ['request'], isPending: true},
        {...modelWithOtherId2, requestIds: ['request', 'request2'], isPending: true},
        {...modelWithOtherId3, requestIds: ['request', 'request2'], isPending: true}
      ], emptyStateWithOtherId);
      const newState = testAdapterWithCustomId.resolveRequestMany(baseState, [
        {customId: modelWithOtherId1.customId, a: 500, b: 999},
        {customId: modelWithOtherId1.customId, a: 501, b: 998},
        {customId: modelWithOtherId1.customId, a: 502, b: 997}
      ], 'request', 'customId');

      expect(newState.entities.myModel1!.isPending).toBeFalsy();
      expect(newState.entities.myModel2!.isPending).toBeTruthy();
      expect(newState.entities.myModel3!.isPending).toBeTruthy();
      expect(newState.isPending).toBeFalsy();
    });
  });

});
