import o3rConfig from './eslint.shared.config.mjs';

const eslintDefaultConfigs = [
  {
    name: 'eslint/defaults/languages',
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {}
    },
    linterOptions: {
      reportUnusedDisableDirectives: 1
    }
  },
  {
    name: 'eslint/defaults/ignores',
    ignores: [
      '**/node_modules/',
      '.git/'
    ]
  },
  {
    name: 'eslint/defaults/files',
    files: ['**/*.js', '**/*.mjs']
  },
  {
    name: 'eslint/defaults/files-cjs',
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 'latest'
    }
  }
];

(async (configFile) => {
  let configArray = await configFile;

  // A single flat config object is also valid
  if (!Array.isArray(configArray)) {
    configArray = [configArray];
  }

  // ESLint applies these default configs to all files
  // https://github.com/eslint/eslint/blob/21d3766c3f4efd981d3cc294c2c82c8014815e6e/lib/config/default-config.js#L66-L69
  configArray = eslintDefaultConfigs.concat(configArray);
  const rules = new Map();
  configArray.forEach((config) => {
    Object.entries(config.plugins || {}).forEach(([pluginName, plugin]) => {
      Object.entries(plugin.rules || {}).forEach(([ruleName, rule]) => {
        const name = `${pluginName}/${ruleName}`;
        rules.set(name, {
          ...rule.meta,
          name,
          plugin: pluginName
        });
      });
    });
  });
  const activatedDeprecatedRules = configArray.reduce(
    (acc, config, index) => {
      Object.entries(config.rules || {}).forEach(([ruleName, ruleConfig]) => {
        const configName = config.name || `#${index}`;
        if (
          !rules.get(ruleName)?.deprecated
        || acc[ruleName]?.get(configName)
        ) {
          return;
        }
        const matchAll = ['**/*'];
        const files = config.files?.flat().sort() || matchAll;
        if (ruleConfig !== 'off') {
          acc[ruleName] ??= new Map();
          acc[ruleName].set(configName, files);
          return;
        }

        if (!acc[ruleName]) {
          return;
        }

        // Check if all `acc[ruleName]` patterns are a subset of `files` patterns
        // TODO find a way to compare glob inclusion
        if (
          files === matchAll
        || [...acc[ruleName].values()]
          .flat()
          .every((pattern) =>
            JSON.stringify(pattern) !== JSON.stringify(matchAll)
            && files.some((f) => JSON.stringify(f) === JSON.stringify(pattern))
          )
        ) {
          delete acc[ruleName];
        }
      });
      return acc;
    }, {});

  if (!Object.keys(activatedDeprecatedRules).length) {
    console.log(`No deprecated rules are activated.`);
    return;
  }

  Object.entries(activatedDeprecatedRules).forEach(([rule, config]) => {
    // eslint-disable-next-line no-console
    console.log(`"${rule}" is deprecated and activated in:\n${[...config.keys()].map((k) => `\t- "${k}"`).join('\n')}`);
  });
})(o3rConfig.default ?? o3rConfig);
