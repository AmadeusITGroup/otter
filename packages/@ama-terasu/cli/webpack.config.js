const path = require('node:path');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
const config = {
  entry: './src/cli/ama.ts',
  mode: 'production',
  target: 'node',
  externalsPresets: { node: true },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  output: {
    filename: 'ama.js',
    path: path.resolve(__dirname, 'dist', 'cli')
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ]
};

module.exports = config;
