import Debug from 'debug'
import { Client, Message, VoiceChannel, Channel } from 'discord.js';

const debug = Debug('app:bot:main')

class MainBot {
  public client: Client
  public voiceChannel: VoiceChannel | null = null

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
        err.command =  message.content.split(' ')[0]
      }

      throw err
    }
  }

  removeMessage(message: Message, timeout: number = 500): void {
    message.delete({
      timeout
    })
  }

  disconnectVoice(): void {
    if (this.voiceChannel) {
      this.voiceChannel.leave()
      this.voiceChannel = null
    }
  }

  isChannelVoice(channel: Channel): channel is VoiceChannel {
    return channel.type === 'voice'
  }

  joinVoice(): void {
    if (this.voiceChannel && this.voiceChannel.joinable) this.voiceChannel.join()
  }
}

export default MainBot
