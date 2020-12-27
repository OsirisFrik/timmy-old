import Debug from 'debug'
import firebase from 'firebase-admin'
import { Client, Message } from 'discord.js'
import MainBot from './main'

const debug = Debug('app:bot:stalker')
const db = firebase.database().ref('stalk')

class Stalker extends MainBot {
  private userToStalk: UserStalk | null = null

  public stalking: Boolean = false
  public commands: string[] = [
    '$$stalk',
    '$$leave',
    '$$stop',
    '$$test'
  ]

  constructor(client: Client) {
    super(client)

    this.init()
  }

  init(): void {
    try {
      debug('Init stalker bot')
      db.once('value', (snap) => {
        const data = snap.val()

        this.stalking = data.stalking
        this.userToStalk = data.user

        if (data.stalking && this.userToStalk) this.checkConnection(this.userToStalk.id)
      })
      this.track()
      debug('stalker ready 👀')
    } catch (err) {
      console.trace(err)
    }
  }

  $$stop(message: Message): void {
    try {
      this.stalking = false

      db.update({
        stalking: false
      })

      this.client.user?.setActivity()
      this.disconnectVoice()
      this.removeMessage(message)
    } catch (err) {
      console.trace(err)

      throw err
    }
  }

  $$stalk(message: Message): void {
    const mention = message.mentions.users.first()

    if (mention) {
      const user: UserStalk = {
        id: mention.id,
        username: mention.username,
        tag: mention.tag,
        discriminator: mention.discriminator,
        avatar: mention.avatar
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

  $$leave(): void {
    this.disconnectVoice()
  }

  async initStalk(): Promise<void> {
    try {
      if (this.userToStalk) {
        this.client.user?.setActivity(`@${this.userToStalk?.username}`, {
          type: 'WATCHING'
        })
        this.checkConnection(this.userToStalk.id)
      }
    } catch (err) {
      console.trace(err)
    }
  }

  track(): void {
    this.client.on('voiceStateUpdate', (_oldState, newState) => {
      if (!this.userToStalk && this.voiceChannel) {
        this.disconnectVoice()

        return
      }

      if (this.stalking && this.userToStalk) {
        if (newState.id === this.userToStalk.id) {
          if (newState.channel) {
            if (newState.channel.joinable) {
              this.voiceChannel = newState.channel
              this.joinVoice()
            }
          } else this.disconnectVoice()
        }
      }
    })
  }

  async checkConnection(id: string): Promise<void> {
    this.client.channels.cache.filter((channel) => channel.type === 'voice')
      .forEach((channel) => {
        if (this.isVoiceCannel(channel)) {
          if (channel.members.find((user) => user.id === id)) {
            this.voiceChannel = channel
            this.joinVoice()
          }
        }
      })
  }
}

export default Stalker
