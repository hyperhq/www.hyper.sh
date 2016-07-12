const webpackBaseConfig = require('./webpack.config.base')
const path = require('path')
const webpack = require('webpack')
const loaders = webpackBaseConfig.module.loaders
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pages = require('./pages')

const htmls = pages(false).map((page) => {
  return new HtmlWebpackPlugin(page)
})

module.exports = Object.assign(webpackBaseConfig, {
  devtool: 'eval-source-map',
  entry: [
    'webpack-hot-middleware/client?reload=true',
    'babel-polyfill',
    './index'
  ],
  output: {
    path: path.join(__dirname),
    filename: 'app.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"development"'}),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ].concat(htmls),
  module: {
    loaders: loaders.concat([{
      test: /\.css$/,
      loader: 'style-loader!css-loader!postcss-loader',
      include: __dirname
    }])
  }
})
