<% if(generateComponentIndex) { %>export * from './container/index';
export * from './presenter/index';
<% } else { %>export * from './<%=folderName%>/index';<% } %>
