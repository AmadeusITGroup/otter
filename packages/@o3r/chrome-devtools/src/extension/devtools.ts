// Register the devtools extension
chrome.devtools.panels.create('Otter', 'assets/extension/get_started16.png', 'panel/app-devtools.html', (_panel) => {});
// Register the sidebar pane in the elements extension
chrome.devtools.panels.elements.createSidebarPane('Otter', (sidebar) => {
  sidebar.setPage('components/app-components.html');
});
