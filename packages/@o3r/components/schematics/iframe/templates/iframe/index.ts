export * from './<%= name %>.component';
<% if (useOtterConfig) { %>export * from './<%= name %>.config';
<% } %><% if (!standalone) { %>export * from './<%= name %>.module';
<% } %>
