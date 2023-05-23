const { client } = require('./configs/bot_config')
const { BOT_TOKEN, BACKEND_URL } = require('./configs/constants')
const { startApp } = require('./app/server')
const axios = require('axios')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // Ignore if user is bot or previous presence was offline
  if (newPresence.user.bot || oldPresence.status === 'offline') return

  // If user's new presence is streaming, send a notification to the channel with the user's stream URL
  if (newPresence.activities[0].type === 'STREAMING') {
    newPresence.guild.channels.cache
      .find((channel) => channel.id === '1105870680081309799')
      .send(
        `${newPresence.user} is now streaming at ${newPresence.activities[0].url}`,
      )
  }
})

client.on('messageCreate', async (msg) => {
  // Ignore if message is from bot
  if (msg.author.bot) return

  if (msg.content === '!test') {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/users`)
      msg.reply({ content: data, ephemeral: true })
    } catch (error) {
      if (error.response.status === 404) {
        msg.reply({ content: 'No users found', ephemeral: true })
        return
      } else {
        msg.reply({
          content: 'Something went wrong. Please try again later.',
          ephemeral: true,
        })
        return
      }
    }
  }
})

// Login to Discord
client.login(BOT_TOKEN)

// Start Express server
startApp()
