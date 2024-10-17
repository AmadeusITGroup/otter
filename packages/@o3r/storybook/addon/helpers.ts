/**
 * Download a file base of content
 * @param content File content
 * @param type File type
 * @param id ID of the temporary link
 */
export function downloadFile(content: string, type: string, id = 'generated-link') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.id = id;
  link.target = '_blank';
  document.body.append(link);
  link.click();
  link.remove();
}

/**
 * Generate CSS file based of theme map
 * @param theme Map of CSS variables to include in the CSS generated file
 * @param baseTheme Map of CSS variables to compare to generate diff variable only
 */
export function generateThemeCss(theme: Record<string, string>, baseTheme: Record<string, string> = {}) {
  return `:root {\n${Object.entries(theme).filter(([name, value]) => value !== baseTheme[name]).map(([name, value]) => `  --${name}: ${value};`).join('\n')}\n}`;
}
