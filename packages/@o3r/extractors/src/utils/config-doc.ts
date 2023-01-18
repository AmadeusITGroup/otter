import { DocComment, TSDocConfiguration, TSDocParser, TSDocTagDefinition, TSDocTagSyntaxKind } from '@microsoft/tsdoc';
import type { CategoryDescription } from '@o3r/core';
import * as ts from 'typescript';
import { getInlineBlockTagContentFromDocComment, getInlineSummaryFromDocComment, getTsDocTextFromNode } from './tsdoc';


/** Configuration information extracted from the TSDoc */
export interface ConfigDocInformation {
  /** Description */
  description: string;

  /** Title (taken from @title tag) */
  title?: string;

  /** label (taken from @label tag) */
  label?: string;

  /** Tags (taken from @tags tag) */
  tags?: string[];

  /** Category (taken from @o3rCategory tag) */
  category?: string;

  /** Category (taken from <o3rCategories> tag) */
  categories?: CategoryDescription[];
}

/**
 * Get description from a given DocComment.
 *
 * @param docComment The DocComment to get description from
 */
export function getDescriptionFromDocComment(docComment: DocComment): string {
  return getInlineSummaryFromDocComment(docComment);
}

/**
 * Get title from a given DocComment.
 *
 *  The title is extracted from @title tag.
 *
 * @param docComment The DocComment to get title from
 */
export function getTitleFromDocComment(docComment: DocComment): string | undefined {
  return getInlineBlockTagContentFromDocComment(docComment, '@title');
}

/**
 * Get label from a given DocComment.
 *
 *  The label is extracted from @label tag.
 *
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
 *
 * @example
 * /**
 *  ...
 *  @tags [booking, ssci, servicing
 *  upSell, pax_page]
 *  \/
 * @param docComment The DocComment to get tags from
 */
export function getTagsFromDocComment(docComment: DocComment): string[] | undefined {
  const tags = getInlineBlockTagContentFromDocComment(docComment, '@tags');
  return (tags && tags.indexOf(']') > 0) && tags.split(']')[0].match(/\w+/g) || undefined;
}

/**
 * Get category from a given DocComment.
 *
 *  The category is extracted from @o3rCategory tag.
 *
 * @param docComment The DocComment to get category from
 */
function getCategoryFromDocText(docComment: string): string | undefined {
  const matchResult = docComment.match(/@o3rCategory (\w+)/);
  return (matchResult && matchResult[1]) ? matchResult[1].trim() : undefined;
}

/**
 * Get category from a given DocComment.
 *
 *  The category is extracted from <o3rCategories> tag.
 *
 * @param docComment The DocComment to get category from
 */
function getCategoriesFromDocText(docComment: string): CategoryDescription[] | undefined {
  const categoriesWithDescription: CategoryDescription[] = [];
  const categoriesString = docComment.match(/<o3rCategories>(.+)<\/o3rCategories>/s);
  if (categoriesString) {
    const categoriesArray = categoriesString[1].match(/<(\w+)>([^<]+)/gs);
    if (categoriesArray) {
      for (const catStringWithDesc of categoriesArray) {
        const catWithDesc = catStringWithDesc.match(/<(\w+)>(.+)/s);
        if (catWithDesc && catWithDesc[1] && catWithDesc[2]) {
          const category = catWithDesc[1];
          const description = catWithDesc[2].replace(/\r?\n \*/g, '').trim();
          categoriesWithDescription.push({label: description, name: category});
        } else {
          throw Error(`Invalid categories description format: ${categoriesString[1]}`);
        }
      }
    }
  }
  return categoriesWithDescription.length ? categoriesWithDescription : undefined;
}

/**
 * TSDocParser wrapper with a custom TSDoc configuration compatible with configuration doc.
 */
export class ConfigDocParser {
  /** TSDoc parser */
  private tsDocParser: TSDocParser;

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
   *
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
        categories: getCategoriesFromDocText(docText)
      };
    }
  }
}
