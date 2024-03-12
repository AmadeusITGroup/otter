import { CompletionItem, CompletionItemKind, CompletionItemProvider, HoverProvider } from 'vscode';
import { DesignTokenVariableSet, DesignTokenVariableStructure, getCssTokenValueRenderer, parseDesignTokenFile } from '@o3r/design';
import * as vscode from 'vscode';
import * as path from 'node:path';

const readFile = async (filePat: string) => (await vscode.workspace.fs.readFile(vscode.Uri.parse(filePat))).toString();

const getDesignTokens = async (currentFile?: string) => {
  const filesPatterns = vscode.workspace.getConfiguration('otter.design').get<string[]>('filesPatterns') || ['**/*.token.json'];
  const uris = (await Promise.all(filesPatterns.map((pattern) => vscode.workspace.findFiles(pattern))))
    .reduce((acc, curr) => acc.concat(curr), []);

  return (await Promise.all(uris.map((uri) => parseDesignTokenFile(uri.fsPath, { readFile }))))
    .reduce((acc: DesignTokenVariableSet, curr) => {
      Array.from(curr.values())
        .filter((token) =>
          !token.extensions.o3rPrivate
          || (
            token.extensions.o3rTargetFile
            && token.context?.basePath
            && currentFile === path.join(token.context?.basePath , token.extensions.o3rTargetFile)
          )
        )
        .forEach((token) => acc.set(token.getKey(), token));
      return acc;
    }, new Map<string, DesignTokenVariableStructure>());
};

const getTokenDetail = (token: DesignTokenVariableStructure, tokens: DesignTokenVariableSet) => [
  'Design token variable',
  ...(token.extensions.o3rMetadata?.label ? [`Label: ${token.extensions.o3rMetadata.label}`] : []),
  ...(token.description ? (`Description: ${token.description}`) : []),
  `Default: ${getCssTokenValueRenderer()(token, tokens)}`,
  ...(token.extensions.o3rMetadata?.category ? [`Category: ${token.extensions.o3rMetadata.category}`] : []),
  ...(token.extensions.o3rMetadata?.tags?.length ? [`Tags: [${token.extensions.o3rMetadata.tags.join(', ')}]`] : [])
].join('\n\n');

export const designTokenCompletionItemAndHoverProviders = () : CompletionItemProvider<CompletionItem> & HoverProvider => {
  const renderer = getCssTokenValueRenderer();
  return {
    provideCompletionItems: async (document, position) => {
      const line = document.lineAt(position).text;
      const lineUntilPosition = line.slice(0, position.character);
      const tokens = await getDesignTokens(document.uri.fsPath);
      return Array.from(tokens.values()).reduce((acc: CompletionItem[], token) => {
        const key = token.getKey();
        const value = renderer(token, tokens, true);
        const documentation = getTokenDetail(token, tokens);
        if (/var\([^,)]*$/.test(lineUntilPosition)) {
          const variableItem = new CompletionItem({ label: `--${key}` }, CompletionItemKind.Variable);
          variableItem.insertText = value.replace(/^var\((.*)\)$/, '$1');
          variableItem.documentation = documentation;
          return acc.concat(variableItem);
        } else {
          const propertyItem = new CompletionItem({ label: key }, CompletionItemKind.Property);
          propertyItem.insertText = value;
          propertyItem.documentation = documentation;
          return acc.concat(propertyItem);
        }
      }, []);
    },
    provideHover: async (document, position) => {
      const tokens = await getDesignTokens(document.uri.fsPath);
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range).replace(/^(--|\$)/, '');

      if (tokens.has(word)) {
        return new vscode.Hover(getTokenDetail(tokens.get(word)!, tokens));
      }
    }
  };
};
