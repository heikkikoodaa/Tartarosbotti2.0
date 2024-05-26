const express = require('express')
const router = express.Router()
const Video = require('../models/video')

router.get('/', async (req, res) => {
  try {
    const latestVideoId = await Video.findOne({}).lean()

    if (!latestVideoId) {
      res.send({
        success: false,
        message: 'Could not fetch latest video!',
      })
      return
    }

    res.send({
      success: true,
      videoId: latestVideoId?.videoId,
    })
  } catch (error) {
    res.send({
      success: false,
      message: 'Could not fetch latest videoId',
      errorMessage: error.message || error,
    })
  }
})

router.post('/', async (req, res) => {
  const { videoId } = req.body

  try {
    if (!videoId) {
      res.send({ success: false, message: 'videoId is missing from body' })
      return
    }

    await Video.findOneAndUpdate({}, { videoId }, { upsert: true, new: true })

    res.send({
      success: true,
      latestVideo: videoId,
    })
  } catch (error) {
    res.send({
      success: false,
      message: 'Could not save latest videoId to DB',
      errorMessage: error.message || error,
    })
  }

})

module.exports = router
