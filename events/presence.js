const axios = require('axios')
const TartarosError = require('../classes/TartarosError')
const {
  STREAM_NOTIFICATION_CHANNEL,
  TWITCH_CLIENT_ID,
} = require('../configs/constants')
const { checkUser } = require('../utils/userFunctions')
const { client } = require('../configs/bot_config')
// eslint-disable-next-line no-unused-vars
const { ActivityType, EmbedBuilder, User } = require('discord.js')
const { getTokenFromDB } = require('../configs/token_config')
const apiClient = require('../configs/bot_token_config')

const areNotificationsEnabled = process.env.NOTIFICATIONS_ENABLED === 'true'

const updateStreamStatus = async (user, isStreaming) => {
  const newStreamStatus = {
    isStreaming: isStreaming,
    twitchUrl: user.twitchUrl,
  }

  try {
    const { data } = await apiClient.patch(
      `/users/${user.discordId}`,
      newStreamStatus,
    )

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

const getGameInfo = async (game) => {
  try {
    const baseUrl = 'https://api.igdb.com/v4'
    const token = await getTokenFromDB()

    const { data } = await axios.post(
      `${baseUrl}/games`,
      `search "${game}"; fields name, cover.url; where category = 0;`,
      {
        headers: {
          Accept: 'application/json',
          'Client-ID': TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (data.length > 0) {
      const gameData = data[0]

      if (gameData.cover.url) {
        const originalUrl = gameData.cover.url
        let newUrl = originalUrl.startsWith('//')
          ? 'https:' + originalUrl
          : originalUrl
        newUrl = newUrl.replace('t_thumb', 't_cover_big')

        gameData.cover.url = newUrl
      }

      return gameData
    } else {
      console.log('No games found with that name')
      return null
    }
  } catch (error) {
    console.error(`[ERROR]: Error when fetching game data - ${error}`)
    return null
  }
}

const announceStream = async (user) => {
  const channel = client.channels.cache.get(STREAM_NOTIFICATION_CHANNEL)
  const gameData = await getGameInfo(user.streamGame)

  if (channel) {
    const streamEmbed = new EmbedBuilder()
      .setColor('#825791')
      .setTitle(
        user.streamHeading || `Käyttäjän ${user.username} striimi alkaa`,
      )
      .setURL(user.twitchUrl)
      .setAuthor({
        name: user.username,
        iconURL: user.avatar,
      })
      .addFields({ name: 'Peli', value: user.streamGame || 'Tuntematon peli' })
      .setImage(gameData.cover.url || null)

    channel.send({
      content: `Mitäs tämä on? ${user.username} aloitti striimin!`,
      embeds: [streamEmbed],
    })
  } else {
    console.error('Striimi-ilmoituskanavaa ei löytynyt!')
  }
}

const handlePresence = async (oldPresence, newPresence) => {
  // Ignore if presence update is not from a user
  if (newPresence.user.bot) return

  const isNewActivities = newPresence?.activities.length > 0
  const isOldActivities = oldPresence?.activities.length > 0

  /**
   * @type {User}
   */
  const user = newPresence.user
  const userAvatar = user.avatarURL()
  let fetchedUser

  let isStreamStarting = false
  let wasAlreadyStreaming = false

  try {
    if (!isNewActivities) return

    for (const activity of newPresence.activities) {
      if (activity.type === ActivityType.Streaming) {
        fetchedUser = await checkUser(user)
        fetchedUser.avatar = userAvatar
        fetchedUser.twitchUrl = activity.url
        fetchedUser.streamHeading = activity.details
        fetchedUser.streamGame = activity.state
        isStreamStarting = true
        break
      }
    }

    if (isOldActivities) {
      for (const activity of oldPresence.activities) {
        if (activity.type === ActivityType.Streaming) {
          wasAlreadyStreaming = true
        }
        break
      }
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