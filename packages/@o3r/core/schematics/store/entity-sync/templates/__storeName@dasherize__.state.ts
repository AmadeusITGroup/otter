<% if (hasSDK) {%>import {<%= modelName %>} from '<%= sdkPackage %>';
<% } %>import {EntityState} from '@ngrx/entity';

/**
 * <%= storeName %> model
 */
export interface <%= storeModelName %> <% if (hasSDK) {%> extends <%= modelName %> <% } %>{
  <% if (!hasSDK) {%><%= modelIdPropName %>: string;<% } %>
}

/**
 * <%= storeName %> state details
 */
export interface <%= storeName %>StateDetails {}

/**
 * <%= storeName %> store state
 */
export interface <%= storeName %>State extends EntityState<<%= storeModelName %>>, <%= storeName %>StateDetails {}

/**
 * Name of the <%= storeName %> Store
 */
export const <%= scuStoreName %>_STORE_NAME = '<%= cStoreName %>';

/**
 * <%= storeName %> Store Interface
 */
export interface <%= storeName %>Store {
  /** <%= storeName %> state */
  [<%= scuStoreName %>_STORE_NAME]: <%= storeName %>State;
}
