export default {
  plugins: [
    ['babel-plugin-transform-import-meta', { module: 'ES6' }]
  ],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ]
};
