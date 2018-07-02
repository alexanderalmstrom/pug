const path = require('path')
const webpack = require('webpack')
const express = require('express')
const http = require('http')
const morgan = require('morgan')
const proxyMiddleware = require('http-proxy-middleware')

const webpackConfig = require('../webpack.config')
const devConfig = webpackConfig.devServer
const compiler = webpack(webpackConfig)

const app = express()
const server = http.createServer(app)
const router = express.Router()
const port = process.env.PORT || 5000

app.use(morgan('dev'))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '..', 'build'))

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

router.get('/', function (req, res, next) {
  res.render('index')
})

app.use('/', router)

server.listen(port, function () {
  console.log("Listening on port %s", server.address().port)
})
