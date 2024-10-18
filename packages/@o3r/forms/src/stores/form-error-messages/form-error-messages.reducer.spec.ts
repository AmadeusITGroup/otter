import * as actions from './form-error-messages.actions';
import {
  formErrorMessagesInitialState,
  formErrorMessagesReducer
} from './form-error-messages.reducer';
import {
  FormErrorMessagesState
} from './form-error-messages.state';

describe('FormErrorMessages Store reducer', () => {
  let entitiesState: FormErrorMessagesState;
  const firstFormErrorMessages: any = { formId: 'formErrorMessages1', genericItems: [] };
  const secondFormErrorMessages: any = { formId: 'formErrorMessages2', genericItems: [] };

  it('should have the correct initial state', () => {
    expect(formErrorMessagesInitialState.ids.length).toBe(0);
  });

  it('should by default return the initial state', () => {
    const state = formErrorMessagesReducer(formErrorMessagesInitialState, { type: 'fake' } as any);

    expect(state).toEqual(formErrorMessagesInitialState);
  });

  describe('Actions on state details', () => {
    it('RESET action should return initial state', () => {
      entitiesState = formErrorMessagesReducer(formErrorMessagesInitialState, actions.setFormErrorMessagesEntities({ entities: [firstFormErrorMessages, secondFormErrorMessages] }));
      const state = formErrorMessagesReducer(entitiesState, actions.resetFormErrorMessages());

      expect(state).toEqual(formErrorMessagesInitialState);
    });
  });

  describe('Entity actions', () => {
    it('SET_ENTITIES action should clear current entities and set new ones', () => {
      const firstState = formErrorMessagesReducer(formErrorMessagesInitialState, actions.setFormErrorMessagesEntities({ entities: [firstFormErrorMessages] }));
      const secondState = formErrorMessagesReducer(firstState, actions.setFormErrorMessagesEntities({ entities: [secondFormErrorMessages] }));

      expect(secondState.ids.length).toEqual(1);
      expect((secondState.ids as string[]).find((id) => (id === firstFormErrorMessages.formId))).toBeUndefined();
      expect((secondState.ids as string[]).find((id) => (id === secondFormErrorMessages.formId))).toBeDefined();
    });

    it('UPSERT_ENTITIES action should update existing entities and add the new ones', () => {
      const firstFormErrorMessagesUpdated = { ...firstFormErrorMessages, genericField: 'genericId' };
      const firstState = formErrorMessagesReducer(formErrorMessagesInitialState, actions.setFormErrorMessagesEntities({ entities: [firstFormErrorMessages] }));
      const secondState = formErrorMessagesReducer(firstState,
        actions.upsertFormErrorMessagesEntities({ entities: [firstFormErrorMessagesUpdated, secondFormErrorMessages] }));

      expect(secondState.ids.length).toEqual(2);
      expect((secondState.ids as string[]).find((id) => (id === firstFormErrorMessages.formId))).toBeDefined();
      expect((secondState.ids as string[]).find((id) => (id === secondFormErrorMessages.formId))).toBeDefined();
    });

    it('CLEAR_ENTITIES action should clear only the entities', () => {
      const firstState = formErrorMessagesReducer(formErrorMessagesInitialState, actions.setFormErrorMessagesEntities({ entities: [firstFormErrorMessages, secondFormErrorMessages] }));
      const secondState = formErrorMessagesReducer(firstState, actions.clearFormErrorMessagesEntities());

      expect(secondState.ids.length).toEqual(0);
    });

    it('REMOVE_ENTITY should remove a single entity form the store using its id', () => {
      const firstState = formErrorMessagesReducer(formErrorMessagesInitialState,
        actions.setFormErrorMessagesEntities({ entities: [firstFormErrorMessages, secondFormErrorMessages] }));
      const secondState = formErrorMessagesReducer(firstState, actions.removeFormErrorMessagesEntity({ id: 'formErrorMessages1' }));

      expect(secondState.ids.length).toEqual(1);
      expect(secondState.ids[0]).toEqual('formErrorMessages2');
    });
  });
});
