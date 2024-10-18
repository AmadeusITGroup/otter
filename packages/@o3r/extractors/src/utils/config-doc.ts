import {
  DocComment,
  TSDocConfiguration,
  TSDocParser,
  TSDocTagDefinition,
  TSDocTagSyntaxKind
} from '@microsoft/tsdoc';
import type {
  CategoryDescription,
  ConfigPropertyWidget,
  ConfigPropertyWidgetParameters
} from '@o3r/core';
import * as ts from 'typescript';
import {
  getInlineBlockTagContentFromDocComment,
  getInlineSummaryFromDocComment,
  getTsDocTextFromNode
} from './tsdoc';

/** Configuration information extracted from the TSDoc */
export interface ConfigDocInformation {
  /** Description */
  description: string;

  /** Title (taken from `@title` tag) */
  title?: string;

  /** label (taken from `@label` tag) */
  label?: string;

  /** Tags (taken from `@tags` tag) */
  tags?: string[];

  /** Category (taken from `@o3rCategory` tag) */
  category?: string;

  /** Category (taken from @o3rCategories tag) */
  categories?: CategoryDescription[];

  /** Widget information (taken from `@o3rWidget` and `@o3rWidgetParam` tag) */
  widget?: ConfigPropertyWidget;

  /** `@o3rRequired` tag presence */
  required?: boolean;
}

/**
 * Get description from a given DocComment.
 * @param docComment The DocComment to get description from
 */
export function getDescriptionFromDocComment(docComment: DocComment): string {
  return getInlineSummaryFromDocComment(docComment);
}

/**
 * Get title from a given DocComment.
 *
 * The title is extracted from @title tag.
 * @param docComment The DocComment to get title from
 */
export function getTitleFromDocComment(docComment: DocComment): string | undefined {
  return getInlineBlockTagContentFromDocComment(docComment, '@title');
}

/**
 * Get widget information from a given DocComment.
 *
 * The widget information are extracted from @o3rWidget and @o3rWidgetParam tag.
 * @param docText The tsdoc text to get widget information from
 */
export function getWidgetInformationFromDocComment(docText: string): ConfigPropertyWidget | undefined {
  const widgetType = docText.match(/@o3rWidget (.*)/)?.[1].trim();
  if (!widgetType) {
    return;
  }

  const widgetParameters = Array.from(docText.matchAll(/@o3rWidgetParam (.*)/g))
    .map((match) => match[1].trim())
    .reduce((acc: ConfigPropertyWidgetParameters, text) => {
      const firstSpaceIndex = text.indexOf(' ');
      if (firstSpaceIndex < 1) {
        return acc;
      }
      const paramName = text.slice(0, firstSpaceIndex);
      const valueText = text.slice(firstSpaceIndex + 1);

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        acc[paramName] = JSON.parse(valueText);
      } catch (e: any) {
        throw new Error(`Invalid JSON format:  ${valueText}\n${e.toString()}`);
      }

      return acc;
    }, {});

  return {
    type: widgetType,
    parameters: Object.keys(widgetParameters || {}).length > 0 ? widgetParameters : undefined
  };
}

/**
 * Get label from a given DocComment.
 *
 * The label is extracted from @label tag.
 * @param docText The DocComment to get category from
 */
function getLabelFromDocText(docText: string): string | undefined {
  const matchResult = docText.match(/@label (.*)/);
  return (matchResult && matchResult[1]) ? matchResult[1].trim() : undefined;
}

/**
 * Get tags from a given DocComment.
 *
 * The tags are extracted from @tags tag.
 * The following format should be matched.
 * @param docComment The DocComment to get tags from
 * @example
 * ```typescript
 * /**
 *  ...
 *  @tags [booking, ssci, servicing
 *  upSell, pax_page]
 *  \/
 * ```
 */
export function getTagsFromDocComment(docComment: DocComment): string[] | undefined {
  const tags = getInlineBlockTagContentFromDocComment(docComment, '@tags');
  return (tags && tags.indexOf(']') > 0) && tags.split(']')[0].match(/\w+/g) || undefined;
}

/**
 * Is the tag `@o3rRequired` present in `docText`
 * @param docText
 */
export function isO3rRequiredTagPresent(docText: string): boolean {
  return /@o3rRequired/.test(docText);
}

/**
 * Get category from a given DocComment.
 *
 * The category is extracted from @o3rCategory tag.
 * @param docComment The DocComment to get category from
 */
function getCategoryFromDocText(docComment: string): string | undefined {
  const matchResult = docComment.match(/@o3rCategory (\w+)/);
  return (matchResult && matchResult[1]) ? matchResult[1].trim() : undefined;
}

/**
 * Get categories from a given DocComment.
 *
 * The categories are extracted from the @o3rCategories tags.
 * @param docComment The DocComment to get categories from
 */
export function getCategoriesFromDocText(docComment: string): CategoryDescription[] | undefined {
  const categoriesWithDescription: CategoryDescription[] = [];
  const categoriesString = Array.from(docComment.matchAll(/@o3rCategories (.*)/g)).map((match) => match[1].trim());
  if (categoriesString) {
    for (const category of categoriesString) {
      const firstSpaceIndex = category.indexOf(' ');
      if (firstSpaceIndex === -1) {
        const categoryName = category;
        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
        categoriesWithDescription.push({ name: categoryName, label: categoryLabel });
      } else {
        const categoryName = category.slice(0, firstSpaceIndex);
        const categoryLabel = category.slice(firstSpaceIndex + 1);
        categoriesWithDescription.push({ name: categoryName, label: categoryLabel });
      }
    }
  }
  return categoriesWithDescription.length > 0 ? categoriesWithDescription : undefined;
}

/**
 * TSDocParser wrapper with a custom TSDoc configuration compatible with configuration doc.
 */
export class ConfigDocParser {
  /** TSDoc parser */
  private readonly tsDocParser: TSDocParser;

  constructor() {
    const customConfiguration = new TSDocConfiguration();

    const customInlineDefinition = new TSDocTagDefinition({
      tagName: '@title',
      syntaxKind: TSDocTagSyntaxKind.BlockTag
    });

    const customBlockDefinition = new TSDocTagDefinition({
      tagName: '@tags',
      syntaxKind: TSDocTagSyntaxKind.BlockTag
    });

    customConfiguration.addTagDefinitions([
      customInlineDefinition,
      customBlockDefinition
    ]);

    this.tsDocParser = new TSDocParser(customConfiguration);
  }

  /**
   * Parse the configuration information from a given node.
   * @param source Typescript SourceFile node of the file
   * @param node Node to get the TSDoc text from
   */
  public parseConfigDocFromNode(source: ts.SourceFile, node: ts.Node): ConfigDocInformation | undefined {
    const docText = getTsDocTextFromNode(source, node);

    if (docText) {
      const docComment = this.tsDocParser.parseString(docText).docComment;

      return {
        description: getDescriptionFromDocComment(docComment),
        title: getTitleFromDocComment(docComment),
        label: getLabelFromDocText(docText),
        tags: getTagsFromDocComment(docComment),
        category: getCategoryFromDocText(docText),
        categories: getCategoriesFromDocText(docText),
        widget: getWidgetInformationFromDocComment(docText),
        required: isO3rRequiredTagPresent(docText)
      };
    }
  }
}
