const { client } = require('../configs/bot_config')
const apiClient = require('../configs/bot_token_config')
const { google } = require('googleapis')
const {
  TARTAROS_NOTIFICATIONS,
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
} = require('../configs/constants')

const saveLatestVideoIdToDb = async (newLatestVideoId) => {
  try {
    await apiClient.post('/videos', { videoId: newLatestVideoId })
  } catch (error) {
    console.error(`Could not save new latest video: ${error}`)
  }
}

const getLatestVideoId = async () => {
  try {
    const { data } = await apiClient.get('/videos')
    const latestVideoId = data?.videoId

    return latestVideoId
  } catch (error) {
    console.error('Could not fetch latest videoId from DB! ', error)
  }
}

const checkForVideos = async () => {
  console.log('Fetching latest video from YouTube...')

  const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY,
  })

  try {
    const response = await youtube.search.list({
      part: 'snippet',
      channelId: YOUTUBE_CHANNEL_ID,
      order: 'date',
      maxResults: 1,
    })

    const video = response?.data?.items[0]
    const lastVideoId = await getLatestVideoId()

    if (video && video.id.videoId !== lastVideoId) {
      const notificationChannel = await client.channels.fetch(
        TARTAROS_NOTIFICATIONS,
      )
      await notificationChannel.send(
        `Uusi video julkaistu! Käyhän kurkkaamassa - https://www.youtube.com/watch?v=${video.id.videoId}`,
      )
      await saveLatestVideoIdToDb(video.id.videoId)
    }
  } catch (error) {
    console.log('Error checking videos from channel! ', error)
  }
}

module.exports = {
  checkForVideos,
}
