require('dotenv').config()
require('colors')

import express, { Application, Request, Response } from 'express'
import Debug from 'debug'
import * as Sentry from '@sentry/node'
import { EventEmitter } from 'events'

import env from './config'

Sentry.init({
  dsn: env.SENTRY,
  environment: env.NODE_ENV
})

const debug = Debug('app:server')

debug.log = console.log.bind(console)

class Server extends EventEmitter {
  public app: Application

  constructor() {
    super()

    this.app = express()

    this.config()
  }

  async config() {
    this.app.use(Sentry.Handlers.requestHandler())
      .use(Sentry.Handlers.errorHandler())

    await this.routes()
    await this.imports()

    this.ready(true)
  }

  async routes() {
    this.app.get('/', (_req: Request, res: Response) => res.send(true))

    return
  }

  async imports() {
    await import('./firebase')
    await import('./bot')

    return
  }

  ready(status: Boolean) {
    if (this.listenerCount('ready') > 0) this.emit('ready', status)
    else setTimeout(() => this.ready(status), 500)
  }

  start() {
    this.app.listen(env.PORT, () => {
      debug(`Server listening in port ${env.PORT}`)
    })
  }
}

const server = new Server()

server.on('ready', server.start)
