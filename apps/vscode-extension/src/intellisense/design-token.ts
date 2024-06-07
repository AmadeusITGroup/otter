import { CompletionItem, CompletionItemKind, CompletionItemProvider, HoverProvider } from 'vscode';
import { type DesignTokenVariableSet, type DesignTokenVariableStructure, getCssTokenValueRenderer, parseDesignTokenFile } from '@o3r/design';
import * as vscode from 'vscode';
import * as path from 'node:path';

type DesignTokenCache = {
  lastExtractionTimestamp: number;
  tokenStructure: DesignTokenVariableSet;
};

const readFile = async (filePat: string) => (await vscode.workspace.fs.readFile(vscode.Uri.parse(filePat))).toString();

const getFilesPatternsFromProjectConfiguration = async (currentFile: string): Promise<string[] | undefined> => {
  const angularFile = vscode.workspace.findFiles('angular.json');
  const nxFile = vscode.workspace.findFiles('nx.json');
  const projectFiles = vscode.workspace.findFiles('**/project.json')
    .then((files) => files.filter((file) => !path.relative(path.dirname(file.fsPath), currentFile).includes('..')));
  const configFiles = (await Promise.all([angularFile, nxFile, projectFiles])).flat();
  if (configFiles.length === 0) {
    return;
  }

  const walkThroughProjectFiles = (node: any, mem: Set<string> = new Set()) => {
    if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
      if (node.executor === '@o3r/design:generate-css' || node.builder === '@o3r/design:generate-css') {
        node.options?.designTokenFilePatterns?.forEach((pattern: string) => mem.add(pattern));
        if (node.configurations) {
          Object.values(node.configurations).forEach((config: any) => {
            config.designTokenFilePatterns?.forEach((pattern: string) => mem.add(pattern));
          });
        }
      } else {
        Object.values(node).forEach((value) => walkThroughProjectFiles(value, mem));
      }
    }
    return mem;
  };

  const patterns = (await Promise.all(configFiles
    .map(async (file) => {
      const content = JSON.parse((await vscode.workspace.fs.readFile(file)).toString());
      return [...walkThroughProjectFiles(content)];
    })
  )).flat();

  return patterns.length > 0 ? patterns : undefined;
};

const getDesignTokens = async (currentFile: string, cache: Map<string, DesignTokenCache>) => {
  const lastExtractionTimestamp = Date.now();
  const filesPatterns = vscode.workspace.getConfiguration('otter.design').get<string[]>('filesPatterns', await getFilesPatternsFromProjectConfiguration(currentFile) || ['**/*.token.json']);
  const uris = (await Promise.all(filesPatterns
    .map((pattern) => vscode.workspace.findFiles(pattern))))
    .reduce((acc, curr) => acc.concat(curr), []);

  return (await Promise.all(uris
    .map(async (uri) => {
      // Check if the lastest extraction is before the latest modification time of the file
      if (!cache.has(uri.fsPath) || cache.get(uri.fsPath)!.lastExtractionTimestamp < (await vscode.workspace.fs.stat(uri)).mtime) {
        const tokenStructure = await parseDesignTokenFile(uri.fsPath, { readFile });
        cache.set(uri.fsPath, {
          lastExtractionTimestamp,
          tokenStructure
        });
      }
      return cache.get(uri.fsPath)!.tokenStructure;
    })))
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

export const designTokenCompletionItemAndHoverProviders = (cache: Map<string, DesignTokenCache> = new Map()) : CompletionItemProvider<CompletionItem> & HoverProvider => {
  const renderer = getCssTokenValueRenderer();
  return {
    provideCompletionItems: async (document, position) => {
      const line = document.lineAt(position).text;
      const lineUntilPosition = line.slice(0, position.character);
      const tokens = await getDesignTokens(document.uri.fsPath, cache);
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
      const tokens = await getDesignTokens(document.uri.fsPath, cache);
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range).replace(/^(--|\$)/, '');

      if (tokens.has(word)) {
        return new vscode.Hover(getTokenDetail(tokens.get(word)!, tokens));
      }
    }
  };
};
