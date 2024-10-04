import { RuleTester } from '@angular-eslint/test-utils';
import noInnerHTMLRule, { name } from './no-inner-html';

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser'
});

const validHTML = '<p innerText="test"></p>';

ruleTester.run(name, noInnerHTMLRule as any /* workaround for 5.9.0 breaking change on interface */, {
  valid: [validHTML],
  invalid: [
    {
      code: validHTML.replace('innerText', 'innerHTML'),
      output: validHTML,
      errors: [
        {
          messageId: 'error',
          suggestions: [{
            messageId: 'fix',
            output: validHTML
          }]
        }
      ]
    },
    {
      code: validHTML.replace('innerText', 'innerHtml'),
      output: validHTML,
      errors: [
        {
          messageId: 'error',
          suggestions: [{
            messageId: 'fix',
            output: validHTML
          }]
        }
      ]
    }
  ]
});
