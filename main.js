const { client } = require('./configs/bot_config')
const { BOT_TOKEN } = require('./configs/constants')
const { startApp } = require('./app/server')

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

client.login(BOT_TOKEN)
startApp()
