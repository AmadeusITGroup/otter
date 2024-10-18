import { DocComment, DocExcerpt, DocNode } from '@microsoft/tsdoc';
import * as ts from 'typescript';

/**
 * Get inline text from a given DocNode.
 * @param docNode The DocNode to get inline text from
 */
export function getInlineTextFromDocNode(docNode: DocNode): string {
  let result = '';
  if (docNode instanceof DocExcerpt) {
    result += docNode.content.toString();
  }
  for (const childNode of docNode.getChildNodes()) {
    if (['BlockTag', 'HtmlStartTag', 'HtmlEndTag'].includes(childNode.kind)) {
      break;
    }
    const renderedChild = getInlineTextFromDocNode(childNode);
    if (renderedChild.length > 0) {
      result += ' ' + renderedChild;
    }
  }

  return result.trim();
}

/**
 * Get summary as inline text from a given DocComment.
 * @param docComment The DocComment to get inline summary from
 */
export function getInlineSummaryFromDocComment(docComment: DocComment): string {
  return getInlineTextFromDocNode(docComment.summarySection);
}

/*
* Get block tag content as inline text from given DocComment and tag name.
*
* @param docComment The DocComment to get inline block tag content from
* @param tagName The name of the block tag to get inline content from
*/
/**
 * @param docComment
 * @param tagName
 */
export function getInlineBlockTagContentFromDocComment(docComment: DocComment, tagName: string): string | undefined {
  const blockTag = docComment.customBlocks.find((block) => block.blockTag.tagName === tagName);
  return blockTag && getInlineTextFromDocNode(blockTag.content);
}

/**
 * Get the TSDoc text from a given node.
 * @param source Typescript SourceFile node of the file
 * @param node Node to get the TSDoc text from
 */
export function getTsDocTextFromNode(source: ts.SourceFile, node: ts.Node): string | undefined {
  const fullText = source.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
  if (commentRanges && commentRanges.length > 0) {
    const jsDocRange = commentRanges.at(-1)!;
    return fullText.slice(jsDocRange.pos, jsDocRange.end);
  }
}

