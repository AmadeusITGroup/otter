import {createFeatureSelector, createSelector} from '@ngrx/store';
import {placeholderTemplateAdapter} from './placeholder-template.reducer';
import {PLACEHOLDER_TEMPLATE_STORE_NAME, PlaceholderTemplateState} from './placeholder-template.state';
import {selectPlaceholderRequestState} from '../placeholder-request';

const {selectEntities} = placeholderTemplateAdapter.getSelectors();

export const selectPlaceholderTemplateState = createFeatureSelector<PlaceholderTemplateState>(PLACEHOLDER_TEMPLATE_STORE_NAME);

/** Select the dictionary of PlaceholderTemplate entities */
export const selectPlaceholderTemplateEntities = createSelector(selectPlaceholderTemplateState, (state) => state && selectEntities(state));

/**
 * Select a specific PlaceholderTemplate
 *
 * @param placeholderId
 */
export const selectPlaceholderTemplateEntity = (placeholderId: string) =>
  createSelector(selectPlaceholderTemplateState, (state) => state?.entities[placeholderId]);

/**
 * Select the ordered rendered placeholder template full data (url, priority etc.) for a given placeholderId
 * Return undefined if the placeholder is not found
 * Returns {orderedRenderedTemplates: undefined, isPending: true} if any of the request is still pending
 *
 * @param placeholderId
 */
export const selectSortedTemplates = (placeholderId: string) => createSelector(
  selectPlaceholderTemplateEntity(placeholderId),
  selectPlaceholderRequestState,
  (placeholderTemplate, placeholderRequestState) => {
    if (!placeholderTemplate || !placeholderRequestState) {
      return;
    }
    // The isPending will be considered true if any of the Url is still pending
    let isPending: boolean | undefined = false;
    const templates: { rawUrl: string; priority: number; renderedTemplate?: string; resolvedUrl: string }[] = [];
    placeholderTemplate.urlsWithPriority.forEach(urlWithPriority => {
      const placeholderRequest = placeholderRequestState.entities[urlWithPriority.rawUrl];
      if (placeholderRequest) {
        // If one of the items is pending, we will wait to display all contents at the same time
        isPending = isPending || placeholderRequest.isPending;
        // Templates in failure will be ignored from the list
        if (!placeholderRequest.isFailure) {
          templates.push({
            rawUrl: urlWithPriority.rawUrl,
            resolvedUrl: placeholderRequest.resolvedUrl,
            priority: urlWithPriority.priority,
            renderedTemplate: placeholderRequest.renderedTemplate
          });
        }
      }
    });
    // No need to perform sorting if still pending
    if (isPending) {
      return {orderedTemplates: undefined, isPending};
    }
    // Sort templates by priority
    const orderedTemplates = templates.sort((template1, template2) => {
      return (template2.priority - template1.priority) || 1;
    }).filter(templateData => !!templateData.renderedTemplate);

    return {orderedTemplates, isPending};
  });

/**
 * Select the ordered rendered templates for a given placeholderId
 * Return undefined if the placeholder is not found
 * Returns {orderedRenderedTemplates: undefined, isPending: true} if any of the request is still pending
 *
 * @param placeholderId
 *
 * @deprecated Please use {@link selectSortedTemplates} instead
 */
export const selectPlaceholderRenderedTemplates = (placeholderId: string) => createSelector(
  selectSortedTemplates(placeholderId),
  (placeholderData) => {
    if (!placeholderData) {
      return;
    }
    return {
      orderedRenderedTemplates: placeholderData.orderedTemplates?.map(placeholder => placeholder.renderedTemplate),
      isPending: placeholderData.isPending
    };
  });
