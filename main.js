const { client } = require('./configs/bot_config')
const { BOT_TOKEN } = require('./configs/constants')
const { startApp } = require('./app/server')
const handlePresence = require('./events/presence')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  // Start Express server
  startApp()
})

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // Handle presence update
  handlePresence(oldPresence, newPresence)
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

// client.on('messageCreate', async (msg) => {
//   // Ignore if message is from bot
//   if (msg.author.bot) return
// })

// Login to Discord
client.login(BOT_TOKEN)
