export * from './<%= name %>.component';
<% if (useContext) { %>export * from './<%= name %>.context';
<% } %><% if (!standalone) { %>export * from './<%= name %>.module';
<% } %>
