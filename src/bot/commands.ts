// @ts-expect-error
import context from 'require-context'
import * as Sentry from '@sentry/node'
import { Client, Message } from 'discord.js'
import { EventEmitter } from 'events'
import Debug from 'debug'

const debug = Debug('app:bot:commands')
const files = context('../../src/bot/modules', true, /\.ts$/)

class Commands extends EventEmitter {
  public modules: BotModule[] = []

  constructor(client: Client) {
    super()

    debug('start import moduls')

    files.keys().forEach(async (file: any) => {
      if (['index.ts', 'commands.ts', 'main.ts'].includes(file)) return

      try {
        const BotModule = require(`./modules/${file}`).default
        const moduleName = file.split('.')[0]

        if (BotModule) {
          this.modules.push(new BotModule(client))

          debug(`Module ${moduleName.green} loaded`)
        } else debug(`Module ${moduleName.red} not export class`)
      } catch (err) {
        console.trace(err)
      }
    })

    debug('end import modules')
  }

  onMessage(message: Message): void {
    try {
      if (!message.author.bot) {
        this.modules.forEach((option) => {
          for (let i = 0; i < option.commands.length; i++) {
            const command = option.commands[i]

            if (message.content.startsWith(command)) {
              console.log(command)

              option.onCommand(message, option.commands[i])
              break
            }
          }
        })
      }
    } catch (err) {
      message.channel.send(`I don't can find command ${err.command}`)
      err.message = err.message.replace('command', `'${err.command}'`)

      debug(`Error on load command ${err.command.red}`)

      Sentry.captureException(err)
    }
  }
}

export default Commands
