const hasJestDependency = (() => {
  try {
    return !!require.resolve('jest');
  } catch {
    return false;
  }
})();

module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.cts', '*.mts'],
      extends: [
        './rules/typescript/eslint.cjs',
        './rules/typescript/eslint-angular.cjs',
        './rules/typescript/eslint-typescript.cjs',
        './rules/typescript/jsdoc.cjs',
        './rules/typescript/otter.cjs',
        './rules/typescript/prefer-arrow.cjs',
        './rules/typescript/stylistic.cjs',
        './rules/typescript/unicorn.cjs',
        ...hasJestDependency ? ['./rules/typescript/jest.cjs'] : [],
        './rules/typescript/stylistic.cjs'
      ],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          modules: true,
          jsx: false
        }
      }
    }
  ]
};
