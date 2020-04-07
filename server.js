require('dotenv').config()
require('./firebase')

const express = require('express')
const debug = require('debug')('app:server')

const app = express()

app.get('/', (req, res) => res.send(true))

app.listen(process.env.PORT, () => {
  debug(`Server listening in https://localhost:${process.env.PORT}`)
  require('./bot')
})
