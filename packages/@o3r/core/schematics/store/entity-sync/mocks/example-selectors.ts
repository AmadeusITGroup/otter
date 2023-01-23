export const syncEntitySelectorsContent = `import {createFeatureSelector, createSelector} from '@ngrx/store';
import {exampleAdapter} from './example.reducer';
import {EXAMPLE_STORE_NAME, ExampleState} from './example.state';

const {selectIds, selectEntities, selectAll, selectTotal} = exampleAdapter.getSelectors();

/** Select Example State */
export const selectExampleState = createFeatureSelector<ExampleState>(EXAMPLE_STORE_NAME);

/** Select the array of Example ids */
export const selectExampleIds = createSelector(selectExampleState, selectIds);

/** Select the array of Example */
export const selectAllExample = createSelector(selectExampleState, selectAll);

/** Select the dictionary of Example entities */
export const selectExampleEntities = createSelector(selectExampleState, selectEntities);

/** Select the total Example count */
export const selectExampleTotal = createSelector(selectExampleState, selectTotal);
`;
