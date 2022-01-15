import Debug from 'debug'
import firebase from 'firebase-admin'
import { Client, Message, TextBasedChannels } from 'discord.js'
import ngrok from 'ngrok'

import MainBot from '../Bot'
import env from '../../config'

const debug = Debug('app:boot:mc')
const firestore = firebase.firestore()
const db = firestore.collection('settings')

class MinecraftBot extends MainBot {
  private guilds: Map<string, MinecraftSettings> = new Map()
  public commands: string[] = [
    '$$mcsettings',
    '$$mchost',
    '$$mcstatus',
    '$$mcstart',
    '$$mcchannel'
  ]
  private ngrokServer: NgrokServer = {
    id: null,
    server: null
  }

  constructor(client: Client) {
    super(client)

    this.client.on('ready', () => this.init())
  }

  get host(): string {
    return this.ngrokServer.server?.replace('tcp://', '') || ''
  }

  async init(): Promise<void> {
    try {
      debug('init MC module')

      const guildsSettings = await db.listDocuments()
      const guildsIds = [...this.client.guilds.cache.keys()]

      for (let i = 0; i < guildsIds.length; i++) {
        const guild = this.client.guilds.cache.get(guildsIds[i])

        if (guild) {
          const exist = guildsSettings.findIndex((item) => item.id === guild.id)

          if (exist < 0) {
            const _guild = {
              guild: firestore.collection('guilds').doc(guild.id)
            }

            await db.doc(guild.id)
              .set(_guild)
          }

          const guildSettings = (await db.doc(guild.id).get()).data()

          if (guildSettings && typeof guildSettings.minecraft !== 'undefined') {
            const mcSettings: MinecraftSettings = guildSettings.minecraft

            this.guilds.set(guild.id, mcSettings)

            if (mcSettings.autoStart && mcSettings.channel) this.$$mcstart(null, guild.id)
          }
        }
      }

      return
    } catch (err) {
      console.trace(err)
    }
  }

  async $$mcstart(message: Message | null, guildId?: string): Promise<void> {
    try {
      debug('$$mcstart')

      if (!this.ngrokServer.server) {
        this.ngrokServer.server = await ngrok.connect({
          proto: 'tcp',
          addr: env.MC_PORT,
          authtoken: env.NGROK_TOKEN
        })
      }

      const msg = `Server host \`${this.host}\``

      if (!message && guildId) {
        const guild = this.guilds.get(guildId)

        if (guild) {
          this.ngrokServer.id = (await this.messageToChannel(guild.channel, msg)).id
        }
      } else if (message) {
        this.ngrokServer.id = (await message.channel.send(msg)).id
      }

      return
    } catch (err) {
      throw err
    }
  }

  async $$mchost(message: Message): Promise<void> {
    debug('$$mchost')

    if (this.ngrokServer.server) {
      await message.channel.send(`Server host on \`${this.host}\``)
    } else {
      await message.channel.send('Server host is offline')
    }

    return
  }

  async $$mcchannel(message: Message): Promise<void> {
    debug('$$mcchannel')

    try {
      const mentions = message.mentions
      let channel: TextBasedChannels = message.channel

      if (mentions.channels.size > 0) {
        mentions.channels.forEach((cha) => {
          if (this.isTextChannel(cha) && (!channel || channel.id !== cha.id)) channel = cha
        })
      }

      if (message.guild && channel) {
        const guild = this.guilds.get(message.guild.id)

        debug(guild, message.guild.id, this.guilds.keys())

        if (!guild) throw new Error('Guild not found')

        guild.channel = channel.id

        await db.doc(message.guild.id).update({
          minecraft: {
            ...guild
          }
        })

        if (this.isTextChannel(channel)) {
          await channel.send(`Channel #${channel.name} set to minecraft logs`)
        } else {
          await message.channel.send('Channel set to minecraft logs')
        }
      }

      return
    } catch (err) {
      console.trace(err)

      throw err
    }
  }
}

export default MinecraftBot
