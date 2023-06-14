/* eslint-disable @typescript-eslint/naming-convention */
import {<%= apiModel %>} from '<%= packageName %>';

import {<% if (identified) { %>CombineConfig, <% } %>CombineResult, CreateInput, defaultCombine, <% if (identified) { %>generateId, IdentifiedResource, <% } %>Mock, RecursivePartial, Repository} from '../common';

//
// TEMPLATES
//

/** The known names of <%= apiModel %> templates */
export type <%= apiModel %>TemplateNames = 'DEFAULT'; // in case of more templates, please use the format 'NAME1' | 'NAME2';

/**
 * An inventory of predefined <%= apiModel %> templates
 */
export const <%= apiModel %>Templates: Record<<%= apiModel %>TemplateNames, RecursivePartial<<%= apiModel %>>> = {
  DEFAULT: {}
};

/**
 * The type of a mocked <%= apiModel %>
 */
export type Mock<%= apiModel %> = Mock<<%= apiModel %>>;
// Add all optional properties of <%= apiModel %> that are defined in the create<%= apiModel %> method,
// so none of them are undefined in the result of the method
// Format: Mock<apiModel, 'propOne' | 'propTwo'>

//
// CREATE FACTORY
//

/**
 * The create input for <%= apiModel %>
 */
export interface Create<%= apiModel %>Input extends CreateInput<<%= apiModel %>><% if (identified) { %>, IdentifiedResource<% } %> {}

/**
 * The create factory for <%= apiModel %>
 * @param input configuration related to the creation
 */
export function create<%= apiModel %>(input: Create<%= apiModel %>Input = {}): Mock<%= apiModel %> {
  const template = input.template || <%= apiModel %>Templates.DEFAULT;
  const mock = {
    ...template<% if (identified) { %>,
    id: generateId('<%= apiModel %>', template.id, input.id)<% } %>
  } as Mock<%= apiModel %>;
  return mock;
}


//
// REPOSITORY
//

/** The known names of <%= apiModel %>Repository items */
interface <%= apiModel %>RepositoryType extends Repository<Mock<%= apiModel %>> { // in case of more items, please include new properties in the interface
}

/**
 * Repository containing predefined <%= apiModel %> mock items
 */
export const <%= apiModel %>Repository: <%= apiModel %>RepositoryType = {
  DEFAULT: create<%= apiModel %>()
};

//
// COMBINE FACTORY
//

/**
 * The combine configuration for list of <%= apiModel %>
 */
export interface Combine<%= apiModel %>Config <% if (identified) { %>extends CombineConfig <% } %>{}

/**
 * The combine factory for list of <%= apiModel %>
 * @param items the items to be combined
 * @param config the combine configuration
 */
export function combine<%= dapiModels %>(
  items: RecursivePartial<<%= apiModel %>>[] = [<%= apiModel %>Repository.DEFAULT],
  <% if (!identified) { %>_<% } %>config: Partial<Combine<%= apiModel %>Config> = {}
): CombineResult<Mock<%= apiModel %>> {
  return defaultCombine(items, create<%= apiModel %><% if (identified) { %>, config<% } %>);
}
