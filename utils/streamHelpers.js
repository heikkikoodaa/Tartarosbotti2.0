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
const { streamAnnouncements } = require('./streamAnnouncements')

const areNotificationsEnabled = process.env.NOTIFICATIONS_ENABLED === 'true'

const getGameInfo = async (gameName) => {
  if (!gameName) {
    console.log('No game name provided to getGameInfo.')
    return null
  }

  try {
    const baseUrl = 'https://api.igdb.com/v4'
    const token = await getTokenFromDB()
    const headers = {
      Accept: 'application/json',
      'Client-ID': TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    }

    let gameData = null

    // 1. Try finding an exact match first
    try {
      const exactMatchQuery = `fields name, cover.url; where name = "${gameName}" & category = 0; limit 1;`
      const exactResponse = await axios.post(`${baseUrl}/games`, exactMatchQuery, { headers })

      if (exactResponse.data.length > 0) {
        console.log(`Found exact match for "${gameName}"`)
        gameData = exactResponse.data[0]
      }
    } catch (error) {
      console.warn(`[WARN]: Error during exact match search for "${gameName}" - ${error.message}. Falling back to search.`)
    }

    // 2. If no exact match, fall back to search and find the best fit
    if (!gameData) {
      console.log(`No exact match found for "${gameName}". Falling back to search.`)
      const searchResponse = await axios.post(
        `${baseUrl}/games`,
        `search "${gameName}"; fields name, cover.url; where category = 0; limit 10;`,
        { headers },
      )

      if (searchResponse.data.length > 0) {
        const perfectMatch = searchResponse.data.find(game => game.name.toLowerCase() === gameName.toLowerCase())

        if (perfectMatch) {
          console.log(`Found perfect match within search results for "${gameName}"`)
          gameData = perfectMatch
        } else {
          console.log(`No perfect match in search results for "${gameName}". Using first result.`)
          gameData = searchResponse.data[0]
        }
      }
    }

    if (gameData) {
      if (gameData?.cover?.url) {
        const originalUrl = gameData.cover.url
        let newUrl = originalUrl.startsWith('//')
          ? 'https:' + originalUrl
          : originalUrl
        newUrl = newUrl.replace('t_thumb', 't_cover_big')
        gameData.cover.url = newUrl
      }
      console.log(`Selected game: ${gameData.name}`)
      return gameData
    }

    console.log(`No games found matching "${gameName}"`)
    return null
  } catch (error) {
    if (error.response) {
      console.error(`[ERROR]: IGDB API Error - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`)
    } else if (error.request) {
      console.error('[ERROR]: IGDB API Error - No response received:', error.request)
    } else {
      console.error('[ERROR]: IGDB API Error - Request setup error:', error.message)
    }
    console.error(`[ERROR]: Error when fetching game data for "${gameName}" - ${error}`)
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
    console.error(`[Error]: ${error}`)
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
    const randomIndex = Math.floor(Math.random() * streamAnnouncements.length)
    const randomAnnouncement = streamAnnouncements[randomIndex]

    const announcementContent = randomAnnouncement.replace(/X/g, user.username)

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
      .setImage(gameData?.cover?.url || null)

    channel.send({
      content: announcementContent,
      embeds: [streamEmbed],
    })
  } else {
    console.error('[Error]: Striimi-ilmoituskanavaa ei löytynyt!')
  }
}

module.exports = {
  announceStream,
  updateStreamStatus,
  getGameInfo,
}
