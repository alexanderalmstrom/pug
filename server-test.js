// dev-server.js

const webpackDevServer = require('webpack-dev-server')
const webpack = require('webpack')

const config = require('./webpack.config')
const PORT = config.devServer.port || 5000

webpackDevServer.addDevServerEntrypoints(config, config.devServer)

const compiler = webpack(config)
const server = new webpackDevServer(compiler, config.devServer)

server.listen(PORT, 'localhost', function () {
  console.log('Server listening on port %s', PORT)
})
