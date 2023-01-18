<% if (generateComponentIndex) { %><% if (!useComponentFixtures) { %>// <% } %>export * from './container/<%=folderName%>-cont.fixture';
<% if (!useComponentFixtures) { %>// <% } %>export * from './presenter/<%=folderName%>-pres.fixture';
<% } else { %><% if (!useComponentFixtures) { %>// <% } %>export * from './<%=folderName%>/fixtures';<% } %>
