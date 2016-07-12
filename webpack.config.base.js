const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const precss = require('precss')
const cssimport = require('postcss-import')
const customMedia = require("postcss-custom-media")

module.exports = {
  node: {
    fs: "empty"
  },
  postcss: function (webpack) {
    return [cssimport({
      addDependencyTo: webpack
    }), autoprefixer, precss, customMedia];
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: [ 'babel' ],
      exclude: /node_modules/,
      include: __dirname
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.handlebars|\.template$/,
      loader: "handlebars-loader"
    }, {
      test: /(assets\/.*\/.*.jpg)|(assets\/.*\/.*.png)|(assets\/.*\/.*.svg)$/,
      loader: "url?name=/[hash].[ext]"
    }, {
        test: /\/fonts\/.*[\.woff|\.woff2|\.eot|\.svg|\.ttf]/,
        loader: 'url-loader?&limit=1&name=fonts/[name].[ext]'
    }]
  }
}
