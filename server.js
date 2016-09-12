const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('./webpack.config.dev')

const app = new express()
const port = process.env.PORT || 8001

const indexFullpath = __dirname + '/index.html'

if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(config)
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
  app.use(webpackHotMiddleware(compiler))
  app.use('/', express.static('./'))
  app.use('/howto', express.static('howto/public'))
} else {
  app.use('/', express.static('dist'))
  indexFullpath = __dirname + '/dist/index.html'
}

app.get('*', function(req, res) {
  res.sendFile(indexFullpath)
})

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("Listening on port %s.", port)
  }
})
