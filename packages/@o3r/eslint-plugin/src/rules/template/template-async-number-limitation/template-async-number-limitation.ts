import type {
  TmplAstElement
} from '@angular/compiler';
import {
  createRule
} from '../../utils';
import {
  getTemplateParserServices
} from '../utils';

interface Options {
  maximumAsyncOnTag: number;
}

/** Rule Name */
export const name = 'template-async-number-limitation';

const defaultOptions: [Options] = [{
  maximumAsyncOnTag: 5
}];

export default createRule<[Options, ...any], 'tooManyAsyncOnTag'>({
  name,
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Ensures that your template does not use too many Async pipes that can slow down your application.'
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

  create: (context, [options]: Readonly<[Options, ...any]>) => {
    const parserServices = getTemplateParserServices(context);
    const asyncRegExp = /\| *async\b/g;
    const rule = ({ attributes, inputs, sourceSpan }: TmplAstElement) => {
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
    };

    return {
      Element$1: rule
    };
  }
});
