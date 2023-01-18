import {AsyncStoreItem} from '@o3r/core';
<% if (hasSDK) {%>import {<%= modelName %>} from '<%= sdkPackage %>';
<% } %>
/**
 * <%= storeName %> model
 */
export interface <%= storeName %>Model {
  <% if(hasSDK) { %>model: <%= modelName  %> | null;<% } %>
}

/**
 * <%= modelName %> model details
 */
export interface <%= storeName %>StateDetails extends AsyncStoreItem {
}

/**
 * <%= storeName %> store state
 */
export interface <%= storeName %>State extends <%= storeName %>StateDetails, <%= storeName %>Model {
}

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
