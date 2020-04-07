require('colors')
const debug = require('debug')('app:bot')
const _ = require('lodash')
const firebase = require('firebase-admin')
const { Client } = require('discord.js')
const commands = require('./commands')

const client = new Client()
const fstore = firebase.firestore()
const db = firebase.database()
const guilds = []

if (process.env.NODE_ENV === 'development') client.on('debug', info => console.log(info))

commands.init(client)
client.on('ready', async () => {
  debug('BOT READY!'.green)
  await checkGuilds()
})

client.on('message', (message) => commands.onMessage(message))

client.login(process.env.DISCORD)

async function checkGuilds() {
  try {
    let storageGuilds = await fstore.collection('guilds').listDocuments()
    client.guilds.forEach(async guild => {
      let exist = _.findIndex(storageGuilds, (item) => item.id === guild.id)
      if (exist === -1) {
        let _guild = {
          id: guild.id,
          name: guild.name,
          ownerId: guild.ownerID,
          user: {
            id: guild.owner.user.id,
            username: guild.owner.user.username,
            tag: guild.owner.user.tag,
            avatar: guild.owner.user.avatarURL,
            disc: guild.owner.user.discriminator
          }
        }
        await fstore.collection('guilds')
          .doc(guild.id)
          .set(_guild)
        guilds[guild.id] = _guild
      } else {
        guilds[guild.id] = await fstore.collection('guilds').doc(guild.id).get()
      }
    })
  } catch (err) {
    console.trace(err)
  }
}
