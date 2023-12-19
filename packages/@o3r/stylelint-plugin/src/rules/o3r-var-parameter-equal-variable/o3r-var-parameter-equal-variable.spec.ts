import { getTestRule } from 'jest-preset-stylelint';
import { messages, messagesAlias, ruleName } from './o3r-var-parameter-equal-variable';
import plugins from '../../index';

const stylelintTestRule = getTestRule({ plugins });

stylelintTestRule({
  ruleName,
  config: [true],
  fix: true,
  accept: [
    {
      description: 'import otter styling with alias',
      code: `@use '@o3r/styling' as otter;
      $test: otter.variable('test', 0);`
    },
    {
      description: 'import otter styling with alias another alias',
      code:
`@use '@o3r/styling' as o3r;

$more-complex-test-case-1: o3r.variable('more-complex-test-case-1', 0);`
    },
    {
      description: 'o3r styling not imported, the rule will not be executed on the declaration',
      code: '$test: o3r.variable(\'test-valid\', 0);'
    }
  ],
  reject: [
    {
      code: `@use '@o3r/styling' as o3r;
      $test: o3r.variable('test-invalid', 0);`,
      fixed: `@use '@o3r/styling' as o3r;
      $test: o3r.variable('test', 0);`,
      message: messages.expected('test-invalid', 'test', 'o3r'),
      line: 2,
      column: 28
    }
  ]
});

stylelintTestRule({
  ruleName,
  config: [true],
  reject: [
    {
      code: `@use '@o3r/styling' as o3r;

      $more-complex-test-case-1: otter.variable('more-complex-test-case-1', 0);`,
      message: messagesAlias.expected('o3r', 'otter.variable(\'more-complex-test-case-1\', 0)'),
      line: 3,
      column: 34
    }
  ]
});
