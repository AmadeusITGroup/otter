import { convertAnnotatedSourceToFailureCase, RuleTester } from '@angular-eslint/utils';
import templateAsyncNumberLimitation, { name } from './template-async-number-limitation';

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser'
});

ruleTester.run(name, templateAsyncNumberLimitation as any /* workaround for 5.9.0 breaking change on interface */, {
  valid: [
    '',
    '<div ngIf="obs$ | async"></div>',
    { code: '<div ngIf="obs$ | async | async | async | async | async | async"></div>', options: [{ maximumAsyncOnTag: 6 }]},
    { code: '<div ngIf="obs$ | async" [translate]="translations$ | async"></div>', options: [{ maximumAsyncOnTag: 3 }] }
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when there are more than 2 async pipes on a single HTML element',
      annotatedSource: `
        <div ngIf="obs$ | async | async | async"></div>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      options: [{ maximumAsyncOnTag: 2 }],
      messageId: 'tooManyAsyncOnTag',
      data: {
        asyncNumber: 3,
        maximumAsyncOnTag: 2
      }
    }),
    {
      code: '<div ngIf="obs$ | async" [translate]="translations$ | async"></div>',
      options: [{ maximumAsyncOnTag: 1 }],
      errors: [
        {
          messageId: 'tooManyAsyncOnTag',
          data: {
            asyncNumber: 2,
            maximumAsyncOnTag: 1
          },
          line: 1,
          endLine: 1
        }
      ]
    },
    {
      code: `<div ngIf="obs$ | async"
[translate]="translations$ | async">
</div>`,
      options: [{ maximumAsyncOnTag: 1 }],
      errors: [
        {
          messageId: 'tooManyAsyncOnTag',
          data: {
            asyncNumber: 2,
            maximumAsyncOnTag: 1
          },
          line: 1,
          endLine: 3
        }
      ]
    }
  ]
});
