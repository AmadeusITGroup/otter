import { CompletionItem, CompletionItemKind, CompletionItemProvider, SnippetString } from 'vscode';

interface ConfigurationTags {
  /** @see CompletionItem.documentation */
  description: string;
  /** @see CompletionItem.detail */
  detail: string;
  /** @see CompletionItem.insertText */
  snippet: string;
}

export const configurationCompletionTriggerChar = '@';

export const configurationCompletionItemProvider = () : CompletionItemProvider<CompletionItem> => {
  const configurationTags: Record<string, ConfigurationTags> = {
    o3rWidget: {
      description: 'Tag to use CMS widget for configuration',
      detail: 'widgetName',
      // TODO compute snippet thanks to eslint config to propose only valid widgetName
      snippet: '${1:widgetName}'
    },
    o3rWidgetParam: {
      description: 'Tag to use CMS widget parameter for configuration',
      detail: 'paramName paramValue',
      // TODO compute snippet thanks to eslint config to propose only valid paramName and paramValue
      snippet: '${1:paramName} ${2:paramValue}'
    }
  };

  const completions = Object.entries(configurationTags).map(([label, { detail, description, snippet }]) => {
    const completion = new CompletionItem({ label: `${label} `, detail }, CompletionItemKind.Keyword);
    completion.documentation = description;
    completion.insertText = new SnippetString(`${label} ${snippet}`);

    return completion;
  });

  return {
    provideCompletionItems: (doc, pos) => {
      const line = doc.lineAt(pos).text;
      const lineUntilPos = line.slice(0, pos.character);

      if (!lineUntilPos.includes(configurationCompletionTriggerChar)) {
        return [];
      }

      const text = doc.getText();
      const jsDocCommentMatcher = /\/\*\*[^*](?:\r|\n|.)*?\*\//g;
      const posInDoc = doc.offsetAt(pos);
      const match = Array.from(text.matchAll(jsDocCommentMatcher)).find((m) => {
        const commentStartingPos = m.index || 0;
        const commentEndingPos = commentStartingPos + m[0].length;

        return commentStartingPos > posInDoc || (
          commentStartingPos < posInDoc && commentEndingPos > posInDoc
        );
      });
      const commentStartingPosition = match?.index || 0;

      if (!match || commentStartingPosition > posInDoc) {
        return [];
      }

      const lineFromTriggerChar = lineUntilPos.slice(lineUntilPos.lastIndexOf(configurationCompletionTriggerChar) + 1);

      return !lineFromTriggerChar.match(/\s/)
        ? completions
        : [];
    }
  };
};
