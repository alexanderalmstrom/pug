const path = require('path')
const express = require('express')
const http = require('http')
const morgan = require('morgan')

const app = express()
const server = http.createServer(app)
const router = express.Router()
const port = process.env.PORT || 5000

app.use(morgan('combined'))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '..', 'build'))

app.use(express.static(path.resolve(__dirname, '..', 'build')))

router.get('/', function (req, res, next) {
  res.render('index')
})

app.use('/', router)

server.listen(port, function () {
  console.log("Listening on port %s", server.address().port)
})
