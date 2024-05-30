const { client } = require('../configs/bot_config')
const apiClient = require('../configs/bot_token_config')
const { google } = require('googleapis')
const {
  TARTAROS_NOTIFICATIONS,
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
} = require('../configs/constants')

let intervalId

// 30 minute interval
const CHECK_INTERVAL_IN_MINUTES = 30 * 60 * 1000

// 24 hour break
const TIMEOUT_UNTIL_NEW_VIDEO_CHECK = 24 * 60 * 60 * 1000

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
    if (error?.errors?.length) {
      const youtubeError = error.errors[0]

      if (youtubeError.reason === 'quotaExceeded') {
        console.error('Daily quota exceeded. Disabling checks for 24 hours')
        clearInterval(intervalId)
        setTimeout(() => {
          console.log('Resuming new video checks')
          intervalId = setInterval(() => checkForVideos(), CHECK_INTERVAL_IN_MINUTES)
        }, TIMEOUT_UNTIL_NEW_VIDEO_CHECK)
      }

      return
    }
    console.log('Error checking videos from channel! ', error)
  }
}

module.exports = {
  checkForVideos,
  startCheckingForVideos: () => {
    intervalId = setInterval(() => checkForVideos(), CHECK_INTERVAL_IN_MINUTES)
  },
}
