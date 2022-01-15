/* eslint-disable no-unused-vars */
declare namespace NodeJS {
  interface Global {
    client: import('discord.js').Client
  }
}

interface IENV {
  NODE_ENV: string
  PORT: number | string
  DATABASE: string
  BUCKET: string
  SENTRY: string
  NGROK_TOKEN: string
  MC_PORT: number | string
  DISCORD: string
}

interface MainBot {
  commands: string[]
  client: Client
  voiceChannel: VoiceChannel | null

  onCommand(message: import('discord.js').Message, command?: string): void
}

interface BotModule extends MainBot {
  init(): Promise<void>
  [key](message: import('discord.js').Message): Promise<void>
}

interface GuildStore {
  id: string
  name: string
  ownerId: string
}

interface UserStalk {
  id: string
  username: string
  tag: string
  discriminator: string
  avatar: string | null
}

interface MinecraftSettings {
  autoStart: Boolean
  channel: string
}


interface NgrokServer {
  id: null | string
  server: null | string
}
