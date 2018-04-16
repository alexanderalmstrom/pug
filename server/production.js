const path = require('path')
const express = require('express')
const http = require('http')
const morgan = require('morgan')

const app = express()
const server = http.createServer(app)

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'))

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')))

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
})

server.listen(process.env.PORT || 5000, function () {
  console.log("Listening on port %s", server.address().port)
})