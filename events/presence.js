const { checkUser } = require('../utils/userFunctions')
const { ActivityType } = require('discord.js')
const { announceStream, updateStreamStatus } = require('../utils/streamHelpers')

const handlePresence = async (oldPresence, newPresence) => {
  try {
    // Ignore if presence update is not from a user
    if (newPresence.user.bot) return

    /**
     * @type {User}
     */
    const user = newPresence.user
    const userAvatar = user.avatarURL()

    const newStreamingActivity = newPresence?.activities?.find(
      (activity) => activity.type === ActivityType.Streaming,
    )

    const oldStreamingActivity = oldPresence?.activities?.find(
      (activity) => activity.type === ActivityType.Streaming,
    )

    if (newStreamingActivity && !oldStreamingActivity) {
      const fetchedUser = await checkUser(user)

      if (fetchedUser.isStreaming) return

      fetchedUser.avatar = userAvatar
      fetchedUser.twitchUrl = newStreamingActivity.url
      fetchedUser.streamHeading = newStreamingActivity.details
      fetchedUser.streamGame = newStreamingActivity.state

      const isUpdateSuccessful = await updateStreamStatus(fetchedUser, true)

      if (isUpdateSuccessful) {
        announceStream(fetchedUser)
      }
    }

    if (oldStreamingActivity && !newStreamingActivity) {
      const fetchedUser = await checkUser(user)

      if (!fetchedUser.isStreaming) return

      await updateStreamStatus(fetchedUser, false)
    }
  } catch (error) {
    console.log(`[ERROR]: handlePresence - ${error.message}`)
  }
}

module.exports = {
  handlePresence,
  announceStream,
}
