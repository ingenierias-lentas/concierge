const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const helmet = require('helmet')

const accessRouter = require('../routes/access')
const commandRouter = require('../routes/command')

var server = express();

server.use(helmet());
server.use(bodyParser.json());
server.use(morgan('combined'));

var whitelist = [process.env.FRONTEND_SITE, process.env.FRONTEND_SITE_INTRANET, process.env.FRONTEND_SITE_LOCAL]
var errcsoolCorsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log(origin)
      callback(new Error('Not allowed by CORS'))
    }
  }
}

if (process.env.NODE_ENV === 'test') {
  server.use('/access', accessRouter)
  server.use('/command', commandRouter)
} else {
  server.use('/access', cors(errcsoolCorsOptions), accessRouter)
  server.use('/command', cors(errcsoolCorsOptions), commandRouter)
}

module.exports = server;
