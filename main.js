const { EmbedBuilder } = require('discord.js')
const { client } = require('./configs/bot_config')
const { BOT_TOKEN, BACKEND_URL } = require('./configs/constants')
const { startApp } = require('./app/server')
const axios = require('axios')
const handlePresence = require('./events/presence')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // Handle presence update
  handlePresence(oldPresence, newPresence)
})

client.on('messageCreate', async (msg) => {
  // Ignore if message is from bot
  if (msg.author.bot) return

  if (msg.content === '!test') {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/users/${msg.author.id}`)
      if (!data.success) {
        msg.reply('User not found')
        return
      }
      const avatarEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Some title')
        .setImage(
          `https://cdn.discordapp.com/avatars/${data.user.discordId}/${data.user.avatar}.webp?size=256`,
        )
        .setThumbnail(
          `https://cdn.discordapp.com/avatars/${data.user.discordId}/${data.user.avatar}.webp`,
        )
      msg.channel.send({ content: 'User found', embeds: [avatarEmbed] })
    } catch (error) {
      console.error(error)
    }
  }

  if (msg.content === '!start') {
    try {
      const updatedUser = {
        isStreaming: true,
      }
      const { data } = await axios.patch(
        `${BACKEND_URL}/users/${msg.author.id}`,
        updatedUser,
      )

      if (!data.success) {
        msg.reply('Stream status could not be updated')
        return
      }

      msg.reply(`Stream status updated for ${msg.author.username}`)
    } catch (error) {
      console.error(error)
    }
  }
})

// Login to Discord
client.login(BOT_TOKEN)

// Start Express server
startApp()
