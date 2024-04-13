const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/:id', async (req, res) => {
  // If id is not given, stop execution
  if (!req.params.id) {
    res.send({ success: false, message: 'ID param was not specified. This action is not allowed!' })
    return
  }

  // Get user by id
  const user = await User.findOne({ discordId: req.params.id }).lean()

  // If user does not exist, return error
  if (!user) {
    res.send({ success: false, message: 'User not found' })
    return
  }

  // If user exists, return user
  res.send({ success: true, user: user })
})

router.post('/', async (req, res) => {
  // Create new user
  const { discordId, username, twitchUrl } = req.body

  if (!discordId || !username) {
    return res.send({ success: false, message: 'Missing required fields' })
  }

  const newUser = new User({
    discordId: discordId,
    username: username,
    twitchUrl: twitchUrl,
  })

  try {
    await newUser.save()
    res.send({ success: true, message: 'User created', user: newUser })
  } catch (error) {
    res.send({
      success: false,
      message: 'User could not be created',
      errorMessage: error,
    })
  }
})

router.patch('/:id', async (req, res) => {
  const { isStreaming: newStatus, twitchUrl } = req.body

  try {
    // Find user with their DiscordId
    const user = await User.findOne({ discordId: req.params.id })

    if (user.twitchUrl !== twitchUrl) {
      user.twitchUrl = twitchUrl
    }

    user.isStreaming = newStatus

    if (newStatus) {
      user.streamAmount += 1
    }

    await user.save()

    res.send({
      success: true,
      message: `Stream status updated to ${newStatus}`,
    })
  } catch (error) {
    res.send({ success: false, message: 'Stream status could not be updated' })
  }
})

module.exports = router
