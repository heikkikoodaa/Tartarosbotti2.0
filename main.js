const { EmbedBuilder } = require('discord.js')
const { client } = require('./configs/bot_config')
const { BOT_TOKEN, BACKEND_URL } = require('./configs/constants')
const { startApp } = require('./app/server')
const axios = require('axios')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

const createUser = async (user) => {
  const newUser = {
    discordId: user.id,
    username: user.username,
    twitchUrl: user.twitchUrl,
    avatar: user.avatar,
  }

  try {
    const { data } = await axios.post(`${BACKEND_URL}/users`, newUser)

    if (!data.success) {
      return false
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const updateStreamStatus = async (user, isStreaming) => {
  const updatedUser = {
    isStreaming: isStreaming,
  }

  try {
    const { data } = await axios.patch(
      `${BACKEND_URL}/users/${user.discordId}`,
      updatedUser,
    )

    if (!data.success) {
      return false
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const checkUser = async (user) => {
  // Check if user exists in database
  try {
    const { data } = await axios.get(`${BACKEND_URL}/users/${user.id}`)

    if (!data.success) {
      // If user does not exist, create new user
      const newUserCreated = createUser(user)

      if (!newUserCreated) return
      console.log(`New user created: ${user.username}`)
      return data.user
    }

    // If user exists, return their data
    return data.user
  } catch (error) {
    console.error(error)
  }
}

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // Ignore if presence update is not from a user
  if (newPresence.user.bot) return
  const user = newPresence.user

  try {
    if (!newPresence.activities.length) return

    // Check if user starts streaming
    const isStreaming = newPresence.activities.some((activity) => {
      if (activity.type === 'STREAMING') {
        user.twitchUrl = activity.url
        return true
      }
    })

    // Ignore if user is not streaming
    if (!isStreaming) return

    // Check if user exists in database and return their data
    const fetchedUser = checkUser(user)

    // Ignore if user is already streaming
    if (fetchedUser.isStreaming) return

    // Update user stream status
    updateStreamStatus(fetchedUser, true)

    // Check if user stops streaming
    const streamEnding = oldPresence.activities.some((oldActivity) => {
      const newPresenceIsNotStreaming = newPresence.activities.some(
        (newActivity) => newActivity.type !== 'STREAMING',
      )

      // If user's old presence is streaming and new presence is not streaming, user is ending stream
      if (oldActivity.type === 'STREAMING' && newPresenceIsNotStreaming) {
        return true
      }
      return false
    })

    if (streamEnding) {
      // Update user stream status
      updateStreamStatus(fetchedUser, false)
    }
  } catch (error) {
    console.error(error)
  }
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
