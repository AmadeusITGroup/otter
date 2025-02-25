const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    ui: './dist/src/ui/ui.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      global: {} // Fix missing symbol error when running in developer VM
    }),
    new HtmlWebpackPlugin({
      template: 'src/ui/ui.html', // input
      filename: 'src/ui/ui.html' // output
    }),
    new HtmlInlineScriptPlugin({})
  ]
};
