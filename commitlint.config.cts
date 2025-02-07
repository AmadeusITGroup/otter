import type {
  UserConfig,
} from '@commitlint/types';

export default {
  extends: [
    '@commitlint/config-conventional',
    '@commitlint/config-angular'
  ],
  rules: {
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never',
      [
        'sentence-case',
        'start-case',
        'pascal-case',
        'upper-case'
      ]
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'deprecate',
        'feat',
        'feature',
        'features',
        'fix',
        'bugfix',
        'fixes',
        'bugfixes',
        'improvement',
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ]
    ]
  }
} as const satisfies UserConfig;
