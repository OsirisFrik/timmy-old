const firebase = require('firebase-admin')
const { Client, Message, VoiceChannel } = require('discord.js')
const db = firebase.database().ref('stalk')

/**
 * @typedef { User }
 * @property { String } id
 * @property { String } username
 * @property { String } tag
 * @property { String } discriminator
 * @property { String } avatar
 * @property { Boolean } stalking
 */

class Stalker {
  /**
   * @method constructor
   * @param {Client} client
   */

  constructor(client) {
    /**
     * commands in message
     */
    this.commands = [
      '$$stalk',
      '$$leave',
      '$$stop'
    ]
    this.client = client
    /**
     * @type { User } userToStalk
     */
    this.userToStalk = null
    /**
     * @type { VoiceChannel }
     */
    this.voice = null
    this.stalking = false

    this.init()
  }

  init() {
    try {
      db.once('value', (data) => {
        data = data.val()
        this.stalking = data.stalking
        this.userToStalk = data.user
        if (data.stalking && data.user) this.checkConnection(this.userToStalk.id)
      })
      this.track()
    } catch (err) {
      console.trace(err)
    }
  }

  /**
   * @method onCommand
   * @param { Message } message 
   */
  onCommand(message) {
    try {
      console.log(message.content.split(' ')[0])
      this[message.content.split(' ')[0]](message)
    } catch (err) {
      message.reply('aah... este comando no existe')
    }
  }

  /**
   * @method $$stop
   * @param { Message } message
   */

  $$stop(message) {
    try {
      this.stalking = false
      db.update({
        stalking: false
      })
      this.client.user.setActivity(null)
      this.disconnect(true)
      this.removeMessage(message)
    } catch (err) {
      console.trace(err)      
    }
  }

  /**
   * @method $$stalk
   * @param { Message } message 
   */
  $$stalk(message) {
    if (message.content.match(/\$stalk <@.?[0-9]{2,}>/g)) {
      let mention = message.mentions.users.first()
      let user = {
        id: mention.id,
        username: mention.username,
        tag: mention.tag,
        discriminator: mention.discriminator,
        avatar: mention.avatarURL
      }
      this.stalking = true
      db.update({
        user,
        stalking: true
      })
      this.userToStalk = user
      this.initStalk()
      this.removeMessage(message)
    }
  }

  /**
   * @method $leave
   * @param { Message } message
   */

  $$leave(message) {
    this.disconnect()
    this.removeMessage(message)
  }

  async initStalk() {
    try {
      this.client.user
        .setActivity(`@$${this.userToStalk.username}`, {
          type: 'WATCHING'
        })
      await this.checkConnection(this.userToStalk.id)
    } catch (err) {
      console.trace(err)
    }
  }

  async checkConnection(id) {
    let channels = this.client.channels.filter(item => item.type === 'voice')
    channels.forEach(channel => {
      channel.members.forEach(async user => {
        if (user.id === id && channel.joinable) {
          this.disconnect()
          this.voice = channel
          await this.voice.join()
          return
        }
      })
    })
  }

  disconnect(clean) {
    if (this.voice) {
      this.voice.leave()
      this.voice = null
    }
  }

  track() {
    this.client.on('voiceStateUpdate', (odlUser, newUser) => {
      try {
        if (this.stalking && this.userToStalk) {
          if (newUser.voiceChannelID !== null && newUser.id === this.userToStalk.id && newUser.voiceChannel) {
            setTimeout(() => {
              if (this.voice) this.disconnect()
              if (newUser.voiceChannel.joinable) {
                this.voice = newUser.voiceChannel
                this.voice.join()
              }
            }, 1000);
          } else if (this.userToStalk && newUser.id === this.userToStalk.id && !newUser.voiceChannel) {
            if (this.voice) this.disconnect()
          } else if (!this.userToStalk && voice) {
            this.disconnect()
          }
        }
      } catch (err) {
        console.trace(err)
      }
    })
  }

  /**
   * @method removeMessage
   * @param { Message } message
   */

  removeMessage(message) {
    setTimeout(() => {
      message.delete()
    }, 500);
  }
}

module.exports = Stalker
