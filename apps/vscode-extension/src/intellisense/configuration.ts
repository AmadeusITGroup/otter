import { CompletionItem, CompletionItemKind, CompletionItemProvider, type OutputChannel, SnippetString } from 'vscode';

interface ConfigurationTags {
  /** @see CompletionItem.documentation */
  description: string;
  /** @see CompletionItem.detail */
  detail?: string;
  /** @see CompletionItem.insertText */
  snippet?: string;
}

export const configurationCompletionTriggerChar = '@';

const getCompletionsItemsFromConfigurationTags = (configurationTags: Record<string, ConfigurationTags>) => {
  return Object.entries(configurationTags).map(([label, { detail, description, snippet }]) => {
    const completion = new CompletionItem({ label: `${label} `, detail }, CompletionItemKind.Keyword);
    completion.documentation = description;
    completion.insertText = typeof snippet !== 'undefined' ? new SnippetString(`${label} ${snippet}`) : undefined;

    return completion;
  });
};

const findWidgetNameInComment = (comment: string) => {
  return comment.match(/@o3rWidget (\w+)/)?.[1];
};

const finWidgetParamNamesInComment = (comment: string) => {
  return new Set(Array.from(comment.matchAll(/@o3rWidgetParam (\w+)/g)).map((match) => match[1]));
};

const getConfigurationTagsFromEslintConfig = (eslintConfig: any, comment: string, fileText: string): Record<string, ConfigurationTags> => {
  const o3rWidgetsTagsRulesConfig = eslintConfig.rules?.['@o3r/o3r-widgets-tags']?.[1] || {};
  const o3rCategoriesTagsRulesConfig = eslintConfig.rules?.['@o3r/o3r-categories-tags']?.[1] || {};

  const configurationTags = {
    tags: {
      description: 'Tag to use CMS tags for configuration interface',
      detail: '[one, two, three]',
      snippet: '[${1:one}]'
    },
    label: {
      description: 'Tag to use to define a readable name for configuration property in the CMS',
      detail: 'Readable configuration property name',
      snippet: '${1:Name}'
    },
    title: {
      description: 'Tag to use to define a readable name for configuration interface in the CMS',
      detail: 'Readable configuration name',
      snippet: '${1:Name}'
    },
    o3rRequired: {
      description: 'Tag to use to define if a value must be specify in the CMS'
    },
    o3rCategories: {
      description: 'Tag to use to define a configuration category',
      detail: 'Configuration category',
      snippet: '${1:Identifier} ${2:ReadableName}'
    },
    o3rCategory: {
      description: 'Tag to use CMS category for configuration property',
      detail: 'categoryName',
      snippet: `\${1|${
        (o3rCategoriesTagsRulesConfig.globalConfigCategories || [])
          .concat(Array.from(fileText.matchAll(/@o3rCategories (\w+)/g)).map((match) => match[1]))
          .join(',')
      }|}`
    }
  };

  if (!Object.keys(o3rWidgetsTagsRulesConfig?.widgets || {}).length) {
    return configurationTags;
  }

  const widgetName = findWidgetNameInComment(comment);
  const widgetConfig = widgetName ? o3rWidgetsTagsRulesConfig.widgets[widgetName] : {};
  const paramsPresent = finWidgetParamNamesInComment(comment);
  const widgetParamsToPropose = Object.keys(widgetConfig).filter((paramName) => !paramsPresent.has(paramName));

  return {
    ...configurationTags,
    ...(!widgetName ? {
      o3rWidget: {
        description: 'Tag to use CMS widget for configuration property',
        detail: 'widgetName',
        snippet: `\${1|${Object.keys(o3rWidgetsTagsRulesConfig.widgets).join(',')}|}`
      }
    } : {}),
    ...(widgetParamsToPropose.length ? {
      o3rWidgetParam: {
        description: 'Tag to use CMS widget parameter for configuration property',
        detail: 'paramName paramValue',
        snippet: `\${1|${widgetParamsToPropose.join(',')}|} \${2:paramValue}`
      }
    } : {})
  };
};

export const configurationCompletionItemProvider = (options: { channel: OutputChannel }): CompletionItemProvider<CompletionItem> => {
  const eslint = import('eslint')
    // eslint-disable-next-line @typescript-eslint/naming-convention -- External package defined name
    .then(({ ESLint }) => new ESLint())
    .catch((err) => {
      options.channel.appendLine('Error during ESLint loading:');
      options.channel.appendLine(JSON.stringify(err));
      return undefined;
    });

  return {
    provideCompletionItems: async (doc, pos) => {
      const line = doc.lineAt(pos).text;
      const lineUntilPos = line.slice(0, pos.character);

      if (!lineUntilPos.includes(configurationCompletionTriggerChar)) {
        return [];
      }

      const fileText = doc.getText();
      const jsDocCommentMatcher = /\/\*\*[^*](?:\r|\n|.)*?\*\//g;
      const posInDoc = doc.offsetAt(pos);
      const match = Array.from(fileText.matchAll(jsDocCommentMatcher)).find((m) => {
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

      if (lineFromTriggerChar.match(/\s/)) {
        return [];
      }

      const config = await (await eslint)?.calculateConfigForFile(doc.fileName) || {};
      const configurationTags = getConfigurationTagsFromEslintConfig(config, match[0], fileText);

      return getCompletionsItemsFromConfigurationTags(configurationTags);
    }
  };
};
