import { CompletionItem, CompletionItemKind, CompletionItemProvider, SnippetString, workspace } from 'vscode';

const importStyling = /@use '@o3r\/styling'( as (?<lib>\w+))?;/;

/**
 * Character that will trigger the vscode autocompletion for styling
 */
export const stylingCompletionTriggerChar = '$';

export const stylingCompletionItemProvider = () : CompletionItemProvider<CompletionItem> => {

  return {
    provideCompletionItems: (doc) => {
      const text = doc.getText();
      const match = text.match(importStyling);
      if (!match) {
        return [];
      }

      const lib = match.groups?.lib || 'styling';
      const o3rVarCompletion = new CompletionItem({
        label: '$o3rVariable',
        detail: ` $example: ${lib}.var('example', #FFF)`
      }, CompletionItemKind.Variable);
      o3rVarCompletion.preselect = true;
      o3rVarCompletion.documentation = 'o3r styling variable';

      const categories = (workspace.getConfiguration('otter.styling.variable').get<string[]>('categories') || []).join(',');
      const types = (workspace.getConfiguration('otter.styling.variable').get<string[]>('types') || []).join(',');
      const shouldDisplayDetails = !!workspace.getConfiguration('otter.styling.variable').get<boolean>('details');
      const details = [];
      if (shouldDisplayDetails) {
        details.push(
          'description: \'${3:description}\'',
          'label: \'${4:label}\'',
          types.length ? `type: '\${5|${types}|}'` : 'type: \'${5:type}\'',
          categories.length ? `category: '\${6|${categories}|}'` : 'category: \'${6:category}\''
        );
      }
      o3rVarCompletion.insertText = new SnippetString(
        `$\${1:var-name}: ${lib}.var('\${1:var-name}', \${2:var-value},`
        + (shouldDisplayDetails ? ` (${details.join(', ')})` : '')
        + ');'
      );

      return [
        o3rVarCompletion
      ];
    }
  };
};
