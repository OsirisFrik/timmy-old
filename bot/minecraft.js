const _ = require('lodash')
const debug = require('debug')('app:commands:mc')
const firebase = require('firebase-admin')
const { Client, Message, Channel } = require('discord.js')
const ngrok = require('ngrok')

const firestore = firebase.firestore()
const db = firestore.collection('settings')
/**
 * @type { Object<string, MinecraftSettings> }
 */
const guildsMcSettings = {}

var ngrokServer

/**
 * @typedef { Object } MinecraftSettings
 * @property { Boolean } autoStart
 * @property { Channel } channel
 */

/**
 * @typedef { Object } guildSettings
 * @property { String } guild
 * @property { MinecraftSettings } minecraft 
 */

class MinecraftBot {

  /**
   * @method constructor
   * @param {Client} client
   */

  constructor(client) {
    this.commands = [
      '$$mcsettings',
      '$$mchost',
      '$$mcstatus',
      '$$mcstart',
      '$$mcchannel'
    ]
    this.client = client
    this.client.on('ready', () => this.init())
  }

  async init() {
    try {
      debug('init mc')
      let guildsSettings = await db.listDocuments()
      let guildsIds = this.client.guilds.keyArray()

      for (let i = 0; i < guildsIds.length; i++) {
        const guild = this.client.guilds.get(guildsIds[i]);
        let exist = _.findIndex(guildsSettings, (item) => item.id === guild.id)

        if (exist === -1) {
          let _guild = {
            guild: firestore.collection('guilds').doc(guild.id)
          }
          await db.doc(guild.id)
            .set(_guild)
        }

        let guildSettings = (await db.doc(guild.id).get()).data()

        if (typeof guildSettings.minecraft !== 'undefined') {
          /**
           * @type { MinecraftSettings }
           */
          let mcSettings = guildsMcSettings[guild.id] = guildSettings.minecraft

          if (mcSettings.autoStart && mcSettings.channel) {
            debug(mcSettings)
            guildsMcSettings[guild.id].channel = this.client.channels.get(mcSettings.channel)
            this.$$mcstart(null, guild.id)
          }
        } else {
          debug('HERE')
          guildsMcSettings[guild.id] = guildSettings.minecraft = {
            autoStart: false,
            channel: null
          }

          debug(guildSettings.data)

          await db.doc(guild.id).set(guildSettings)
        }
      }
    } catch (err) {
      console.trace(err)
    }
  }

  /**
   * @method onCommand
   * @param { Message } message
   */
  onCommand(message, command) {
    try {
      debug(`command ${(command).magenta} by ${message.author.username.cyan}`)
      this[command](message)
    } catch (err) {
      err.command = command
      throw err
    }
  }

  /**
   * @method $$mcchannel
   * @param { Message } message
   */
  async $$mcchannel(message) {
    try {
      let channel = message.channel
      let settings = guildsMcSettings[message.guild.id]

      settings.channel = this.client.channels.get(message.channel.id)

      await db.doc(message.guild.id).update({
        minecraft: {
          ...sttings,
          channel: channel.id
        }
      })

      message.channel.send('Success set channel')
    } catch (err) {
      message.channel.send('Error on set channel')
    }
  }

  /**
   * @method $$mcstart
   * @param { Message } message
   * @param { String } guild
   */
  async $$mcstart(message, guild) {
    try {
      debug('$$mcstart')
      let msg
      if (!ngrokServer) {
        ngrokServer = {
          id: null,
          server: await ngrok.connect({
            proto: 'tcp',
            addr: process.env.$$MCPORT,
            authtoken: process.env.NGROK_TOKEN
          }),
          api: ngrok.getApi()
        }
        
        if (!message) {
          msg = await guildsMcSettings[guild].channel.send(`Server host \`${ngrokServer.server.replace('tcp://', '')}\``)
        } else {
          msg = await message.channel.send(`Server host \`${ngrokServer.server.replace('tcp://', '')}\``)
        }

        ngrokServer.id = msg.id
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * @method $$mchost
   * @param { Message } message
   */
  async $$mchost(message) {
    if (ngrokServer) {
      message.channel.send(`Server host on \`${ngrokServer.server.replace('tcp://', '')}\``)
    } else {
      message.channel.send(`Server host is offline`)
    }
  }
}

module.exports = MinecraftBot