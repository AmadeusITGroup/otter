import * as actions from './rulesets.actions';
import {
  rulesetsInitialState,
  rulesetsReducer,
} from './rulesets.reducer';
import {
  RulesetsState,
} from './rulesets.state';

describe('Rulesets Store reducer', () => {
  let entitiesState: RulesetsState;
  const firstRulesets: any = { id: 'rulesets1', genericItems: [] };
  const secondRulesets: any = { id: 'rulesets2', genericItems: [] };
  const rulesetsReply: any = [firstRulesets];

  it('should have the correct initial state', () => {
    expect(rulesetsInitialState.ids.length).toBe(0);
  });

  it('should by default return the initial state', () => {
    const state = rulesetsReducer(rulesetsInitialState, { type: 'fake' } as any);

    expect(state).toEqual(rulesetsInitialState);
  });

  describe('Actions on state details', () => {
    beforeEach(() => {
      entitiesState = rulesetsReducer(rulesetsInitialState, actions.setRulesetsEntities({ entities: [firstRulesets, secondRulesets] }));
    });

    it('SET action should clear current state details and return a state with the new one', () => {
      const firstState = rulesetsReducer(entitiesState, actions.setRulesets({ stateDetails: { requestIds: [] } }));
      const secondState = rulesetsReducer(firstState, actions.setRulesets({ stateDetails: { requestIds: [], isPending: false } }));

      expect(secondState.isPending).toEqual(false);
    });

    it('UPDATE should update the state details without modifying entities', () => {
      const firstState = rulesetsReducer(entitiesState, actions.setRulesets({ stateDetails: { requestIds: [] } }));
      const secondState = rulesetsReducer(firstState, actions.updateRulesets({ stateDetails: { isPending: false } }));

      expect(secondState.isPending).toEqual(false);
    });

    it('RESET action should return initial state', () => {
      const state = rulesetsReducer(entitiesState, actions.resetRulesets());

      expect(state).toEqual(rulesetsInitialState);
    });

    it('FAIL action should update the isPending to false and the isFailure to true', () => {
      const state = rulesetsReducer({ ...rulesetsInitialState, isPending: true }, actions.failRulesetsEntities({}));

      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = rulesetsReducer(rulesetsInitialState, actions.setRulesetsEntities({ entities: [firstRulesets] }));
      const secondState = rulesetsReducer(firstState, actions.setRulesetsEntities({ entities: [secondRulesets] }));

      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstRulesets.id))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondRulesets.id))).toBeDefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstRulesetsUpdated = { ...firstRulesets, genericField: 'genericId' };
      const firstState = rulesetsReducer(rulesetsInitialState, actions.setRulesetsEntities({ entities: [firstRulesets] }));
      const secondState = rulesetsReducer(firstState,
        actions.upsertRulesetsEntities({ entities: [firstRulesetsUpdated, secondRulesets] }));

      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstRulesets.id))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondRulesets.id))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = rulesetsReducer(rulesetsInitialState, actions.setRulesetsEntities({ entities: [firstRulesets, secondRulesets] }));
      const secondState = rulesetsReducer(firstState, actions.setRulesets({ stateDetails: { requestIds: [], isPending: false } }));
      const thirdState = rulesetsReducer(secondState, actions.clearRulesetsEntities());

      expect(thirdState.ids.length).toEqual(0);
    });

    it('FAIL_ENTITIES action should update the isPending to false and the isFailure to true', () => {
      const state = rulesetsReducer({ ...rulesetsInitialState, isPending: true }, actions.failRulesetsEntities({}));

      expect(state.ids.length).toBe(0);
      expect(state.isPending).toBe(false);
      expect(state.isFailure).toBe(true);
    });

    it('FAIL_ENTITIES action should update the global isPending to false in case there are some newIds in the payload', () => {
      const firstState = rulesetsReducer(rulesetsInitialState, actions.setRulesetsEntities({ entities: [firstRulesets] }));
      const secondState = rulesetsReducer({ ...firstState, isPending: true },
        actions.failRulesetsEntities({ error: 'dummy error', ids: [secondRulesets.id] }));

      expect(secondState.isPending).toBe(false);
      expect(secondState.isFailure).toBe(true);
    });
  });

  describe('API call actions', () => {
    it('SET_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = rulesetsReducer(rulesetsInitialState, actions.setRulesetsEntitiesFromApi({ call: Promise.resolve(rulesetsReply), requestId: 'test' }));

      expect(firstState.isPending).toEqual(true);
    });

    it('UPSERT_ENTITIES_FROM_API action should clear current entities and set new ones', () => {
      const firstState = rulesetsReducer(rulesetsInitialState, actions.upsertRulesetsEntitiesFromApi({ call: Promise.resolve(rulesetsReply), requestId: 'test' }));

      expect(firstState.isPending).toEqual(true);
    });
  });
});
