export * from './<%= name %>.component';
<% if (useOtterConfig) { %>export * from './<%= name %>.config';
<% } %><% if (useContext) { %>export * from './<%= name %>.context';
<% } %>export * from './<%= name %>.module';
