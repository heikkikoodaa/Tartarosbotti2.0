const axios = require('axios')
const { BACKEND_URL } = require('../configs/constants')
const { checkUser } = require('../utils/userFunctions')

const updateStreamStatus = async (user, isStreaming) => {
  const newStreamStatus = {
    isStreaming: isStreaming,
  }

  try {
    const { data } = await axios.patch(`${BACKEND_URL}/users/${user.discordId}`, newStreamStatus)

    if (!data.success) {
      throw new Error(data.message)
    }

    console.log(`${user.username}: ${data.message}`)
  } catch (error) {
    console.error(error)
  }
}

const handlePresence = async (oldPresence, newPresence) => {
  // Ignore if presence update is not from a user
  if (newPresence.user.bot) return
  const user = newPresence.user || oldPresence.user

  try {
    if (!newPresence.activities.length) return

    // Check if user starts streaming
    const isStreaming = newPresence.activities.some((activity) => {
      if (activity.type === 1) {
        user.twitchUrl = activity.url
        user.streamHeading = activity.details
        user.streamGame = activity.state
        return true
      }
      return false
    })

    // Ignore if user is not starting a stream
    if (!isStreaming) return

    // Check if user exists in database and return their data
    const fetchedUser = await checkUser(user)

    // Check if fetchedUser is not streaming
    if (fetchedUser.isStreaming === false) {
      // Update user stream status
      await updateStreamStatus(fetchedUser, true)
      console.log(`${fetchedUser.username} started streaming! - Send a message to a channel!`)
      /* SEND A MESSAGE TO A CHANNEL USING USER OBJECT
      User object contains twitchUrl, streamHeading and streamGame
      */
      return
    }

    // Check if user stops streaming
    const isStreamEnding = oldPresence.activities.some((oldActivity) => {
      const newPresenceIsNotStreaming = newPresence.activities.some(
        (newActivity) => newActivity.type !== 1,
      )

      // If user's old presence was streaming and new presence is not streaming, user is ending the stream
      if (oldActivity.type === 1 && newPresenceIsNotStreaming) {
        return true
      }
      return false
    })

    if (isStreamEnding) {
      // Update user stream status
      await updateStreamStatus(fetchedUser, false)
      console.log(`${fetchedUser.username} stopped streaming!`)
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports = handlePresence
