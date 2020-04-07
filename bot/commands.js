const context = require('require-context')
const { Message } = require('discord.js')
const files = context('../../bot', true, /\.js$/)

/**
 * @typedef {Function} onCommand
 * @param {Message} message
 */

/**
 * @typedef {Object} bot
 * @property {Array<String>} commands
 * @property {OnCommand} onCommand
 */

/**
 * @type {[bot]}
 */
const modules = []

/**
 * @method init
 * @param { Client } client
 */

function init(client) {
  files.keys().forEach(file => {
    if (['index.js', 'commands.js'].includes(file)) return
    let _file = new (files(file))(client)
    modules.push(_file)
  })
}

/**
 * @method onMessage
 * @param {Message} message 
 */

function onMessage(message) {
  if (!message.author.bot) {
    modules.forEach(option => {
      for (let i = 0; i < option.commands.length; i++) {
        if (message.content.startsWith(option.commands[i])) {
          option.onCommand(message)
        }
      }
    })
  }
}

module.exports = {
  init,
  onMessage
}
