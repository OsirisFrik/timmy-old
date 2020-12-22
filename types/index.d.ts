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


interface Bot {
 commands: string[] 
 onCommand(message: import('discord.js').Message, command?: string): void
}

interface GuildStore {
  id: string
  name: string
  ownerId: string
  user?: {
    id?: string
    username?: string
    tag?: string
    avatar?: string
    disc?: string
  }
}

interface UserStalk {
  id: string
  username: string
  tag: string
  discriminator: string
  avatar: string | null
}
