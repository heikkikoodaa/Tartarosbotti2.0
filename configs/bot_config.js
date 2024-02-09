const { Client, Collection, GatewayIntentBits, ActivityType, Partials } = require('discord.js')
const path = require('node:path')
const fs = require('node:fs')

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
  ],
})

client.commands = new Collection()

const setBotActivity = async () => {
  client.user.setPresence({
    activities: [{ name: 'laatustriimejä', type: ActivityType.Watching }],
    status: 'online',
  })

  // try {
  //   await client.user.set('Tartarosbotti 🔔')
  //   console.log('Bot username changed!')
  // } catch (error) {
  //   console.error(error.message)
  // }
}

const foldersPath = path.join(__dirname, '..', 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      console.log(`Error in ${filePath}`)
    }
  }
}

module.exports = {
  client,
  setBotActivity,
}
