import Debug from 'debug'
import _ from 'lodash'
import firebase from 'firebase-admin'
import { Client, Intents } from 'discord.js'

import env from '../config'
import Modules from './modules'

const fstore = firebase.firestore()
const debug = Debug('app:bot')

class Bot {
  public client: Client = new Client({
    intents: [Intents.FLAGS.GUILDS]
  })
  public commands: Modules

  private guilds = new Map<string, GuildStore>()

  constructor() {
    debug('Start bot')

    this.client.login(env.DISCORD)

    this.commands = new Modules(this.client)
    this.client.on('ready', () => this.config())
  }

  async config() {
    if (env.NODE_ENV === 'development') this.client.on('debug', (info) => console.log(info))

    await this.checkGuilds()

    this.client.on('message', (message) => this.commands.onMessage(message))
  }

  async checkGuilds() {
    try {
      const storageGuilds = await fstore.collection('guilds').listDocuments()

      this.client.guilds.cache.forEach(async (guild) => {
        const exists = _.findIndex(storageGuilds, (item) => item.id === guild.id)

        if (exists === -1) {
          const _guild: GuildStore = {
            id: guild.id,
            name: guild.name,
            ownerId: guild.ownerId
          }

          await fstore.collection('guilds')
            .doc(guild.id)
            .set(_guild)

          this.guilds.set(guild.id, _guild)
        } else {
          // @ts-expect-error
          const _guild: GuildStore = await fstore.collection('guilds')
            .doc(guild.id)
            .get()

          this.guilds.set(guild.id, _guild)
        }
      })

      return
    } catch (err) {
      console.trace(err)
    }
  }
}

export default new Bot()
