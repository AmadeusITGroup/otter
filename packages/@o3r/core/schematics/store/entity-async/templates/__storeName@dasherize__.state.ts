<% if (hasSDK) {%>import {<%= modelName %>} from '<%= sdkPackage %>';
<% } %>import {EntityState} from '@ngrx/entity';
import {AsyncStoreItem} from '@o3r/core';

/**
 * <%= hasSDK ? modelName : storeName %> model
 */
export interface <%= storeModelName %> extends AsyncStoreItem<% if (hasSDK) {%>, <%= modelName %><% } %>{
  <% if (!hasSDK) {%><%= modelIdPropName %>: string;<% } %>
}

/**
 * <%= storeName %> state details
 */
export interface <%= storeName %>StateDetails extends AsyncStoreItem {}

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
