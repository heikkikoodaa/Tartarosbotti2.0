require('dotenv').config()

const { client, setBotActivity } = require('./configs/bot_config')
const { BOT_TOKEN, STREAM_NOTIFICATION_CHANNEL, TARTAROS_NOTIFICATIONS } = require('./configs/constants')
const { startApp } = require('./app/server')
const { handlePresence } = require('./events/presence')
const { startCheckingForVideos } = require('./utils/youtube')


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  const areNotificationsEnabled = process.env.NOTIFICATIONS_ENABLED === 'true'

  setBotActivity(areNotificationsEnabled)

  // Start Express server
  startApp()

  startCheckingForVideos()
})

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // Handle presence update
  handlePresence(oldPresence, newPresence)
})

client.on('messageCreate', async message => {
  if (message.author.bot) return

  const channelId = message.channelId
  const BASE_TWITCH_URL = 'https://twitch.tv'
  const allowedChannels = [TARTAROS_NOTIFICATIONS, STREAM_NOTIFICATION_CHANNEL]

  if (!allowedChannels.includes(channelId)) return

  const msg = message.content.toLowerCase()

  if (!msg || !msg.startsWith('!twitch')) return

  const channelName = msg.split(' ')[1]

  if (!channelName) return

  await message.channel.send(`${BASE_TWITCH_URL}/${channelName}`)
})

client.on('interactionCreate', async (interaction) => {
  // Ignore if interaction is not a command
  if (!interaction.isCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`Command ${interaction.commandName} not found`)
    return
  }

  try {
    await command.execute(interaction)
    console.log(`Command ${interaction.commandName} executed successfully`)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
    } else {
      interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
    }
  }
})

// Login to Discord
client.login(BOT_TOKEN)
