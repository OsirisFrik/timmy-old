require('dotenv').config()
require('./firebase')

const express = require('express')
const debug = require('debug')('app:server')
const Sentry = require('@sentry/node')

Sentry.init({
  dsn: process.env.SENTRY,
  environment: process.env.NODE_ENV,
  serverName: true
})

const app = express()

app.use(Sentry.Handlers.requestHandler())
  .use(Sentry.Handlers.errorHandler())

app.get('/', (req, res) => res.send(true))

app.listen(process.env.PORT, () => {
  debug(`Server listening in https://localhost:${process.env.PORT}`)
  require('./bot')
})
