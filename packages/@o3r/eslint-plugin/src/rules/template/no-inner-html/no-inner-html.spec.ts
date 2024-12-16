import {
  meta,
  parseForESLint,
} from '@angular-eslint/template-parser';
import {
  RuleTester,
} from '@angular-eslint/test-utils';
import noInnerHTMLRule, {
  name,
} from './no-inner-html';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: {
      meta,
      parseForESLint
    }
  }
});

const validHTML = '<p innerText="test"></p>';

ruleTester.run(name, noInnerHTMLRule, {
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
