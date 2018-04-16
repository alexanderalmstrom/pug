const path = require('path')
const webpack = require('webpack')
const express = require('express')
const http = require('http')
const proxyMiddleware = require('http-proxy-middleware')

const webpackConfig = require('../webpack.config')
const devConfig = webpackConfig.devServer
const compiler = webpack(webpackConfig)

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

app.use(require("webpack-dev-middleware")(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath
}))

app.use(require("webpack-hot-middleware")(compiler, {
  log: console.log,
  path: '/__webpack_hmr',
  heartbeat: 10 * 1000
}))

if (devConfig.proxy) {
  Object.keys(devConfig.proxy).forEach(function (context) {
    app.use(proxyMiddleware(context, devConfig.proxy[context]))
  })
}

if (devConfig.historyApiFallback) {
  console.log('404 responses will be forwarded to /index.html')

  app.get('*', function(req, res) {
    res.sendFile(path.resolve(devConfig.contentBase, 'index.html'))
  })
}

server.listen(PORT, function () {
  console.log("Listening on port %s", server.address().port)
})
