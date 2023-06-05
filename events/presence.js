const axios = require('axios')
const { BACKEND_URL, STREAM_NOTIFICATION_CHANNEL } = require('../configs/constants')
const { checkUser } = require('../utils/userFunctions')
const { client } = require('../configs/bot_config')

const updateStreamStatus = async (user, isStreaming) => {
  const newStreamStatus = {
    isStreaming: isStreaming,
    twitchUrl: user.twitchUrl,
  }

  try {
    const { data } = await axios.patch(`${BACKEND_URL}/users/${user.discordId}`, newStreamStatus)

    if (!data.success) {
      throw new Error(data.message)
    }

    switch (isStreaming) {
      case true:
        console.log(`${user.username} started streaming!`)
        break
      case false:
        console.log(`${user.username} stopped streaming!`)
        break
      default:
        break
    }
  } catch (error) {
    console.error(error)
  }
}

const announceStream = (user) => {
  const channel = client.channels.cache.get(STREAM_NOTIFICATION_CHANNEL)
  const streamEmbed = {
    title: user.streamHeading,
    fields: [
      {
        name: 'Striimipeli',
        value: user.streamGame,
        inline: true,
      },
      {
        name: 'Twitchin osoite',
        value: user.twitchUrl,
        inline: true,
      },
    ],
  }

  if (channel) {
    // channel.send({ embeds: [streamEmbed], content: `${user.username} aloitti striimin osoitteessa - ${user.twitchUrl}` })
    console.log(`${user.username} aloitti striimin osoitteessa - ${user.twitchUrl}`)
  } else {
    console.error('Channel not found!')
  }
}

const handlePresence = async (oldPresence, newPresence) => {
  // Ignore if presence update is not from a user
  if (newPresence.user.bot) return
  const user = newPresence.user || oldPresence.user

  try {
    // Check if user starts streaming
    const isStreaming = newPresence.activities.some((activity) => {
      if (activity.type === 1) {
        user.twitchUrl = activity.url
        user.streamHeading = activity.details
        user.streamGame = activity.state
        return true
      }
    })

    const fetchedUser = await checkUser(user)

    // Check if fetchedUser is not streaming
    if (!fetchedUser.isStreaming && isStreaming) {
      // Update user stream status
      await updateStreamStatus(fetchedUser, true)
      // console.log(`${fetchedUser.username} started streaming! - Send a message to a channel!`)
      announceStream(user)
      return
    }

    // If user was streaming according to DB and the new presence is not streaming, the user is stopping the stream
    if (fetchedUser.isStreaming && !isStreaming) {
      await updateStreamStatus(fetchedUser, false)
    }

  } catch (error) {
    console.error(error.message)
  }
}

module.exports = handlePresence
