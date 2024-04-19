const apiClient = require('../configs/bot_token_config')
const TartarosError = require('../classes/TartarosError')
const axios = require('axios')
const {
  STREAM_NOTIFICATION_CHANNEL,
  TWITCH_CLIENT_ID,
} = require('../configs/constants')
const { getTokenFromDB } = require('../configs/token_config')
const { client } = require('../configs/bot_config')
const { EmbedBuilder } = require('discord.js')

const areNotificationsEnabled = process.env.NOTIFICATIONS_ENABLED === 'true'

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

    if (isStreaming) {
      console.log(`${user.username} started streaming!`)
    } else {
      console.log(`${user.username} stopped streaming!`)
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const announceStream = async (user) => {
  if (!user.twitchUrl && !areNotificationsEnabled) {
    console.log(`Striimin ilmoituksessa ilmeni virhe:
      Ilmoitukset päällä: ${areNotificationsEnabled}
      Twitch url: ${user.twitchUrl !== undefined}
    `)

    return
  }

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

module.exports = {
  announceStream,
  updateStreamStatus,
}