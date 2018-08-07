const path = require('path')
const webpack = require('webpack')
const express = require('express')
const http = require('http')
const morgan = require('morgan')
const webpackConfig = require('../webpack.config')

const env = process.env.NODE_ENV

const app = express()
const server = http.createServer(app)
const router = express.Router()
const port = process.env.PORT || 5000

if (env == "development") {
  app.use(morgan('dev'))

  const compiler = webpack(webpackConfig)

  app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }))

  app.use(require("webpack-hot-middleware")(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }))
}

if (env == "production") {
  app.use(morgan('combined'))
}

app.use(express.static(path.resolve(__dirname, '..', 'build')))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '..', 'build'))

router.get('/', function (req, res, next) {
  res.render('index')
})

app.use('/', router)

server.listen(port, function () {
  console.log("Listening on port %s", server.address().port)
})
