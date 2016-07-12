const webpackBaseConfig = require('./webpack.config.base')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Clean = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const loaders = webpackBaseConfig.module.loaders
const pages = require('./pages')

const htmls = pages(true).map((page) => {
  return new HtmlWebpackPlugin(page)
})

module.exports = Object.assign(webpackBaseConfig, {
  entry: {
    app: ['babel-polyfill', './index']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin( { sourceMap: false, compressor: { warnings: false } } ),
    new ExtractTextPlugin("index.css"),
    new CopyWebpackPlugin([
      {
        from: 'assets/',
        to: './assets'
      }
    ]),
    new Clean(['dist'])
  ].concat(htmls),
  module: {
    loaders: loaders.concat([{
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css!postcss'),
      include: __dirname
    }])
  }
})
