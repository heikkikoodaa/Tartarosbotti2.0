const axios = require('axios')
const TartarosError = require('../classes/TartarosError')
const { BACKEND_URL, STREAM_NOTIFICATION_CHANNEL } = require('../configs/constants')
const { checkUser } = require('../utils/userFunctions')
const { client } = require('../configs/bot_config')
const { ActivityType } = require('discord.js')

const areNotificationsEnabled = process.env.NOTIFICATIONS_ENABLED === 'true'

const updateStreamStatus = async (user, isStreaming) => {
  const newStreamStatus = {
    isStreaming: isStreaming,
    twitchUrl: user.twitchUrl,
  }

  try {
    const { data } = await axios.patch(`${BACKEND_URL}/users/${user.discordId}`, newStreamStatus)

    if (!data.success) {
      throw new TartarosError(data.message, 'Patching user information')
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

  if (channel) {
    channel.send(`${user.username} aloitti striimin osoitteessa - ${user.twitchUrl}\n${user.streamHeading || ''}`)
    console.log(`${user.username} aloitti striimin`)
  } else {
    console.error('Channel not found!')
  }
}

const handlePresence = async (oldPresence, newPresence) => {
  // Ignore if presence update is not from a user
  if (newPresence.user.bot) return

  const user = newPresence.user
  const fetchedUser = await checkUser(user)

  let isStreamStarting = false
  let wasAlreadyStreaming = false

  try {
    for (const activity of newPresence.activities) {
      if (activity.type === ActivityType.Streaming) {
        fetchedUser.twitchUrl = activity.url
        fetchedUser.streamHeading = activity.details
        fetchedUser.streamGame = activity.state
        isStreamStarting = true
        break
      }
    }

    for (const activity of oldPresence.activities) {
      if (activity.type === ActivityType.Streaming) {
        wasAlreadyStreaming = true
      }
      break
    }

    // Check if user is starting a stream, but ignore if isStreaming is false
    if (!fetchedUser.isStreaming && isStreamStarting && !wasAlreadyStreaming) {
      // Update user stream status
      await updateStreamStatus(fetchedUser, true)

      if (fetchedUser.twitchUrl && areNotificationsEnabled) {
        announceStream(fetchedUser)
      }

      return
    }

    // If user was streaming according to DB and the new presence is not streaming, the user is stopping the stream
    if (fetchedUser.isStreaming && !isStreamStarting) {
      await updateStreamStatus(fetchedUser, false)
    }

  } catch (error) {
    console.error(error.message || error)
  }
}

module.exports = handlePresence
