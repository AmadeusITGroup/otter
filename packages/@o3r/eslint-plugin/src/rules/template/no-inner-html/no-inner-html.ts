import type {
  TmplAstElement
} from '@angular/compiler';
import {
  createRule
} from '../../utils';
import {
  getTemplateParserServices
} from '../utils';

/** Rule Name */
export const name = 'no-inner-html';

type Messages = 'error' | 'fix';

export default createRule<[], Messages>({
  name,
  defaultOptions: [],
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Ensures that your template does not use innerHTML'
    },
    schema: [],
    messages: {
      error: 'Unexpected use of innerHTML',
      fix: 'Replace innerHTML by innerText'
    },
    fixable: 'code'
  },
  create: (context) => {
    // To throw error if use without @angular-eslint/template-parser
    getTemplateParserServices(context);

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Element$1': (node: TmplAstElement) => {
        const innerHTMLAttribute = node.attributes.find((a) => /innerhtml/i.test(a.name));
        if (innerHTMLAttribute && innerHTMLAttribute.keySpan) {
          context.report({
            messageId: 'error',
            loc: {
              column: innerHTMLAttribute.keySpan.start.col,
              line: innerHTMLAttribute.keySpan.start.line,
              end: {
                column: innerHTMLAttribute.keySpan.end.col,
                line: innerHTMLAttribute.keySpan.end.line
              },
              start: {
                column: innerHTMLAttribute.keySpan.start.col,
                line: innerHTMLAttribute.keySpan.start.line
              }
            },
            fix: (fixer) => fixer.replaceTextRange([innerHTMLAttribute.keySpan!.start.offset, innerHTMLAttribute.keySpan!.end.offset], 'innerText'),
            suggest: [{
              messageId: 'fix',
              fix: (fixer) => fixer.replaceTextRange([innerHTMLAttribute.keySpan!.start.offset, innerHTMLAttribute.keySpan!.end.offset], 'innerText')
            }]
          });
        }
      }
    };
  }
});
