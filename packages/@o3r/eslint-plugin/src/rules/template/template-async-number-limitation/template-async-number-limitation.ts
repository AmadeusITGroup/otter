import type { TmplAstElement } from '@angular/compiler';
import { getTemplateParserServices } from '../utils';
import { createRule } from '../../utils';

interface Options {
  maximumAsyncOnTag: number;
}

/** Rule Name */
export const name = 'template-async-number-limitation';

const defaultOptions: [Options] = [{
  maximumAsyncOnTag: 5
}];

export default createRule<[Options, ...any], 'tooManyAsyncOnTag', any>({
  name,
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Ensures that your template does not use too many Async pipes that can slow down your application.',
      recommended: 'error'
    },
    schema: [
      {
        type: 'object',
        properties: {
          maximumAsyncOnTag: {
            type: 'integer',
            description: 'Maximum number of async pipe on a single HTML element'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      tooManyAsyncOnTag: 'The HTML element contains {{asyncNumber}} async pipes, the limit is {{maximumAsyncOnTag}}'
    },
    fixable: undefined
  },

  defaultOptions,

  create: (context) => {
    const parserServices = getTemplateParserServices(context);
    const options = context.options[0] || defaultOptions[0];
    const asyncRegExp = /\| *async\b/g;


    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Element$1': ({ attributes, inputs, sourceSpan }: TmplAstElement) => {
        const values: string[] = [
          ...attributes.map(({ value }) => value),
          ...inputs.map((attr) => attr.value.toString())
        ];
        const asyncNumber = values
          .reduce((acc, value) => acc + (value.match(asyncRegExp)?.length ?? 0), 0);

        if (asyncNumber > options.maximumAsyncOnTag) {
          const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
          context.report({
            messageId: 'tooManyAsyncOnTag',
            data: {
              asyncNumber,
              maximumAsyncOnTag: options.maximumAsyncOnTag
            },
            loc
          });
        }
      }
    };
  }
});
