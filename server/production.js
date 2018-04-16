const path = require('path')
const express = require('express')
const http = require('http')
const morgan = require('morgan')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'))

app.use(express.static(path.resolve(__dirname, '..', 'build')))

app.get('*', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
})

server.listen(PORT, function () {
  console.log("Listening on port %s", server.address().port)
})
