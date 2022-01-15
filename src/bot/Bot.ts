import Debug from 'debug'
import { Client, Message, VoiceChannel, Channel, TextChannel, StageChannel } from 'discord.js'

const debug = Debug('app:bot:main')

class MainBot {
  public client: Client
  public voiceChannel: VoiceChannel | StageChannel | null = null

  constructor(client: Client) {
    this.client = client
  }

  onCommand(message: Message): void {
    try {
      const command: string = message.content.split(' ')[0]

      debug(command)

      // @ts-expect-error
      if (this[command]) this[command](message)
      else throw new Error('command not found')
    } catch (err) {
      if (err.message === 'command not found') {
        err.command = message.content.split(' ')[0]
      }

      throw err
    }
  }

  removeMessage(message: Message): void {
    message.delete()
  }

  disconnectVoice(): void {
    if (this.voiceChannel) {
      this.voiceChannel.leave()
      this.voiceChannel = null
    }
  }

  isVoiceCannel(channel: Channel): channel is VoiceChannel {
    return channel.type === 'GUILD_VOICE'
  }

  isTextChannel(channel: Channel | any): channel is TextChannel {
    return Object.keys(channel).includes('type')
  }

  joinVoice(): void {
    if (this.voiceChannel && this.voiceChannel.joinable) this.voiceChannel.join()
  }

  async messageToChannel(channelId: string, message: string): Promise<Message> {
    const channel = this.client.channels.cache.get(channelId)

    if (this.isTextChannel(channel)) {
      return channel.send(message)
    } else throw new Error('invalid channel')
  }
}

export default MainBot
